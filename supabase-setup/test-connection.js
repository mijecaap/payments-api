#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

/**
 * Script para probar la conexión con Supabase
 */

async function testSupabaseConnection() {
  console.log('🔌 Probando conexión con Supabase...\n');

  // Cargar variables de entorno
  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Error: Variables SUPABASE_URL y SUPABASE_ANON_KEY son requeridas');
    console.log('💡 Ejecuta: npm run validate-env para verificar configuración');
    process.exit(1);
  }

  try {
    // 1. Probar cliente público
    console.log('1️⃣ Probando cliente público (anon key)...');
    const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

    // Test básico: obtener información del proyecto
    const { data: healthCheck, error: healthError } = await supabasePublic
      .from('pg_stat_activity')
      .select('count')
      .limit(1);

    if (healthError && healthError.code !== 'PGRST116') {
      console.log(`⚠️  Cliente público conectado pero con limitaciones: ${healthError.message}`);
    } else {
      console.log('✅ Cliente público: Conexión exitosa');
    }

    // 2. Probar cliente administrativo (si existe)
    if (supabaseServiceKey) {
      console.log('\n2️⃣ Probando cliente administrativo (service key)...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      // Test administrativo: listar tablas del schema público
      const { data: tables, error: tablesError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);

      if (tablesError) {
        console.log(`❌ Cliente administrativo: ${tablesError.message}`);
      } else {
        console.log('✅ Cliente administrativo: Conexión exitosa');
        console.log(`📊 Tablas encontradas: ${tables?.length || 0}`);
        
        if (tables && tables.length > 0) {
          console.log('   Ejemplos:', tables.slice(0, 3).map(t => t.table_name).join(', '));
        }
      }

      // 3. Probar Storage
      console.log('\n3️⃣ Probando Supabase Storage...');
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'candidatos-media';
      
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        console.log(`❌ Storage: ${bucketsError.message}`);
      } else {
        console.log('✅ Storage: Conexión exitosa');
        const bucketExists = buckets.find(b => b.name === bucketName);
        
        if (bucketExists) {
          console.log(`✅ Bucket '${bucketName}': Encontrado`);
        } else {
          console.log(`⚠️  Bucket '${bucketName}': No existe (se puede crear después)`);
        }
      }

      // 4. Verificar tablas específicas del proyecto
      console.log('\n4️⃣ Verificando esquema de candidatos...');
      const expectedTables = [
        'candidates',
        'political_parties', 
        'proposals',
        'categories',
        'polls',
        'campaign_events'
      ];

      const { data: projectTables, error: projectError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', expectedTables);

      if (projectError) {
        console.log(`❌ Error verificando tablas: ${projectError.message}`);
      } else {
        const foundTables = projectTables?.map(t => t.table_name) || [];
        const missingTables = expectedTables.filter(t => !foundTables.includes(t));

        console.log(`📊 Tablas del proyecto encontradas: ${foundTables.length}/${expectedTables.length}`);
        
        if (foundTables.length > 0) {
          console.log('✅ Encontradas:', foundTables.join(', '));
        }
        
        if (missingTables.length > 0) {
          console.log('⚠️  Faltantes:', missingTables.join(', '));
          console.log('💡 Ejecuta: npm run setup-database para crear las tablas');
        }

        // Test de datos de ejemplo
        if (foundTables.includes('candidates')) {
          const { data: candidatesCount, error: countError } = await supabaseAdmin
            .from('candidates')
            .select('id', { count: 'exact', head: true });

          if (!countError) {
            console.log(`👥 Candidatos en base de datos: ${candidatesCount?.length || 0}`);
          }
        }
      }
    }

    // 5. Información del proyecto
    console.log('\n📋 Información del Proyecto:');
    console.log(`🌐 URL: ${supabaseUrl}`);
    console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    console.log(`🔐 Service Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'No configurada'}`);

    console.log('\n✅ Pruebas de conexión completadas exitosamente!');
    
    // Próximos pasos
    console.log('\n📝 Próximos pasos recomendados:');
    if (!tables || tables.length === 0) {
      console.log('1. npm run setup-database     # Crear estructura de base de datos');
      console.log('2. npm run seed-database      # Cargar datos de ejemplo');
    } else {
      console.log('1. npm run start:dev          # Iniciar aplicación');
      console.log('2. Acceder a http://localhost:4000/api-docs');
    }

  } catch (error) {
    console.log('\n❌ Error de conexión:');
    console.log(`   ${error.message}`);
    
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que las URLs y claves sean correctas');
    console.log('2. Verificar que el proyecto Supabase esté activo');
    console.log('3. Verificar la conexión a internet');
    console.log('4. Ejecutar: npm run validate-env');
    
    process.exit(1);
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log('🔌 Test de Conexión Supabase');
  console.log('\nUso:');
  console.log('  npm run test-connection');
  console.log('  node test-connection.js');
  console.log('\nEste script verifica:');
  console.log('  ✓ Conexión con cliente público');
  console.log('  ✓ Conexión con cliente administrativo');
  console.log('  ✓ Acceso a Supabase Storage');
  console.log('  ✓ Existencia de tablas del proyecto');
  console.log('  ✓ Datos de ejemplo cargados');
}

// Ejecutar según argumentos
const command = process.argv[2];

switch (command) {
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    testSupabaseConnection();
    break;
}