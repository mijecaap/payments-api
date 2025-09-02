# Guía de Instalación - Plataforma Electoral Perú 2026

## 📋 Prerrequisitos

- Node.js 18+ instalado
- npm o yarn como gestor de paquetes
- Cuenta en [Supabase](https://supabase.com)
- Git para clonar el repositorio

## 🚀 Pasos de Instalación

### 1. Crear Proyecto en Supabase

1. **Ir a Supabase**
   - Visita [https://supabase.com](https://supabase.com)
   - Crea una cuenta o inicia sesión

2. **Crear Nuevo Proyecto**
   ```
   - Clic en "New Project"
   - Organization: Selecciona tu organización
   - Nombre: "peru-elecciones-2026"
   - Database Password: Genera una contraseña segura (¡GUÁRDALA!)
   - Región: "South America (São Paulo)" - más cercana a Perú
   - Plan: "Free" (para desarrollo)
   ```

3. **Esperar Creación del Proyecto**
   - El proyecto tardará 2-5 minutos en estar listo
   - Recibirás las credenciales del proyecto

### 2. Obtener Credenciales del Proyecto

En el dashboard de tu proyecto Supabase:

1. **Ir a Settings > API**
2. **Copiar las siguientes credenciales:**
   ```
   Project URL: https://tu-proyecto-id.supabase.co
   API Key (anon/public): eyJhbGciOiJIUzI1NiIsInR5cCI6...
   API Key (service_role): eyJhbGciOiJIUzI1NiIsInR5cCI6... (¡SECRETA!)
   ```

3. **Ir a Settings > Database**
4. **Copiar la información de conexión:**
   ```
   Host: db.tu-proyecto-id.supabase.co
   Database name: postgres
   Username: postgres
   Password: [la que estableciste al crear el proyecto]
   Port: 5432
   ```

### 3. Configurar Variables de Entorno

1. **Copiar archivo de ejemplo**
   ```bash
   cp supabase-setup/.env.example .env
   ```

2. **Editar archivo .env con tus credenciales reales:**
   ```env
   # Reemplazar con tus valores reales
   SUPABASE_URL=https://tu-proyecto-real.supabase.co
   SUPABASE_ANON_KEY=tu_clave_anonima_real
   SUPABASE_SERVICE_KEY=tu_clave_servicio_real
   
   DB_HOST=db.tu-proyecto-real.supabase.co
   DB_PASSWORD=tu_password_real_de_bd
   
   JWT_SECRET=generar_un_secreto_seguro_aqui
   ```

### 4. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install --legacy-peer-deps

# Instalar cliente de Supabase
npm install @supabase/supabase-js

# Instalar dependencias adicionales para archivos
npm install multer @types/multer
```

### 5. Ejecutar Migraciones de Base de Datos

#### Opción A: Usando SQL Editor de Supabase (Recomendado)

1. **Ir al SQL Editor en Supabase**
   - En el dashboard, clic en "SQL Editor"

2. **Ejecutar Schema Principal**
   - Copia el contenido de `supabase-setup/schema.sql`
   - Pega en el editor SQL
   - Clic en "Run"

3. **Ejecutar Datos Semilla**
   - Copia el contenido de `supabase-setup/seed-data.sql`
   - Pega en el editor SQL
   - Clic en "Run"

#### Opción B: Usando psql (Avanzado)

```bash
# Conectar a la base de datos
psql "postgresql://postgres:[tu-password]@db.[tu-proyecto-id].supabase.co:5432/postgres"

# Ejecutar schema
\i supabase-setup/schema.sql

# Ejecutar datos semilla
\i supabase-setup/seed-data.sql

# Salir
\q
```

### 6. Configurar Storage en Supabase

1. **Ir a Storage en Supabase Dashboard**

2. **Crear Bucket**
   ```
   - Clic en "Create bucket"
   - Nombre: "candidatos-media"
   - Public bucket: ✅ Sí (para acceso público a fotos)
   ```

3. **Crear Folders**
   ```
   - photos/ (fotos de candidatos)
   - logos/ (logos de partidos)
   - documents/ (documentos de propuestas)
   - events/ (fotos de eventos)
   ```

### 7. Configurar Políticas de Seguridad (RLS)

En el SQL Editor de Supabase, ejecuta:

```sql
-- Permitir lectura pública de Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('candidatos-media', 'candidatos-media', true);

-- Política para subir archivos (solo autenticados)
CREATE POLICY "Usuarios autenticados pueden subir archivos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'candidatos-media');

-- Política para lectura pública
CREATE POLICY "Acceso público a archivos" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'candidatos-media');
```

### 8. Probar la Instalación

```bash
# Compilar el proyecto
npm run build

# Iniciar en modo desarrollo
npm run start:dev
```

La aplicación debería estar disponible en:
- API: http://localhost:4000
- Documentación: http://localhost:4000/api-docs

### 9. Verificar Base de Datos

1. **Ir a Table Editor en Supabase**
2. **Verificar que existan las tablas:**
   - candidates
   - political_parties
   - proposals
   - categories
   - polls
   - campaign_events
   - news

3. **Verificar datos de prueba:**
   - Debería haber 6 candidatos de ejemplo
   - 10 partidos políticos
   - 10 categorías de propuestas
   - Propuestas de ejemplo para cada candidato

### 10. Configurar Autenticación (Opcional)

1. **Ir a Authentication > Settings en Supabase**

2. **Configurar proveedores:**
   ```
   - Email: ✅ Habilitado
   - Google: Opcional
   - Facebook: Opcional
   ```

3. **Configurar URLs:**
   ```
   Site URL: http://localhost:3000 (para desarrollo)
   Redirect URLs: http://localhost:3000/auth/callback
   ```

## 🔧 Comandos Útiles Post-Instalación

```bash
# Ver logs de la aplicación
npm run start:dev

# Ejecutar tests
npm test

# Linting del código
npm run lint

# Formatear código
npm run format:write

# Generar nueva migración
npm run migration:generate src/migrations/NombreMigracion

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert
```

## 📊 Verificar Instalación Exitosa

### Endpoints de Prueba

```bash
# Obtener todos los candidatos
curl http://localhost:4000/api/candidates

# Obtener propuestas por categoría
curl http://localhost:4000/api/proposals?category=economia

# Obtener últimas encuestas
curl http://localhost:4000/api/polls/latest

# Obtener noticias recientes
curl http://localhost:4000/api/news?limit=5
```

### Dashboard de Supabase

1. **Table Editor**: Ver y editar datos
2. **SQL Editor**: Ejecutar consultas personalizadas
3. **Storage**: Gestionar archivos multimedia
4. **Authentication**: Gestionar usuarios
5. **API**: Ver documentación automática

## 🚨 Solución de Problemas Comunes

### Error de Conexión a Base de Datos

```bash
# Verificar variables de entorno
echo $DB_HOST
echo $DB_PASSWORD

# Probar conexión manual
psql "postgresql://postgres:password@db.proyecto.supabase.co:5432/postgres"
```

### Error de Permisos en Storage

```sql
-- Verificar políticas RLS
SELECT * FROM storage.buckets WHERE id = 'candidatos-media';
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Error de Migraciones

```bash
# Verificar estado de migraciones
npm run typeorm -- migration:show

# Sincronizar (solo desarrollo)
npm run typeorm -- schema:sync
```

## 📱 Próximos Pasos

1. **Desarrollar Frontend**: React, Vue.js o Angular
2. **Implementar Búsqueda**: Elasticsearch o Algolia
3. **Añadir Notificaciones**: Push notifications
4. **Configurar CDN**: Para mejor rendimiento
5. **Implementar Cache**: Redis para consultas frecuentes
6. **Monitoreo**: Sentry, LogRocket o DataDog
7. **Tests E2E**: Cypress o Playwright
8. **CI/CD**: GitHub Actions o GitLab CI

## 📞 Soporte

- **Documentación Supabase**: https://supabase.com/docs
- **Documentación NestJS**: https://docs.nestjs.com
- **Documentación TypeORM**: https://typeorm.io