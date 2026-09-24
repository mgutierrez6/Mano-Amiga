# Mano Amiga · Guía para arrancar a desarrollar (Sprint 1)

Esta guía va paso a paso, pensada para Windows y para alguien que nunca usó Expo, Express ni MongoDB. Seguila en orden la primera vez. Después, para trabajar día a día, alcanza con la sección **"Cómo se trabaja todos los días"**.

---

## 0. Qué hay en este repositorio

```
mano-amiga/
├── README.md                 ← esta guía
├── docs/PLAN_SPRINTS.md      ← reparto de requisitos por sprint + cambios para los informes
├── mano-amiga-server/
│   ├── .env.example          ← modelo de variables de entorno (se copia como .env)
│   ├── docker-compose.yml    ← despliegue en el servidor (más adelante, en EC2)
│   ├── mongo-init/           ← crea el usuario de MongoDB con permisos mínimos (Docker)
│   ├── front-service/        ← la "puerta de entrada" (DMZ): helmet + rate limit + proxy
│   └── backend/              ← la API: Express + Mongoose + toda la seguridad
│       ├── src/security/matriz.js   ← RS10: matriz endpoint × rol (la usan los tests)
│       ├── src/middlewares/          ← auth (RS5, RS8), authorize (RS1/RS4), validate, sanitize…
│       ├── src/services/             ← reglas de negocio: RS2, RS3, ABAC, cupos, QR, horas
│       └── tests/                    ← 132 tests automáticos de control de acceso
└── mano-amiga-app/           ← la app en React Native con Expo (SDK 57)
    └── src/ api · context · navigation · screens · components · hooks · services
```

Cómo viaja un pedido, igual que en el informe de Apps Móviles:

```
Celular (Expo Go) ──HTTP──▶ front-service :8080 ──▶ API :3000 ──▶ MongoDB Atlas
                            (DMZ)                   (red segura)
```

En desarrollo la API solo escucha en tu propia compu (127.0.0.1), así que el celular **siempre** entra por el front-service, como pasaría en producción.

---

## 1. Instalar las herramientas (una sola vez, cada integrante)

1. **Node.js LTS** → https://nodejs.org → botón "LTS" → instalador de Windows → Siguiente, Siguiente… (dejá marcada la opción que agrega Node al PATH).
   Para comprobarlo, abrí una terminal nueva (tecla Windows → escribí `cmd` o `PowerShell`) y ejecutá:
   ```
   node -v
   npm -v
   ```
   Tiene que decir `v22.x` o superior.
2. **Git** → https://git-scm.com/download/win → instalá con las opciones por defecto.
3. **Visual Studio Code** → https://code.visualstudio.com (si no lo tienen).
4. En el **celular**: instalá **Expo Go** desde Play Store o App Store.

> Si en PowerShell te aparece "la ejecución de scripts está deshabilitada" al usar `npm`, usá **cmd** en vez de PowerShell, o ejecutá una vez: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

---

## 2. Crear la base de datos en MongoDB Atlas (una sola persona)

Van a usar **un solo cluster compartido** para desarrollo, así ven todas los mismos datos.

### 2.1 El formulario de bienvenida ("Getting to know your project")

Estas respuestas son solo una encuesta de Atlas: no cambian nada técnico. Elegí:

| Pregunta | Qué poner |
|---|---|
| What programming language…? | **JavaScript / Node.js** |
| What type(s) of data…? | La opción de **datos operacionales/transaccionales (documentos JSON)** y **Geospatial** (por el mapa y el índice `2dsphere`). Si no aparecen con ese nombre, elegí las que más se parezcan. |
| Architectural models? | **Mobile** si aparece; si no, dejalo vacío o "Not sure". No marques microservicios, serverless ni IA/RAG. |

### 2.2 Crear el cluster

1. **Create cluster** → elegí **Free (M0)**.
2. Provider: **AWS**. Region: **São Paulo (sa-east-1)** (la más cercana a Uruguay).
3. Name: `mano-amiga`. **Create deployment**.

### 2.3 Usuario de la base (mínimo privilegio, sección 5.6 del informe)

1. Atlas te va a ofrecer crear un usuario: poné **Username** `manoamiga_app` y tocá **Autogenerate secure password**. **Copiá la contraseña** y guardala (la vas a usar en el `.env`).
2. Después, en el menú izquierdo **Security → Database Access**, tocá **Edit** en ese usuario → **Built-in Role**: sacalo → **Specific Privileges** → `readWrite` sobre la base **`mano_amiga`** → **Update User**.
   Así la API solo puede leer y escribir su base, no administrar el cluster.

### 2.4 Acceso por red (lista de IPs permitidas)

1. **Security → Network Access → Add IP Address → Add Current IP Address → Confirm**.
2. **No** uses `0.0.0.0/0` (abre la base a todo Internet).
3. Invitá a tus compañeras al proyecto: **Project Access Manager (arriba, ícono de personas) → Invite to project** con rol *Project Owner* o *Project Data Access Read/Write*. Cada una entra y agrega **su propia IP** con el mismo botón. Si cambian de WiFi (casa ↔ facultad) hay que agregar la IP nueva.

### 2.5 Obtener la cadena de conexión

1. **Database → Connect → Drivers → Node.js**.
2. Copiá algo así:
   `mongodb+srv://manoamiga_app:<db_password>@mano-amiga.abc123.mongodb.net/?retryWrites=true&w=majority&appName=mano-amiga`
3. **Muy importante**: reemplazá `<db_password>` por la contraseña y agregá el nombre de la base **`mano_amiga`** justo antes del `?`:
   `mongodb+srv://manoamiga_app:LaContraseña@mano-amiga.abc123.mongodb.net/`**`mano_amiga`**`?retryWrites=true&w=majority&appName=mano-amiga`
   Si no ponés `/mano_amiga`, Mongo usa la base `test` y el usuario no va a tener permiso.
4. Si la contraseña tiene caracteres raros (`@ : / ? #`), regenerala desde Atlas; las autogeneradas son solo letras y números.

---

## 3. Subir el código a GitHub (una sola persona)

1. En https://github.com → **New repository** → nombre `mano-amiga` → **Private** → sin README → **Create**.
2. Descomprimí el zip en `Documentos\mano-amiga`, abrí una terminal **dentro de esa carpeta** (en el Explorador: clic en la barra de direcciones, escribí `cmd` y Enter) y ejecutá:
   ```
   git init
   git add .
   git commit -m "Base del Sprint 1"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/mano-amiga.git
   git push -u origin main
   ```
3. Agregá a tus compañeras: **Settings → Collaborators → Add people**.
4. Ellas clonan con: `git clone https://github.com/TU_USUARIO/mano-amiga.git`

> El `.gitignore` ya evita subir `node_modules` y los archivos `.env`. **Nunca** subas un `.env`: tiene secretos.

---

## 4. Configurar y levantar el servidor (cada integrante)

### 4.1 Crear el `.env`

1. En `mano-amiga-server`, copiá `.env.example` y renombrá la copia a **`.env`** (sin nada más; en Windows activá "Ver → Extensiones de nombre de archivo" para que no quede `.env.txt`).
2. Completá:
   - `MONGO_URI` → la cadena del paso 2.5.
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `QR_SECRET` → tres valores **distintos**. Generá cada uno con:
     ```
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - `SEED_ADMIN_PASSWORD`, `SEED_COORD_PASSWORD`, `SEED_JUDICIAL_PASSWORD` → contraseñas de prueba de al menos 8 caracteres (son las de los usuarios de ejemplo).
   - El resto se deja como está.

   Pueden compartir entre ustedes el mismo `.env` **por un canal privado** (no por Git).

### 4.2 Instalar dependencias y cargar los datos iniciales

Terminal 1:
```
cd mano-amiga-server\backend
npm install
npm run seed
```
El `seed` crea los índices, el catálogo de etiquetas (con cuáles son sensibles para ABAC), una **Organización Demo**, un **admin**, un **coordinador** y un **voluntario judicial** con los emails y contraseñas del `.env`. Se puede correr varias veces sin duplicar nada. **Solo hace falta que lo corra una persona** (la base es compartida).

### 4.3 Levantar la API

En la misma terminal 1:
```
npm run dev
```
Tiene que decir `API de Mano Amiga escuchando en 127.0.0.1:3000`. `npm run dev` usa *nodemon*: cada vez que guardás un archivo, se reinicia sola. Dejá esa terminal abierta.

### 4.4 Levantar el front-service

Terminal 2 (nueva):
```
cd mano-amiga-server\front-service
npm install
npm start
```
Tiene que decir `Front-service (desarrollo, HTTP) en el puerto 8080`. Si Windows pregunta por el **Firewall**, tocá **Permitir** en *redes privadas* (si no, el celular no llega).

Probá en el navegador de la compu: http://localhost:8080/api/v1/health → `{"ok":true}`
y http://localhost:8080/api/v1/etiquetas → la lista de etiquetas.

### 4.5 Correr los tests de seguridad

Con la API apagada o prendida, da igual (usan una base propia en memoria):
```
cd mano-amiga-server\backend
npm test
```
La primera vez descarga MongoDB para los tests (unos 100 MB, tarda un rato). Tienen que pasar **132 tests**: la matriz endpoint × rol (RS1, RS4, RS8, RS10), IDOR en inscripciones (RS2), aislamiento entre organizaciones (RS3), ABAC del voluntario judicial, revocación inmediata (base de RS5), rotación de refresh tokens, inyección NoSQL, mass assignment, cupos concurrentes y el QR firmado. Estos tests son **evidencia** para el informe de Seguridad.

---

## 5. Levantar la app en el celular (cada integrante)

1. Averiguá la IP de tu compu: en cmd, `ipconfig` → buscá **Dirección IPv4** del adaptador WiFi (ej. `192.168.1.50`).
2. En `mano-amiga-app`, copiá `.env.example` como **`.env`** y poné tu IP:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.50:8080/api/v1
   ```
3. Terminal 3:
   ```
   cd mano-amiga-app
   npm install
   npx expo start
   ```
4. Aparece un **QR en la terminal**. Con el celular **en la misma WiFi que la compu**:
   - Android: abrí **Expo Go** → *Scan QR code*.
   - iPhone: abrí la **cámara** y apuntá al QR.
5. La app compila y abre. Cada vez que guardás un archivo, se actualiza sola en el celular. En la terminal: `r` recarga, `j` abre el depurador.

Para probar: registrate como voluntaria, o entrá con el coordinador del `.env` (`coord@manoamiga.test`) para crear actividades, aceptar inscriptos y mostrar el QR.

### Problemas comunes

| Síntoma | Solución |
|---|---|
| La app dice "No pudimos conectarnos con el servidor" | ¿Front-service prendido? ¿IP correcta en `.env` de la app? ¿Misma WiFi? ¿Firewall de Windows permitió Node? Probá abrir `http://TU_IP:8080/api/v1/health` **desde el navegador del celular**. Si cambiaste el `.env` de la app, reiniciá `npx expo start -c`. |
| La WiFi de la facultad no deja que el celular vea la compu | Compartí internet desde el celular (hotspot) y conectá la compu a esa red; usá la IP nueva. |
| Expo Go dice que el proyecto usa otro SDK | Actualizá Expo Go desde la tienda. Si Expo Go ya está en un SDK más nuevo, en `mano-amiga-app` corré `npx expo install expo@latest --fix`. |
| `MongoServerError: bad auth` | Contraseña mal copiada en `MONGO_URI`. |
| `not authorized on test` o `on mano_amiga` | Falta `/mano_amiga` antes del `?`, o el usuario no tiene `readWrite@mano_amiga`. |
| Timeout conectando a Atlas | Tu IP no está en *Network Access* (cambiaste de WiFi). |
| `Falta la variable de entorno …` | El `.env` no está en `mano-amiga-server` o le falta ese valor. |
| El QR dice "fuera de horario" | El QR solo funciona desde 2 h antes del inicio hasta 2 h después del fin. Para probar, creá una actividad que empiece ahora. |
| Notificaciones push | En Expo Go no funcionan (Expo las quitó en Android). La API y la app ya están listas; se prueban con un *development build* en el Sprint 2. |

---

## 6. Cómo se trabaja todos los días

```
git pull                              ← traer lo último
(terminal 1) cd mano-amiga-server\backend        && npm run dev
(terminal 2) cd mano-amiga-server\front-service  && npm start
(terminal 3) cd mano-amiga-app                    && npx expo start
```
Si alguien agregó dependencias (cambió un `package.json`), corré `npm install` en esa carpeta.

Para trabajar sin pisarse, cada una en su rama:
```
git checkout -b feature/mapa          ← rama nueva
... cambios ...
git add .
git commit -m "Mapa con puntos institucionales"
git push -u origin feature/mapa
```
Y en GitHub abren un **Pull Request** para que otra lo revise antes de unir a `main` (la revisión de código contra la matriz de `src/security/matriz.js` es justamente lo que pide RS10).

**Checklist cada vez que agreguen un endpoint** (si no, los tests fallan a propósito):
1. Agregarlo a `backend/src/security/matriz.js` con sus roles.
2. En la ruta: `authorize(...)` → `validate(...)` → controller.
3. En el service: chequear organización (`permisos.assertMismaOrganizacion`, RS3) o titularidad (`permisos.assertTitular`, RS2) según corresponda.
4. Devolver un DTO (`services/dto.js`), nunca el documento de Mongo entero.
5. `npm test`.

---

## 7. Cómo está organizado el código (para entenderlo rápido)

**Backend** — un pedido recorre siempre: `routes → middlewares → controllers → services → models`.

| Archivo | Qué hace | Requisito |
|---|---|---|
| `app.js` | helmet, límite de 100 KB, sanitización NoSQL y el "portero" global | 5.4, 5.7 |
| `middlewares/auth.js` | verifica el JWT y **relee al usuario en la base en cada pedido**; si está inactivo o su organización fue dada de baja → 401 | RS5 |
| `requerirAuthSalvoListaBlanca` | todo `/api/v1` exige token salvo lo marcado público en la matriz | RS8 |
| `middlewares/authorize.js` | control por rol + auditoría del intento denegado | RS1, RS4 |
| `middlewares/validate.js` | Joi con `stripUnknown`: lo que no está en el esquema se descarta | mass assignment |
| `services/permisos.js` | `assertMismaOrganizacion`, `assertTitular`, `assertABAC` | RS3, RS2, ABAC |
| `services/dto.js` | cada respuesta con solo los campos que corresponden | A5 |
| `services/auth.service.js` | bcrypt, login con mensaje genérico, refresh con rotación y detección de reuso | 5.1, 5.2 |
| `services/inscripcion.service.js` | cupo atómico, IDOR, aceptar/rechazar, certificado | R3, R4 |
| `services/asistencia.service.js` + `qr.service.js` | QR firmado de 60 s, check-in, validación, horas calculadas | 2.3, 5.8 |
| `utils/auditoria.js` | registro de logins y acciones sensibles | 5.9 |

**App** — `App.js` monta el `AuthContext` y el `RootNavigator`. Las pantallas nunca llaman a la red directo: usan `src/api/*`, que pasa por `src/api/client.js` (axios con interceptores: agrega el token, renueva la sesión con el refresh token ante un 401, y si no puede vuelve al login). El refresh token se guarda cifrado con **expo-secure-store**; el access token vive solo en memoria. Las pestañas cambian según el rol, pero es solo comodidad: la API valida todo.

---

## 8. Más adelante: despliegue en AWS EC2 (no hace falta ahora)

Cuando tengan el servidor: instalar Docker, clonar el repo, crear el `.env` (con `MONGO_ROOT_PASSWORD`, `MONGO_APP_PASSWORD` y `DOMINIO`), sacar el certificado con certbot y `docker compose up -d --build`. El `docker-compose.yml` ya implementa las redes `dmz_net` / `secure_net (internal)` / `egress_net` del informe, y la API y Mongo no publican puertos. La app se compila con `eas build -p android --profile preview`.
