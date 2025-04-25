export const config = {
  // En Windows, cuando se ejecuta desde Docker, necesitamos usar host.docker.internal
  baseUrl: 'http://host.docker.internal:4000/api',
  requestTimeout: '10s',
  // Credenciales de prueba - asegúrate de que estos usuarios existan en la base de datos
  users: [
    {
      email: 'juan@ejemplo.com',
      password: 'password123'
    },
    {
      email: 'maria@ejemplo.com',
      password: 'password123'
    },
    {
      email: 'carlos@ejemplo.com',
      password: 'password123'
    }
  ],
  // Números de cuenta según la base de datos
  accountNumbers: {
    2: '8381392690', // Cuenta de Juan (usuario 2)
    3: '4905437908', // Cuenta de María (usuario 3)
    4: '4486111974'  // Cuenta de Carlos (usuario 4)
  },
  // IDs de cuentas - excluimos la cuenta del sistema (ID 1)
  accounts: [2, 3, 4],
  // Configuración de reintentos
  maxRetries: 3,
  retryDelay: 1000, // ms
  // Límites de transferencia
  minAmount: 0.1,
  maxAmount: 5.0
};