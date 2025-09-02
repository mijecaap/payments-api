#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para validar variables de entorno de Supabase
 */

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_KEY',
  'DB_HOST',
  'DB_PASSWORD',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'SUPABASE_STORAGE_BUCKET',
  'NODE_ENV',
  'PORT'
];

function validateEnvironment() {
  console.log('🔍 Validando variables de entorno...\n');

  // Cargar variables de entorno
  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  let hasErrors = false;
  let warnings = [];

  // Validar variables requeridas
  console.log('📋 Variables Requeridas:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: NO DEFINIDA`);
      hasErrors = true;
    } else if (value.includes('tu_') || value.includes('tu-proyecto')) {
      console.log(`⚠️  ${varName}: Valor de ejemplo detectado`);
      warnings.push(varName);
    } else {
      console.log(`✅ ${varName}: OK`);
    }
  });

  console.log('\n📋 Variables Opcionales:');
  optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`⚪ ${varName}: No definida (opcional)`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  });

  // Validaciones específicas
  console.log('\n🔬 Validaciones Específicas:');

  // Validar formato de URL de Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
    console.log('❌ SUPABASE_URL: Formato inválido. Debe ser https://[proyecto].supabase.co');
    hasErrors = true;
  } else if (supabaseUrl) {
    console.log('✅ SUPABASE_URL: Formato válido');
  }

  // Validar host de base de datos
  const dbHost = process.env.DB_HOST;
  if (dbHost && !dbHost.match(/^db\.[a-z0-9]+\.supabase\.co$/)) {
    console.log('❌ DB_HOST: Formato inválido. Debe ser db.[proyecto].supabase.co');
    hasErrors = true;
  } else if (dbHost) {
    console.log('✅ DB_HOST: Formato válido');
  }

  // Validar longitud de JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.log('⚠️  JWT_SECRET: Recomendado mínimo 32 caracteres para seguridad');
    warnings.push('JWT_SECRET');
  } else if (jwtSecret) {
    console.log('✅ JWT_SECRET: Longitud adecuada');
  }

  // Resumen final
  console.log('\n📊 Resumen de Validación:');
  
  if (hasErrors) {
    console.log('❌ Errores encontrados. Corrige las variables marcadas antes de continuar.');
    console.log('\n💡 Ayuda:');
    console.log('1. Verifica que tu archivo .env existe en la raíz del proyecto');
    console.log('2. Obtén las credenciales reales desde tu dashboard de Supabase');
    console.log('3. Asegúrate de no usar valores de ejemplo');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} advertencias encontradas:`);
    warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
    console.log('\n💡 Aunque puedes continuar, es recomendable revisar estas variables.');
  }

  if (!hasErrors && warnings.length === 0) {
    console.log('✅ Todas las variables están configuradas correctamente');
  }

  console.log('\n🚀 Configuración lista para usar con Supabase!');
  
  // Mostrar próximos pasos
  console.log('\n📝 Próximos pasos sugeridos:');
  console.log('1. npm run test-connection     # Probar conexión a Supabase');
  console.log('2. npm run setup-database     # Crear tablas y estructura');
  console.log('3. npm run seed-database      # Cargar datos de ejemplo');
  console.log('4. npm run start:dev          # Iniciar aplicación');
}

// Función para generar archivo .env de ejemplo
function createExampleEnv() {
  const examplePath = path.join(__dirname, '.env.example');
  const targetPath = path.join(__dirname, '../.env');

  if (fs.existsSync(targetPath)) {
    console.log('⚠️  El archivo .env ya existe. No se sobrescribirá.');
    return;
  }

  try {
    fs.copyFileSync(examplePath, targetPath);
    console.log('✅ Archivo .env creado desde .env.example');
    console.log('📝 Edita el archivo .env con tus credenciales reales de Supabase');
  } catch (error) {
    console.error('❌ Error al crear archivo .env:', error.message);
  }
}

// Ejecutar según argumentos
const command = process.argv[2];

switch (command) {
  case 'create-env':
    createExampleEnv();
    break;
  case 'validate':
  default:
    validateEnvironment();
    break;
}