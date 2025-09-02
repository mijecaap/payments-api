# 📊 Plataforma Electoral Perú 2026 - Documentación Completa

## 📋 Resumen del Proyecto

Este repositorio contiene la implementación completa de una plataforma web para informar a los votantes sobre los candidatos presidenciales de las elecciones peruanas de 2026. La plataforma ha sido diseñada para ayudar a los ciudadanos a tomar decisiones informadas proporcionando información detallada sobre candidatos, propuestas de gobierno, historial político y resultados de encuestas.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Backend**: NestJS 10 + TypeScript
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: TypeORM 0.3
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest
- **Storage**: Supabase Storage
- **Deployment**: Railway/Vercel compatible

### Arquitectura de Datos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ CANDIDATOS      │    │ PARTIDOS        │    │ PROPUESTAS      │
│                 │    │ POLÍTICOS       │    │                 │
│ - Información   │────│                 │    │ - Por categoría │
│ - Biografía     │    │ - Ideología     │    │ - Prioridad     │
│ - Experiencia   │    │ - Historia      │    │ - Factibilidad  │
│ - Educación     │    │ - Coaliciones   │    │ - Impacto       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ENCUESTAS       │    │ EVENTOS         │    │ NOTICIAS        │
│                 │    │ CAMPAÑA         │    │                 │
│ - Intención     │────│                 │────│ - Actualizadas  │
│ - Aprobación    │    │ - Mítines       │    │ - Categorizadas │
│ - Tendencias    │    │ - Debates       │    │ - Multimedia    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estructura del Proyecto

```
peru-elections-2026/
├── supabase-setup/              # 🆕 Configuración de Supabase
│   ├── README.md                # Documentación principal
│   ├── INSTALLATION.md          # Guía de instalación paso a paso
│   ├── MIGRATION-GUIDE.md       # Guía de migración
│   ├── schema.sql               # Esquema completo de base de datos
│   ├── seed-data.sql            # Datos de ejemplo
│   ├── .env.example             # Variables de entorno
│   ├── package.json             # Scripts de utilidad
│   ├── supabase.config.ts       # Configuración del cliente
│   ├── validate-env.js          # Validador de configuración
│   └── test-connection.js       # Test de conectividad
├── src/
│   ├── entities/                # Entidades de base de datos
│   │   ├── candidate.entity.ts           # 🆕 Candidatos
│   │   ├── political-party.entity.ts     # 🆕 Partidos políticos
│   │   ├── proposal.entity.ts            # 🆕 Propuestas
│   │   ├── category.entity.ts            # 🆕 Categorías
│   │   ├── candidate-education.entity.ts # 🆕 Educación
│   │   ├── candidate-experience.entity.ts# 🆕 Experiencia
│   │   └── ...                           # Otras entidades
│   ├── services/                # Lógica de negocio
│   ├── controllers/             # Endpoints de API
│   ├── dto/                     # Objetos de transferencia
│   └── migrations/              # Migraciones de BD
├── docs/                        # Documentación adicional
├── test/                        # Tests E2E
└── package.json
```

## 🚀 Guía de Inicio Rápido

### 1. Instalación Inicial

```bash
# Clonar repositorio
git clone [tu-repositorio]
cd payments-api

# Instalar dependencias principales
npm install --legacy-peer-deps

# Configurar Supabase
cd supabase-setup
npm install
```

### 2. Configuración de Supabase

```bash
# Crear archivo de configuración
cp supabase-setup/.env.example .env

# Editar .env con tus credenciales de Supabase
# (Ver INSTALLATION.md para detalles)

# Validar configuración
npm run supabase:validate

# Probar conexión
npm run supabase:test
```

### 3. Configurar Base de Datos

**Opción A: SQL Editor de Supabase (Recomendado)**
1. Ir al SQL Editor en tu dashboard de Supabase
2. Copiar y ejecutar el contenido de `supabase-setup/schema.sql`
3. Copiar y ejecutar el contenido de `supabase-setup/seed-data.sql`

**Opción B: Línea de comandos**
```bash
# Conectar a Supabase
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Ejecutar scripts
\i supabase-setup/schema.sql
\i supabase-setup/seed-data.sql
```

### 4. Iniciar Aplicación

```bash
# Modo desarrollo
npm run start:dev

# La aplicación estará disponible en:
# - API: http://localhost:4000
# - Docs: http://localhost:4000/api-docs
```

## 🗄️ Base de Datos

### Entidades Principales

#### 1. **Candidatos** (`candidates`)
- Información personal y profesional
- Afiliación partidaria
- Métricas de popularidad
- Enlaces a redes sociales

#### 2. **Partidos Políticos** (`political_parties`)
- Historia y fundación
- Ideología política
- Logos y elementos visuales
- Estado actual

#### 3. **Propuestas** (`proposals`)
- Organizadas por categorías
- Nivel de prioridad
- Factibilidad y costos
- Timeline de implementación

#### 4. **Categorías** (`categories`)
- Economía, Salud, Educación, etc.
- Iconos y colores para UI
- Ordenamiento personalizable

#### 5. **Encuestas** (`polls`, `poll_results`)
- Resultados históricos
- Metodología y muestras
- Tendencias temporales

#### 6. **Eventos de Campaña** (`campaign_events`)
- Mítines, debates, entrevistas
- Ubicación y asistencia
- Multimedia asociada

### Relaciones Clave

```sql
-- Candidato pertenece a un partido
candidates.political_party_id → political_parties.id

-- Propuesta pertenece a candidato y categoría
proposals.candidate_id → candidates.id
proposals.category_id → categories.id

-- Educación y experiencia del candidato
candidate_education.candidate_id → candidates.id
candidate_experience.candidate_id → candidates.id

-- Resultados de encuestas
poll_results.candidate_id → candidates.id
poll_results.poll_id → polls.id
```

## 🔗 API Endpoints

### Candidatos
```
GET    /api/candidates              # Listar todos los candidatos
GET    /api/candidates/:id          # Candidato específico
GET    /api/candidates/by-party/:id # Candidatos por partido
POST   /api/candidates              # Crear candidato (admin)
PUT    /api/candidates/:id          # Actualizar candidato (admin)
```

### Propuestas
```
GET    /api/proposals                    # Todas las propuestas
GET    /api/proposals/by-candidate/:id   # Por candidato
GET    /api/proposals/by-category/:id    # Por categoría
GET    /api/proposals/search?q=:query   # Búsqueda de texto
```

### Encuestas
```
GET    /api/polls                   # Todas las encuestas
GET    /api/polls/latest           # Últimos resultados
GET    /api/polls/:id/results      # Resultados específicos
```

### Partidos Políticos
```
GET    /api/political-parties      # Todos los partidos
GET    /api/political-parties/:id  # Partido específico
```

### Eventos
```
GET    /api/events                 # Todos los eventos
GET    /api/events/upcoming        # Próximos eventos
GET    /api/events/by-candidate/:id # Por candidato
```

## 🔧 Funcionalidades Principales

### 1. **Gestión de Candidatos**
- CRUD completo de candidatos
- Biografías detalladas
- Historial educativo y profesional
- Métricas de popularidad en tiempo real

### 2. **Sistema de Propuestas**
- Categorización inteligente
- Sistema de prioridades
- Análisis de factibilidad
- Búsqueda full-text

### 3. **Seguimiento de Encuestas**
- Histórico de resultados
- Tendencias y gráficos
- Comparativas entre candidatos
- Metadata de encuestadoras

### 4. **Eventos de Campaña**
- Calendario de eventos
- Geolocalización
- Galería multimedia
- Métricas de asistencia

### 5. **Centro de Noticias**
- Agregación automática
- Categorización por temas
- Menciones de candidatos
- Sistema de etiquetas

### 6. **Búsqueda Avanzada**
- Búsqueda por texto libre
- Filtros por categoría, partido, fecha
- Autocompletado
- Resultados relevantes

## 🛡️ Seguridad

### Autenticación
- JWT tokens con expiración
- Refresh tokens
- Rate limiting por IP
- Validación de entrada estricta

### Autorización
- Roles: público, editor, admin
- Row Level Security (RLS) en Supabase
- Permisos granulares por entidad

### Protección de Datos
- Encriptación de contraseñas con bcrypt
- Variables de entorno para secretos
- Sanitización de entrada
- Logs de auditoría

## 📊 Monitoreo y Analytics

### Métricas Disponibles
- Requests por endpoint
- Tiempo de respuesta
- Candidatos más consultados
- Propuestas más vistas
- Errores y excepciones

### Herramientas Integradas
- Supabase Dashboard
- Logs estructurados
- Health checks automáticos
- Alertas por email/SMS

## 🔄 CI/CD y Deployment

### GitHub Actions
```yaml
# Pipeline automático para:
- Linting (ESLint + Prettier)
- Tests unitarios (Jest)
- Tests E2E
- Build de producción
- Deploy automático
```

### Environments
- **Development**: Supabase local/staging
- **Staging**: Supabase staging
- **Production**: Supabase production

## 📱 Roadmap de Desarrollo

### Fase 1: Core MVP ✅
- [x] Entidades básicas
- [x] API endpoints
- [x] Base de datos en Supabase
- [x] Documentación

### Fase 2: Funcionalidades Avanzadas 🔄
- [ ] Búsqueda full-text con Elasticsearch
- [ ] Sistema de notificaciones
- [ ] Dashboard administrativo
- [ ] API de estadísticas

### Fase 3: Optimización 📅
- [ ] Cache con Redis
- [ ] CDN para multimedia
- [ ] Optimización de queries
- [ ] Monitoreo avanzado

### Fase 4: Frontend 📅
- [ ] Aplicación web React/Vue
- [ ] Aplicación móvil
- [ ] Panel de administración
- [ ] Widgets embebibles

## 🤝 Contribución

### Branching Strategy
```
main                    # Producción
├── develop            # Desarrollo principal
├── feature/candidates # Nuevas funcionalidades
├── hotfix/security   # Correcciones urgentes
└── release/v2.0      # Preparación de releases
```

### Convenciones
- Conventional Commits
- Código en inglés, documentación en español
- Tests obligatorios para nuevas features
- Code review requerido

## 📞 Soporte y Recursos

### Documentación
- [Supabase Docs](https://supabase.com/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)

### Scripts Útiles
```bash
# Desarrollo
npm run start:dev        # Servidor de desarrollo
npm run test            # Tests unitarios
npm run test:e2e        # Tests end-to-end
npm run lint            # Linting de código

# Supabase
npm run supabase:validate  # Validar configuración
npm run supabase:test      # Test de conexión
npm run supabase:setup     # Configuración inicial

# Base de datos
npm run migration:generate # Nueva migración
npm run migration:run      # Ejecutar migraciones
npm run seed:candidates    # Datos de ejemplo
```

### Contacto
- **Repositorio**: [GitHub Link]
- **Documentación**: `/docs`
- **API Docs**: `http://localhost:4000/api-docs`
- **Supabase Dashboard**: Tu proyecto en supabase.com

---

**✨ ¡Tu plataforma electoral está lista para ayudar a los votantes peruanos a tomar decisiones informadas en 2026!**