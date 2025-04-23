# payments‑api

API de pagos con sistema de referidos (NestJS 10 + TypeORM 0.3 + PostgreSQL).

## 📑 Índice
1. [Stack](#stack)
2. [Requisitos](#requisitos)
3. [Instalación local](#instalación-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Scripts npm](#scripts-npm)
6. [Migraciones y seed](#migraciones-y-seed)
7. [Docker Compose](#docker-compose)
8. [CI / CD](#ci--cd)
9. [Despliegue en Railway](#despliegue-en-railway)
10. [Pruebas de carga](#pruebas-de-carga)
11. [Concurrencia y condiciones de carrera](#concurrencia-y-condiciones-de-carrera)
12. [Convenciones](#convenciones)

---

## Stack
- **Node.js** 18 / 20 LTS  
- **NestJS** 10  
- **TypeORM** 0.3  
- **PostgreSQL** 15  
- **Jest** para tests  
- **k6** para stress tests

## Requisitos
- Windows 10+ con `cmd`  
- Git, Docker Desktop (WSL 2)  
- Node LTS y npm  
- Cuenta en GitHub y Railway

## Instalación local

```cmd
git clone https://github.com/mijecaap/payments-api
cd payments-api
npm install
docker compose up -d       :: levanta PostgreSQL
npm run start:dev          :: Nest en modo watch
```

### Primer acceso a la BD
```cmd
npm run migration:run
npm run seed
```

## Variables de entorno

Crea un archivo **.env** en la raíz:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=banex
DB_PASSWORD=banexpwd
DB_NAME=payments
NODE_ENV=development
```

## Scripts npm

| Script | Descripción |
| ------ | ----------- |
| `start` | Compila y ejecuta en producción |
| `start:dev` | Hot‑reload con `ts-node-dev` |
| `lint` | ESLint + Prettier |
| `test` | Unit tests con cobertura |
| `migration:run` | Ejecuta migraciones TypeORM |
| `migration:generate` | Genera nueva migración |
| `seed` | Inserta datos de prueba |

## Migraciones y seed
Las entidades viven en `src/entities`. Cada cambio de esquema requiere:

```cmd
npm run migration:generate -- -n <nombre>
npm run migration:run
```

El seed crea usuarios, cuentas y relaciones de referidos básicas.

## Docker Compose
Archivo `docker-compose.yml` incluido:

```yaml
services:
  db:
    image: postgres:15
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: banex
      POSTGRES_PASSWORD: banexpwd
      POSTGRES_DB: payments
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

## CI / CD
- **GitHub Actions**: workflow `ci.yml`  
  1. Checkout  
  2. Matrix Node 18|20  
  3. `npm ci`, `npm run lint`, `npm test`  
- Status badge en el README.

## Despliegue en Railway
1. Crea proyecto, añade plugin **PostgreSQL**.  
2. Conecta repo y habilita **Deploy on push**.  
3. Variables ⇒ mismas que `.env`.  
4. Post‑deploy:  
   ```bash
   npm run migration:run
   ```

## Pruebas de carga
Scripts `stress/payments.js` con k6:

```bash
k6 run stress/payments.js
```
Configura 200 VU y escenarios de transferencias simultáneas.

---

## Concurrencia y condiciones de carrera

### ¿Qué son las condiciones de carrera y cómo afectan al sistema?

En un sistema de pagos como el que estamos desarrollando, **las condiciones de carrera** ocurren cuando dos o más procesos intentan acceder y modificar los mismos datos (en este caso, **saldo de cuentas y comisiones**) al mismo tiempo sin control adecuado. Esto puede causar **errores**, como **saldo incorrecto**, **comisiones mal calculadas** o **transacciones fallidas**.

Por ejemplo, en un escenario donde una persona realiza una transferencia mientras otra persona recibe un pago o realiza una transacción desde la misma cuenta, el sistema debe asegurarse de que los saldos y las comisiones se calculen correctamente, incluso si ambas operaciones ocurren al mismo tiempo.

### Estrategias implementadas para manejar la concurrencia

Para evitar estos problemas, hemos implementado varias estrategias:

#### 1. **Bloqueo de registros (Row-level locking)**
Antes de realizar cualquier cambio en el saldo de una cuenta (por ejemplo, una transferencia), el sistema bloquea temporalmente ese registro para que ninguna otra operación pueda modificarlo hasta que la transacción se haya completado.

- **Ejemplo**: Si Persona A está haciendo una transferencia de $50, el sistema bloquea la cuenta hasta que la operación termine. Si otra persona intenta realizar una transacción en la misma cuenta al mismo tiempo, se bloquea hasta que la primera transacción termine.

#### 2. **Nivel de aislamiento `SERIALIZABLE`**
El nivel de aislamiento **`SERIALIZABLE`** asegura que las transacciones se ejecuten de forma secuencial y no simultánea. Este nivel garantiza que, aunque haya múltiples transacciones, ninguna interferirá con la otra.

- **Ejemplo**: Si dos personas o procesos intentan modificar el saldo de una cuenta al mismo tiempo, el sistema se asegura de que solo una transacción se ejecute a la vez, evitando que se realicen actualizaciones incorrectas.

#### 3. **Transacciones atómicas**
Las **transacciones atómicas** aseguran que todas las operaciones dentro de una transacción se realicen de manera exitosa o, si hay un error, **ninguna** operación se aplique. Esto evita que el sistema quede en un estado inconsistente si algo sale mal durante una transacción.

- **Ejemplo**: Si el sistema necesita restar dinero de una cuenta y agregarlo a otra, si algo falla durante este proceso (por ejemplo, no hay suficiente saldo), la transacción completa se deshace, asegurando que no haya dinero perdido ni en una cuenta ni en la otra.

#### 4. **Retry exponencial y manejo de errores**
Si el sistema detecta un **conflicto de concurrencia** (por ejemplo, dos transacciones simultáneas intentan modificar la misma cuenta), implementamos un **mecanismo de reintentos** con un **retraso exponencial** para intentar completar la transacción varias veces antes de finalmente fallar.

- **Ejemplo**: Si dos transacciones intentan acceder a la misma cuenta y ambas fallan, el sistema intentará completar la transacción de nuevo después de un breve periodo de tiempo, asegurando que se completen correctamente.

### ¿Qué más podemos hacer?

En el futuro, podríamos mejorar aún más el manejo de concurrencia utilizando técnicas como:
- **Monitoreo proactivo** para detectar y solucionar rápidamente cualquier problema de concurrencia que pueda surgir en el sistema.

---

## Convenciones
- _Commit lint_ con Conventional Commits.  
- Husky pre‑commit: `npm run lint && npm test`.  
- Branches: `feat/*`, `fix/*`, `chore/*`.

---