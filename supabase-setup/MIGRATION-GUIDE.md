# Guía de Migración: De API de Pagos a Plataforma Electoral

## 📋 Resumen de Cambios

Esta guía detalla cómo migrar el proyecto actual (API de pagos) hacia una plataforma electoral para candidatos presidenciales de Perú 2026.

## 🔄 Estrategia de Migración

### Opción 1: Migración Completa (Recomendada)
- Reemplazar completamente las entidades de pagos con entidades electorales
- Mantener la estructura base de NestJS + TypeORM
- Migrar a Supabase como nuevo proveedor de base de datos

### Opción 2: Migración Gradual
- Mantener las entidades existentes temporalmente
- Agregar nuevas entidades electorales
- Migrar gradualmente los endpoints

## 🗃️ Comparación de Entidades

### Entidades Actuales (Pagos) → Nuevas Entidades (Electoral)

| Actual | Nueva | Propósito |
|--------|--------|-----------|
| `User` | `Candidate` | Información personal |
| `Account` | `PoliticalParty` | Organización/Afiliación |
| `Transaction` | `Proposal` | Acciones/Propuestas |
| `Commission` | `Poll` | Métricas/Resultados |
| - | `Category` | Clasificación de propuestas |
| - | `CandidateEducation` | Formación académica |
| - | `CandidateExperience` | Experiencia laboral |
| - | `CampaignEvent` | Eventos de campaña |
| - | `News` | Noticias y actualizaciones |

## 📁 Estructura de Archivos a Migrar

### 1. Entidades (`src/entities/`)

**Archivos a Reemplazar:**
```
❌ account.entity.ts       → ✅ political-party.entity.ts
❌ commission.entity.ts    → ✅ poll.entity.ts
❌ transaction.entity.ts   → ✅ proposal.entity.ts
❌ user.entity.ts          → ✅ candidate.entity.ts
```

**Archivos Nuevos:**
```
✅ category.entity.ts
✅ candidate-education.entity.ts
✅ candidate-experience.entity.ts
✅ campaign-event.entity.ts
✅ news.entity.ts
```

### 2. Servicios (`src/services/`)

**Archivos a Migrar:**
```
❌ account.service.ts      → ✅ political-party.service.ts
❌ commission.service.ts   → ✅ poll.service.ts
❌ transaction.service.ts  → ✅ proposal.service.ts
❌ user.service.ts         → ✅ candidate.service.ts
❌ contact.service.ts      → ✅ news.service.ts
```

**Servicios Nuevos:**
```
✅ category.service.ts
✅ candidate-education.service.ts
✅ candidate-experience.service.ts
✅ campaign-event.service.ts
✅ search.service.ts
```

### 3. Controladores (`src/controllers/`)

**Similar migración para controladores:**
```
❌ account.controller.ts   → ✅ political-party.controller.ts
❌ commission.controller.ts → ✅ poll.controller.ts
❌ transaction.controller.ts → ✅ proposal.controller.ts
❌ user.controller.ts      → ✅ candidate.controller.ts
❌ contact.controller.ts   → ✅ news.controller.ts
```

### 4. DTOs (`src/dto/`)

**Crear nuevos DTOs para:**
```
✅ create-candidate.dto.ts
✅ update-candidate.dto.ts
✅ create-proposal.dto.ts
✅ search-candidates.dto.ts
✅ poll-result.dto.ts
✅ campaign-event.dto.ts
```

## 🔧 Pasos de Migración Detallados

### Paso 1: Preparación

```bash
# 1. Crear respaldo de la base de datos actual
pg_dump $DB_URL > backup_payments_api.sql

# 2. Crear nueva rama para migración
git checkout -b feature/electoral-platform

# 3. Instalar dependencias de Supabase
cd supabase-setup
npm install
```

### Paso 2: Configurar Supabase

```bash
# 1. Configurar variables de entorno
cp supabase-setup/.env.example .env
# Editar .env con credenciales reales

# 2. Validar configuración
npm run validate-env

# 3. Probar conexión
npm run test-connection

# 4. Crear estructura de base de datos
# Ejecutar schema.sql en Supabase SQL Editor
```

### Paso 3: Migrar Entidades

```bash
# 1. Respaldar entidades actuales
mkdir src/entities/backup
mv src/entities/*.entity.ts src/entities/backup/

# 2. Copiar nuevas entidades
cp supabase-setup/entities/*.entity.ts src/entities/

# 3. Actualizar app.module.ts con nuevas entidades
```

**Actualizar `src/app.module.ts`:**
```typescript
// Reemplazar imports
import { Candidate } from './entities/candidate.entity';
import { PoliticalParty } from './entities/political-party.entity';
import { Proposal } from './entities/proposal.entity';
import { Category } from './entities/category.entity';
// ... otras entidades

@Module({
  imports: [
    // ...
    TypeOrmModule.forFeature([
      Candidate,
      PoliticalParty,
      Proposal,
      Category,
      // ... otras entidades
    ]),
  ],
})
```

### Paso 4: Actualizar Configuración de Base de Datos

**Actualizar variables de entorno:**
```env
# Cambiar de PostgreSQL local a Supabase
DB_HOST=db.tu-proyecto.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_supabase
DB_NAME=postgres

# Agregar configuración Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
```

### Paso 5: Migrar Servicios y Controladores

**Crear servicios base:**
```typescript
// src/services/candidate.service.ts
@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  async findAll(): Promise<Candidate[]> {
    return this.candidateRepository.find({
      relations: ['political_party', 'proposals'],
      where: { is_active: true },
    });
  }

  async findByParty(partyId: number): Promise<Candidate[]> {
    return this.candidateRepository.find({
      where: { political_party_id: partyId, is_active: true },
    });
  }

  // ... otros métodos
}
```

### Paso 6: Actualizar Endpoints

**Migrar endpoints principales:**
```
❌ GET /api/accounts          → ✅ GET /api/candidates
❌ GET /api/transactions      → ✅ GET /api/proposals
❌ GET /api/commissions       → ✅ GET /api/polls
❌ GET /api/contacts          → ✅ GET /api/news
```

**Nuevos endpoints específicos:**
```
✅ GET /api/candidates/by-party/:partyId
✅ GET /api/proposals/by-category/:categoryId
✅ GET /api/polls/latest
✅ GET /api/search/candidates?q=:query
✅ GET /api/events/upcoming
```

### Paso 7: Migrar Datos de Prueba

```bash
# 1. Cargar datos semilla
# Ejecutar seed-data.sql en Supabase

# 2. Verificar carga de datos
npm run test-connection

# 3. Probar endpoints básicos
curl http://localhost:4000/api/candidates
```

### Paso 8: Actualizar Documentación

**Actualizar `main.ts` para Swagger:**
```typescript
const config = new DocumentBuilder()
  .setTitle('API Electoral Perú 2026')
  .setDescription('API para información de candidatos presidenciales')
  .setVersion('2.0')
  .addBearerAuth()
  .build();
```

**Actualizar README.md:**
```markdown
# Plataforma Electoral Perú 2026

API para información de candidatos presidenciales de las elecciones 2026.

## Características
- Información detallada de candidatos
- Propuestas organizadas por categorías
- Resultados de encuestas
- Eventos de campaña
- Noticias actualizadas
```

## 🧪 Verificación de Migración

### 1. Tests de Endpoints

```bash
# Probar endpoints principales
curl http://localhost:4000/api/candidates
curl http://localhost:4000/api/political-parties
curl http://localhost:4000/api/proposals
curl http://localhost:4000/api/categories
```

### 2. Verificar Base de Datos

```sql
-- Contar registros en tablas principales
SELECT 'candidates' as tabla, COUNT(*) as registros FROM candidates
UNION ALL
SELECT 'political_parties', COUNT(*) FROM political_parties
UNION ALL
SELECT 'proposals', COUNT(*) FROM proposals;
```

### 3. Tests de Funcionalidad

```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Verificar build
npm run build
```

## 🔄 Rollback (Si es Necesario)

Si algo sale mal durante la migración:

```bash
# 1. Revertir entidades
rm src/entities/*.entity.ts
mv src/entities/backup/*.entity.ts src/entities/

# 2. Revertir configuración de BD
# Restaurar variables .env anteriores

# 3. Restaurar base de datos
psql $DB_URL < backup_payments_api.sql

# 4. Revertir cambios en git
git checkout main
git branch -D feature/electoral-platform
```

## 📝 Checklist de Migración

### Pre-migración
- [ ] Respaldo de base de datos actual
- [ ] Respaldo de código en Git
- [ ] Proyecto Supabase creado
- [ ] Credenciales obtenidas

### Migración
- [ ] Variables de entorno configuradas
- [ ] Conexión a Supabase verificada
- [ ] Schema de BD ejecutado
- [ ] Datos semilla cargados
- [ ] Entidades migradas
- [ ] Servicios actualizados
- [ ] Controladores actualizados
- [ ] Endpoints probados

### Post-migración
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] README actualizado
- [ ] Storage configurado
- [ ] Deploy en producción
- [ ] Monitoreo configurado

## 🚀 Próximos Pasos Post-Migración

1. **Frontend**: Desarrollar interfaz de usuario
2. **Búsqueda Avanzada**: Implementar búsqueda full-text
3. **Notificaciones**: Sistema de notificaciones en tiempo real
4. **Analytics**: Dashboard de métricas y estadísticas
5. **Mobile**: API optimizada para aplicaciones móviles
6. **Cache**: Implementar Redis para mejor rendimiento
7. **CDN**: Configurar CDN para archivos multimedia
8. **Monitoring**: Implementar logging y monitoreo avanzado