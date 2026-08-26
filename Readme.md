# PRIMERA FASE — LOGIN CON FRONTEND Y BACKEND FUNCIONAL

Este documento cuenta cómo quedó armada la primera fase de **Flow**, la app de control de gastos. Por ahora lo único que existe es el Login: alguien escribe su correo y contraseña, el sistema los valida contra una base de datos real, y responde si puede entrar o no.

No hay registro de usuarios, recuperación de contraseña, dashboard ni nada de gastos todavía. Eso viene después, en otras fases.

---

## 1. Comandos usados para levantar el proyecto

### 1.1 Backend

```bash
mkdir backend
cd backend
pnpm init
```
Crea la carpeta del backend y el `package.json`.

```bash
pnpm add express cors dotenv jsonwebtoken bcrypt @prisma/client
```
Instala lo esencial: `express` para el servidor, `cors` para que Angular pueda hablarle sin problemas, `dotenv` para leer el `.env`, `jsonwebtoken` para generar el token de sesión, `bcrypt` para cifrar contraseñas, y `@prisma/client` para hablar con la base de datos.

```bash
pnpm add -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt prisma
```
Herramientas de desarrollo: el compilador de TypeScript, `tsx` (para correr TypeScript sin compilar cada vez), los tipos de cada librería, y el CLI de Prisma.

```bash
pnpm approve-builds
```
pnpm bloquea por seguridad los scripts de instalación de ciertos paquetes (`bcrypt`, `prisma`, `esbuild`, `@prisma/engines`). Este comando abre la lista para aprobarlos a mano.

```bash
pnpm exec tsc --noEmit
```
Revisa que TypeScript esté bien configurado, sin generar archivos, solo para pescar errores.

### 1.2 Base de datos

```bash
docker compose up -d
```
Levanta PostgreSQL en un contenedor, en segundo plano.

```bash
docker ps
```
Confirma que el contenedor sí está corriendo.

```bash
docker logs flow-postgres
```
Muestra el log del contenedor, para verificar que la base ya está lista para recibir conexiones.

```bash
pnpm exec prisma init
```
Prepara Prisma dentro del backend.

```bash
pnpm exec prisma generate
```
Genera el cliente que el backend usa para consultar la base de datos.

```bash
pnpm exec prisma migrate dev --name init
```
Crea la tabla `users` en PostgreSQL según lo definido en `schema.prisma`.

```bash
pnpm exec prisma db seed
```
Corre `prisma/seed.ts`, que crea los dos usuarios de prueba (admin y user).

```bash
pnpm exec prisma studio
```
Abre una vista en el navegador para revisar los datos guardados.

### 1.3 Frontend

```bash
cd ..
pnpm dlx @angular/cli@latest new frontend --routing --style=css --ssr=false --skip-git
```
Crea el proyecto Angular, con rutas incluidas, CSS plano, sin SSR (no hace falta para esta fase).

```bash
pnpm install
```
Instala las dependencias del frontend.

```bash
pnpm start
```
Levanta el frontend en modo desarrollo.

### 1.4 Para correr todo junto

Se necesitan tres terminales abiertas al mismo tiempo:

- Base de datos → carpeta `backend/` → `docker compose up -d`
- Backend → carpeta `backend/` → `pnpm run dev`
- Frontend → carpeta `frontend/` → `pnpm start`

---

## 2. Tecnologías usadas

- **Angular** — arma la pantalla de Login que ve el usuario.
- **TypeScript** — el lenguaje usado en frontend y backend, ayuda a evitar errores tontos.
- **Node.js** — corre el backend.
- **Express** — organiza cómo el backend recibe y responde peticiones.
- **PostgreSQL** — donde se guardan los usuarios.
- **Prisma** — conecta el backend con PostgreSQL sin tener que escribir SQL a mano.
- **Docker** — corre PostgreSQL sin instalarlo directo en la máquina.
- **JWT** — el token que identifica a alguien después de iniciar sesión.
- **bcrypt** — cifra las contraseñas antes de guardarlas.
- **pnpm** — el gestor de paquetes de todo el proyecto.

---

## 3. Estructura del proyecto

```text
flow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts
│   │   ├── modules/
│   │   │   └── auth/
│   │   │       ├── auth.controller.ts
│   │   │       ├── auth.service.ts
│   │   │       └── auth.routes.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── generated/
│   │   └── prisma/         (esto lo genera Prisma solo, no se toca)
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── docker-compose.yml
│   ├── prisma.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts
│   │   │   ├── app.html
│   │   │   ├── app.css
│   │   │   ├── app.routes.ts
│   │   │   ├── app.config.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   └── features/
│   │   │       └── login/
│   │   │           ├── login.ts
│   │   │           ├── login.html
│   │   │           └── login.css
│   │   ├── environments/
│   │   │   └── environment.ts
│   │   ├── index.html
│   │   └── styles.css
│   ├── public/
│   │   └── images/
│   │       └── logo Flor(R).jpg
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

**Backend, carpeta por carpeta:**

`config/prisma.ts` — aquí se arma la única conexión a la base de datos que usa todo el backend.

`modules/auth/auth.routes.ts` — define la URL a la que el frontend le pide iniciar sesión.

`modules/auth/auth.controller.ts` — recibe la petición, revisa que vengan los datos y responde.

`modules/auth/auth.service.ts` — la lógica real: busca al usuario, compara la contraseña, genera el JWT.

`types/auth.types.ts` — la forma que deben tener los datos del Login.

`app.ts` — enciende el servidor.

`prisma/schema.prisma` — describe cómo es la tabla `users`.

`prisma/seed.ts` — crea los usuarios de prueba.

`prisma.config.ts` — le dice a Prisma cómo conectarse a la base y dónde están las migraciones.

`docker-compose.yml` — cómo se levanta PostgreSQL.

`.env` — contraseñas y claves que no deben compartirse.

**Frontend, lo importante:**

`features/login/` — la pantalla del Login completa: diseño (`login.html`, `login.css`) y comportamiento (`login.ts`).

`services/auth.service.ts` — habla con el backend, manda el correo y la contraseña, guarda el token si el login funciona.

`app.routes.ts` — decide qué pantalla se muestra (por ahora, siempre el Login).

`environments/environment.ts` — guarda la dirección del backend, para no tenerla escrita a mano en varios lados.

---

## 4. Cómo funciona el Login

1. El usuario escribe su correo.
2. Escribe su contraseña.
3. Al darle clic a "Iniciar sesión", Angular manda esos datos al backend.
4. El backend busca si existe alguien con ese correo.
5. Si existe, compara la contraseña escrita contra la contraseña cifrada guardada.
6. Si coincide, genera un token (JWT) que identifica a ese usuario.
7. Regresa ese token junto con el correo y el rol del usuario.
8. Angular guarda el token y muestra un mensaje de bienvenida.

Y si algo no cuadra:

- Correo que no existe → el backend avisa que no encontró al usuario.
- Contraseña incorrecta → avisa que la contraseña no coincide.
- Campos vacíos → pide completar correo y contraseña antes de seguir.
- Todo correcto → responde "Login exitoso" junto con el token y los datos del usuario.

---

## 5. Usuarios de prueba

Se crean solos al correr `pnpm exec prisma db seed`, están definidos en `prisma/seed.ts`.

**Usuario 1**
Rol: ADMIN
Correo: admin@flow.com
Contraseña: Admin123!

**Usuario 2**
Rol: USER
Correo: user@flow.com
Contraseña: User123!

En la base de datos estas contraseñas están cifradas, nunca en texto plano. Las de arriba son las que se usan para probar — como quedan visibles en el código del seed, hay que cambiarlas antes de subir esto a un repo público o de pasarlo a producción.

---

## 6. Cómo probar el Login

**Backend**, desde `backend/`:

```bash
docker compose up -d
pnpm run dev
```
El primero levanta la base de datos, el segundo enciende el servidor en `http://localhost:3000`.

**Frontend**, desde `frontend/`:

```bash
pnpm start
```
Levanta la pantalla en `http://localhost:4200`.

Luego, en el navegador:

1. Escribe el correo (`admin@flow.com`, por ejemplo).
2. Escribe la contraseña (`Admin123!`).
3. Dale clic a **Iniciar sesión**.
4. Debería aparecer un mensaje de bienvenida con el correo y el rol del usuario.

---

## 7. La ruta del Login

```http
POST /api/auth/login
```

Lo que recibe:

```json
{
  "email": "admin@flow.com",
  "password": "Admin123!"
}
```

Lo que devuelve si todo sale bien (200):

```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-del-usuario",
    "email": "admin@flow.com",
    "role": "ADMIN"
  }
}
```

Y si algo falla:

| Caso | Código | Mensaje |
|---|---|---|
| Faltan campos | 400 | "Email y contraseña son obligatorios" |
| Usuario no existe | 404 | "Usuario no encontrado" |
| Contraseña incorrecta | 401 | "Contraseña incorrecta" |
| Error del servidor | 500 | "Error interno del servidor" |

---

## 8. El JWT

Es básicamente el pase de acceso: una vez que alguien inicia sesión, este token lo identifica sin que tenga que volver a escribir su contraseña en cada petición.

Se genera en `auth.service.ts`, justo después de confirmar que la contraseña es correcta. Adentro lleva solo el `id` del usuario y su `role`.

El frontend lo guarda en `localStorage` y en teoría lo mandaría en futuras peticiones que necesiten saber quién es el usuario. Por ahora no hay ninguna ruta protegida con este token — solo existe el Login, así que todavía no hay nada que proteger. Eso llega cuando se agreguen rutas como el dashboard.

---

## 9. Base de datos

PostgreSQL 16, corriendo en un contenedor de Docker llamado `flow-postgres`. El backend se conecta a través de Prisma, usando un adaptador (`@prisma/adapter-pg`) que traduce las consultas al lenguaje que entiende PostgreSQL.

La única tabla que existe por ahora es `users`:

| Campo | Qué guarda |
|---|---|
| `id` | identificador único |
| `email` | correo, no se puede repetir |
| `password` | contraseña cifrada |
| `role` | ADMIN o USER |
| `createdAt` | fecha de creación |
| `updatedAt` | última actualización |

Para levantarla: `docker compose up -d`. Para apagarla sin perder los datos: `docker compose down`.

---

## 10. Variables de entorno

El `.env` guarda lo que no debe andar expuesto:

```env
DATABASE_URL="postgresql://flow_user:flow_password@localhost:5432/flow_db?schema=public"
JWT_SECRET="cambia_esto_por_un_secreto_largo_y_aleatorio"
PORT=3000
```

`DATABASE_URL` es la conexión a PostgreSQL. `JWT_SECRET` es la clave con la que se firman los tokens — hay que cambiarla por algo propio. `PORT` es donde corre el backend.

También existe un `.env.example` con las mismas variables pero vacías, para que cualquiera sepa qué necesita configurar sin ver los valores reales:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

---

## 11. Cosas que se rompieron y cómo se arreglaron

**pnpm bloqueó la instalación de algunas librerías.** Al instalar `bcrypt` y después `prisma`/`esbuild`/`@prisma/engines`, pnpm bloqueó sus scripts de instalación por seguridad. Se resolvió corriendo `pnpm approve-builds` y aprobándolos a mano, ya que son librerías oficiales.

**TypeScript rechazó la configuración generada automáticamente.** Al correr `tsc --init`, se generó un `tsconfig.json` con una opción (`moduleResolution: node`) que ya no existe en la versión instalada. Se reemplazó por una configuración actualizada.

**Prisma 7 cambió cómo se conecta a la base de datos.** Al migrar, salió el error `P1012`: ya no se puede poner la URL de conexión dentro de `schema.prisma`. Se movió esa configuración a un archivo nuevo, `prisma.config.ts`, se agregó el paquete `@prisma/adapter-pg`, y el backend pasó a usar módulos ES (`"type": "module"`).

**Los usuarios de prueba no aparecían solos.** Antes, Prisma corría el seed automáticamente después de migrar. En la versión 7 eso ya no pasa, hay que correrlo aparte con `pnpm exec prisma db seed`.

**Angular se instaló con npm en vez de pnpm.** Al crear el proyecto quedó configurado para usar npm (apareció un `package-lock.json` y el campo `packageManager` apuntando a npm), así que `pnpm start` no funcionaba. Se borró ese lock y `node_modules`, se corrigió el campo `packageManager`, y se reinstaló todo con pnpm.

---

## 12. Cómo se conecta todo

```text
USUARIO
   ↓
FRONTEND (Angular)       — escribe correo y contraseña
   ↓
BACKEND (Node/Express)   — recibe los datos, decide qué hacer
   ↓
PRISMA                   — traduce eso a una consulta
   ↓
POSTGRESQL               — guarda y devuelve la info del usuario
```

---

## 13. Qué se necesita instalar

- Node.js (se usó v24.16.0)
- pnpm (se usó 11.6.0)
- Docker y Docker Compose (se usó Docker 29.7.2 / Compose v5.3.1)
- PostgreSQL no hace falta instalarlo aparte, corre solo dentro de Docker
- Angular CLI tampoco hace falta instalarlo global, se usa con `pnpm dlx`
- Todo esto se probó en Windows con PowerShell

---

## 14. Instalación desde cero

**Backend**

```bash
cd backend
pnpm install
```

Crea el `.env` (usa `.env.example` como base) con tus propios valores.

**Base de datos**

```bash
docker compose up -d
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
pnpm exec prisma db seed
```

**Frontend**

```bash
cd frontend
pnpm install
```

**Para correr todo**, en dos terminales:

```bash
# dentro de backend/
pnpm run dev
```

```bash
# dentro de frontend/
pnpm start
```

Y abres `http://localhost:4200`.

---

## 15. Cosas a tener en cuenta

- El orden importa: primero la base de datos, luego el backend, al final el frontend.
- Puertos: backend en `3000`, base de datos en `5432`, frontend en `4200`.
- El `.env` nunca debe subirse a un repo público (ya está en `.gitignore`).
- Las contraseñas de los usuarios de prueba están a la vista en `prisma/seed.ts` solo para facilitar las pruebas de esta fase — cámbialas antes de un entorno real.
- Todavía no hay rutas protegidas con JWT porque no hay nada que proteger más allá del Login. Eso se suma cuando lleguen el dashboard y el resto de funcionalidades.

---

Con esto queda cerrada la primera fase: backend probado, base de datos conectada con usuarios de prueba, y el frontend hablando de verdad con el backend (nada simulado). De aquí se sigue construyendo el resto de Flow.