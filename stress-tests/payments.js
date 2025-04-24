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
    'successful_transfers': ['count>100']       // Al menos 100 transferencias exitosas
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
  
  const transferRes = http.post(
    `${config.baseUrl}/transactions`,
    JSON.stringify({
      originAccountId: originAccountId,
      destinationAccountId: destinationAccountId,
      amount: amount
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

  const amount = Math.random() * 10 + 0.1; // Entre 0.1 y 10.1 soles

  makeTransfer(
    token,
    config.accounts[originIndex],
    config.accounts[destIndex],
    Number(amount.toFixed(2))
  );

  // Esperar entre 1 y 2 segundos entre transferencias
  sleep(Math.random() + 1);
}