# Configuración de Supabase para Plataforma Electoral Perú 2026

## 📋 Descripción del Proyecto

Esta plataforma web proporciona información completa sobre los candidatos a la presidencia de Perú para las elecciones de 2026. El objetivo es ayudar a los votantes a tomar decisiones informadas proporcionando:

- Información detallada de candidatos
- Propuestas de gobierno organizadas por temas
- Historial político y experiencia
- Información de partidos políticos
- Encuestas y tendencias

## 🏗️ Arquitectura de la Base de Datos

### Entidades Principales

1. **candidates** - Información de candidatos presidenciales
2. **political_parties** - Partidos políticos y coaliciones
3. **proposals** - Propuestas de gobierno por candidato
4. **categories** - Categorías de propuestas (Economía, Salud, Educación, etc.)
5. **candidate_experience** - Experiencia laboral y política
6. **candidate_education** - Formación académica
7. **polls** - Encuestas y resultados de popularidad
8. **campaign_events** - Eventos de campaña
9. **news** - Noticias y actualizaciones

### Diagrama de Relaciones

```
political_parties (1) ←→ (N) candidates
candidates (1) ←→ (N) proposals
categories (1) ←→ (N) proposals
candidates (1) ←→ (N) candidate_experience
candidates (1) ←→ (N) candidate_education
candidates (1) ←→ (N) polls
candidates (1) ←→ (N) campaign_events
```

## 🚀 Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Clic en "New Project"
4. Configuración recomendada:
   - **Nombre**: `peru-elecciones-2026`
   - **Región**: `South America (São Paulo)` - más cercana a Perú
   - **Plan**: Starter (gratuito para desarrollo)

### Paso 2: Obtener Credenciales

Una vez creado el proyecto, obtén las siguientes credenciales desde el dashboard:

```
Project URL: https://[tu-proyecto].supabase.co
API Key (anon): [tu-clave-publica]
API Key (service_role): [tu-clave-servicio] (¡Mantener segura!)
Database Password: [establecida-durante-creacion]
```

### Paso 3: Configurar Variables de Entorno

Actualiza tu archivo `.env` con las credenciales de Supabase:

```env
# Configuración de Supabase
SUPABASE_URL=https://[tu-proyecto].supabase.co
SUPABASE_ANON_KEY=[tu-clave-publica]
SUPABASE_SERVICE_KEY=[tu-clave-servicio]

# Configuración de Base de Datos (directo a PostgreSQL de Supabase)
DB_HOST=[tu-proyecto].supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[tu-password-bd]
DB_NAME=postgres

# Configuración de la Aplicación
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_para_peru_2026
BCRYPT_SALT_ROUNDS=12
```

## 📦 Instalación de Dependencias

```bash
# Instalar cliente de Supabase
npm install @supabase/supabase-js

# Instalar dependencias adicionales para manejo de archivos
npm install multer @types/multer

# CLI de Supabase (opcional, para desarrollo local)
npm install -g supabase
```

## 🗄️ Estructura de Tablas

Las tablas se crearán mediante migraciones de TypeORM. Los archivos SQL también estarán disponibles en la carpeta `sql/` para ejecución directa en Supabase.

### Ventajas de Supabase para este Proyecto

1. **PostgreSQL Nativo**: Compatible con TypeORM existente
2. **Autenticación Integrada**: Sistema de usuarios listo para usar
3. **Storage**: Para fotos de candidatos, documentos, videos
4. **Real-time**: Actualizaciones en tiempo real para encuestas
5. **API REST automática**: Endpoints generados automáticamente
6. **Panel de administración**: Interface web para gestión de datos
7. **Escalabilidad**: Fácil escalamiento según demanda
8. **Backup automático**: Respaldos automáticos de la base de datos

### Características Específicas para la Plataforma Electoral

- **Row Level Security (RLS)**: Control de acceso granular
- **Triggers**: Para auditoría de cambios en propuestas
- **Full-text search**: Búsqueda avanzada en propuestas y biografías
- **Caching**: Mejora el rendimiento para consultas frecuentes
- **CDN global**: Distribución rápida de contenido multimedia

## 📱 Próximos Pasos

1. Ejecutar migraciones de base de datos
2. Configurar autenticación
3. Subir datos semilla de candidatos
4. Configurar storage para multimedia
5. Implementar endpoints de API
6. Configurar panel de administración

## 🔧 Comandos Útiles

```bash
# Ejecutar migraciones
npm run migration:run

# Cargar datos semilla
npm run seed:candidates

# Iniciar aplicación en desarrollo
npm run start:dev

# Conectar a base de datos de Supabase
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

## 📊 Monitoreo y Analytics

Supabase proporciona dashboards integrados para:
- Uso de base de datos
- Número de requests API
- Usuarios activos
- Performance de queries
- Almacenamiento utilizado

## 🔐 Seguridad

- Todas las claves sensibles deben estar en variables de entorno
- Usar Row Level Security para proteger datos
- Validar y sanitizar todas las entradas de usuario
- Implementar rate limiting para APIs públicas