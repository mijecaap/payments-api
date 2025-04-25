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

// Configuración de la prueba
export const options = {
  scenarios: {
    // Escenario de carga constante
    constant_load: {
      executor: 'constant-vus',
      vus: 50,        // 50 usuarios virtuales
      duration: '30s' // durante 30 segundos
    },
    // Escenario de rampa de carga
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 100 }, // Subir a 100 VUs en 20s
        { duration: '30s', target: 100 }, // Mantener 100 VUs por 30s
        { duration: '10s', target: 0 }    // Bajar a 0 VUs en 10s
      ]
    }
  },
  thresholds: {
    'transfer_success_rate': ['rate>=0.95'],    // 95% de éxito
    'http_req_duration': ['p(95)<=2000'],      // 95% bajo 2s
    'successful_transfers': ['count>100'],      // Al menos 100 transferencias exitosas
    'insufficient_funds_errors': ['count<10']   // Menos de 10 errores por saldo insuficiente
  }
};

// Función para obtener token de autenticación
function getAuthToken(email, password) {
  const loginRes = http.post(`${config.baseUrl}/auth/login`, JSON.stringify({
    email: email,
    password: password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  return loginRes.json('access_token');
}

// Función para realizar una transferencia
function makeTransfer(token, originAccountId, destinationAccountId, amount) {
  const startTime = new Date();
  
  // Calcular el monto total necesario (monto + 1% de comisión)
  const commission = Math.max(0.01, Number((amount * 0.01).toFixed(2)));
  const totalAmount = amount;
  
  const transferRes = http.post(
    `${config.baseUrl}/transactions`,
    JSON.stringify({
      originAccountId: originAccountId,
      destinationAccountId: destinationAccountId,
      amount: totalAmount
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const duration = new Date() - startTime;
  transferDuration.add(duration);

  // Analizar respuesta
  const success = check(transferRes, {
    'transfer successful': (r) => r.status === 201,
  });

  if (success) {
    successfulTransfers.add(1);
  } else {
    transferErrors.add(1);
    if (transferRes.body.includes('deadlock')) {
      deadlockErrors.add(1);
    }
    if (transferRes.body.includes('saldo insuficiente')) {
      insufficientFundsErrors.add(1);
    }
  }

  transferRate.add(success);
}

// Función principal de la prueba
export default function () {
  // Seleccionar usuario aleatorio
  const userIndex = Math.floor(Math.random() * config.users.length);
  const user = config.users[userIndex];
  
  // Obtener token
  const token = getAuthToken(user.email, user.password);

  // Realizar transferencia aleatoria
  const originIndex = Math.floor(Math.random() * config.accounts.length);
  let destIndex;
  do {
    destIndex = Math.floor(Math.random() * config.accounts.length);
  } while (destIndex === originIndex);

  // Monto entre 0.1 y 5 soles para evitar problemas de saldo insuficiente
  const amount = Number((Math.random() * 4.9 + 0.1).toFixed(2));

  makeTransfer(
    token,
    config.accounts[originIndex],
    config.accounts[destIndex],
    amount
  );

  // Esperar entre 1 y 2 segundos entre transferencias
  sleep(Math.random() + 1);
}