import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { config } from './config.js';

// Métricas personalizadas
const transferErrors = new Counter('transfer_errors');
const deadlockErrors = new Counter('deadlock_errors');
const successfulTransfers = new Counter('successful_transfers');
const transferDuration = new Trend('transfer_duration');
const transferRate = new Rate('transfer_success_rate');
const insufficientFundsErrors = new Counter('insufficient_funds_errors');
const authErrors = new Counter('auth_errors');
const loginAttempts = new Counter('login_attempts');
const loginSuccess = new Counter('login_success');

// Configuración de la prueba
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s'
    },
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 20 },
        { duration: '20s', target: 20 },
        { duration: '10s', target: 0 }
      ]
    }
  },
  thresholds: {
    'http_req_duration': ['p(95)<=5000'],
    'successful_transfers': ['count>50'],
    'transfer_success_rate': ['rate>=0.90'],
    'insufficient_funds_errors': ['count<10']
  }
};

function retryWithBackoff(fn, maxRetries = config.maxRetries) {
  let retries = 0;
  let lastError = null;
  
  while (retries <= maxRetries) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      if (retries >= maxRetries) throw error;
      retries++;
      console.log(`Reintento ${retries}/${maxRetries} después de error: ${error.message}`);
      sleep(Math.pow(2, retries - 1) * (config.retryDelay / 1000));
    }
  }
  throw lastError;
}

function getAuthToken(email, password) {
  loginAttempts.add(1);
  console.log(`\n[${new Date().toISOString()}] Intentando login con email: ${email}`);
  
  return retryWithBackoff(() => {
    console.log(`[${new Date().toISOString()}] Enviando petición de login a ${config.baseUrl}/auth/login`);
    
    const loginRes = http.post(
      `${config.baseUrl}/auth/login`,
      JSON.stringify({ email, password }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: config.requestTimeout
      }
    );

    console.log(`[${new Date().toISOString()}] Respuesta login - Status: ${loginRes.status}`);

    const success = check(loginRes, {
      'login successful': (r) => {
        // Aceptamos tanto 200 como 201 como códigos de éxito
        if (r.status !== 200 && r.status !== 201) {
          console.log(`[${new Date().toISOString()}] Login fallido - Status: ${r.status}`);
          console.log(`[${new Date().toISOString()}] Detalles error:`, r.body);
          return false;
        }
        
        try {
          const body = r.json();
          if (!body.access_token) {
            console.log(`[${new Date().toISOString()}] No se encontró access_token en la respuesta`);
            return false;
          }
          return true;
        } catch (e) {
          console.log(`[${new Date().toISOString()}] Error parseando respuesta JSON:`, e.message);
          return false;
        }
      },
    });

    if (!success) {
      authErrors.add(1);
      throw new Error(`Login fallido: ${loginRes.status} - ${loginRes.body}`);
    }

    loginSuccess.add(1);
    console.log(`[${new Date().toISOString()}] Login exitoso para ${email}`);
    return loginRes.json('access_token');
  });
}

function makeTransfer(token, originAccountId, destinationAccountId, amount) {
  const startTime = new Date();
  
  console.log(`[${new Date().toISOString()}] Iniciando transferencia: Origen=${originAccountId}, Destino=${destinationAccountId}, Monto=${amount}`);

  const destinationAccountNumber = config.accountNumbers[destinationAccountId];

  const transferRes = http.post(
    `${config.baseUrl}/transactions`,
    JSON.stringify({
      originAccountId,
      destinationAccountNumber,
      amount: Number(amount.toFixed(2))
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: config.requestTimeout
    }
  );

  const duration = new Date() - startTime;
  transferDuration.add(duration);

  console.log(`[${new Date().toISOString()}] Respuesta transferencia - Status: ${transferRes.status}`);
  console.log(`[${new Date().toISOString()}] Cuerpo respuesta:`, transferRes.body);

  const success = check(transferRes, {
    'transfer successful': (r) => r.status === 201,
  });

  if (success) {
    successfulTransfers.add(1);
    console.log(`[${new Date().toISOString()}] Transferencia exitosa`);
  } else {
    transferErrors.add(1);
    console.log(`[${new Date().toISOString()}] Error en transferencia: ${transferRes.body}`);
    if (transferRes.body.includes('deadlock')) {
      deadlockErrors.add(1);
    }
    if (transferRes.body.includes('saldo insuficiente')) {
      insufficientFundsErrors.add(1);
    }
  }

  transferRate.add(success);
  return success;
}

// Función principal de la prueba
export default function () {
  try {
    const userIndex = Math.floor(Math.random() * config.users.length);
    const user = config.users[userIndex];
    
    console.log(`\n[${new Date().toISOString()}] Iniciando iteración con usuario: ${user.email}`);
    const token = getAuthToken(user.email, user.password);
    
    if (!token) {
      console.log(`[${new Date().toISOString()}] No se obtuvo token para ${user.email}`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Token obtenido exitosamente para ${user.email}`);
    
    // Mapear el índice del usuario a su ID de cuenta correspondiente
    const originAccountId = userIndex === 0 ? 2 : // juan -> cuenta 2
                          userIndex === 1 ? 3 : // maria -> cuenta 3
                          4; // carlos -> cuenta 4
    
    // Seleccionar una cuenta destino que no sea la propia cuenta
    let destinationAccountId;
    do {
      // Seleccionar aleatoriamente entre las cuentas disponibles (2, 3, 4)
      destinationAccountId = config.accounts[Math.floor(Math.random() * config.accounts.length)];
    } while (destinationAccountId === originAccountId);

    const amount = Number(
      (Math.random() * (config.maxAmount - config.minAmount) + config.minAmount).toFixed(2)
    );

    makeTransfer(
      token,
      originAccountId,
      destinationAccountId,
      amount
    );

    sleep(Math.random() + 0.5);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error en iteración:`, error.message);
  }
}