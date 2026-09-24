# Mano Amiga · Plan de sprints

Base: puntuación normalizada de la profesora (equipo JMA): 3 personas × 6 h/semana, 1 punto = 70 min.
Consigna: **la mitad de los funcionales en cada sprint**.

> **Supuesto de numeración.** La tabla de la profe usa R5, R9, R10, R13, R14, R15 y R16, y el informe de Seguridad numera los funcionales R1–R8. Tomamos esta correspondencia (por orden y cantidad): **R9 = R2 · R10 = R3 · R13 = R4 · R14 = R6 · R15 = R7 · R16 = R8 · R5 = R5**. R1 (registro/login con roles) queda dentro de RS1+RS4. Si la profe usa otra numeración, hay que ajustar esta tabla.

## Criterio

Cada requisito de seguridad va en el sprint del funcional del que **deriva** (columna "Deriva de (RF)" del informe). Así, lo que se construye en un sprint ya sale seguro desde el principio:

- **Sprint 1:** todo el circuito voluntario ↔ coordinador: actividades, inscripción, gestión de participantes y asistencia, campañas y feed. Sus requisitos de seguridad son el control por rol, la lista blanca, IDOR y el aislamiento entre organizaciones.
- **Sprint 2:** el mapa, el perfil completo y el panel de administración, con sus controles propios: revocación (RS5) y reautenticación del admin (RS9). La matriz (RS10) se cierra cuando existen todos los endpoints.

## Sprint 1 (este)

| Req. | Qué es | Puntos |
|---|---|---|
| R9 (= R2) | Publicación, edición y etiquetado de actividades | 3 |
| R10 (= R3) | Inscripción y listado filtrado por atributo (ABAC) | 4 |
| R13 (= R4) | Gestión de participantes, asistencia (QR o manual) y certificado | 3 |
| R14 (= R6) | Campañas (coordinador) y feed/muro | 2 |
| **Funcionales** | | **12** |
| RS1 + RS4 | Permiso explícito por rol, validado en el servidor (incluye R1: registro/login) | 12 |
| RS8 | Todo endpoint autenticado salvo lista blanca | 3 |
| RS2 | Un voluntario no accede a inscripciones ajenas (IDOR) | 6 |
| RS3 | Una organización no accede a recursos de otra | 6 |
| **Seguridad** | | **27** |
| **Total Sprint 1** | | **39 pts ≈ 45,5 h** |

## Sprint 2

| Req. | Qué es | Puntos |
|---|---|---|
| R5 | Mapa interactivo con actividades y puntos de donación (react-native-maps + expo-location) | 4 |
| R15 (= R7) | Administración de organizaciones y coordinadores (alta/baja) | 2 |
| R16 (= R8) | Perfil y configuración: datos de contacto, contraseña, modo oscuro, historial de accesos | 6 |
| **Funcionales** | | **12** |
| RS5 | Revocación en menos de 1 minuto al dar de baja coordinador u organización | 5 |
| RS9 | Control adicional del panel admin (reautenticación + auditoría) | 5 |
| RS10 | Matriz endpoint × rol completa (se cierra con los endpoints de admin y mapa) | 3 |
| **Seguridad** | | **13** |
| **Total Sprint 2** | | **25 pts ≈ 29 h** |

**RS6 y RS7:** según la profe, "no hacer, o pasar a funcionales". No se cuentan. Igual el código ya los cubre gratis: los DTO no exponen teléfono, apellido ni condición judicial a quien no corresponde, y el mapa/campañas solo guardan ubicaciones institucionales.

**Nota:** la tabla de la profe suma 64 puntos (24 funcionales + 40 de seguridad), aunque el texto dice 62 (25 + 37). Conviene confirmarlo con ella.

## Qué ya quedó hecho en el código base

- **Todo el Sprint 1** (backend + app + tests).
- Parte de la base del Sprint 2, porque se construye con la autenticación: el JWT solo lleva el id y los permisos se releen en cada pedido (fundamento de RS5), `revocarSesiones()` ya existe, y la matriz ya documenta los endpoints del Sprint 2 marcados `sprint: 2`.

## Cambios respecto al informe de diseño (para actualizar los informes)

| Tema | Informe | Código | Motivo |
|---|---|---|---|
| Node.js | Node 20 | Node 22 LTS o superior | Node 20 dejó de tener soporte en abril de 2026 (una versión sin parches de seguridad no es aceptable) |
| Express | Express (4) | Express 5 | Versión actual; maneja solo los errores de funciones `async` |
| Sanitización NoSQL | express-mongo-sanitize | middleware propio `sanitize.js` (misma lógica) | express-mongo-sanitize no es compatible con Express 5 |
| Hash de contraseñas | bcrypt | bcryptjs, costo 12 | Mismo algoritmo, sin compilar código nativo (evita problemas en Windows y en Alpine) |
| Notificaciones | SDK de Expo | API HTTP de Expo Push, directo | Una dependencia menos; mismo servicio (Expo → FCM/APNs) |
| DELETE /actividades/:id | Eliminar | Cancela (estado `cancelada`) | Conservar el historial de asistencias y horas |
| Endpoints nuevos | — | `GET /actividades?mias=true`, `GET /actividades/:id/asistencias`, `POST /inscripciones/:id/asistencia-manual`, `GET /health` | Listado del coordinador, validación de asistencias, "QR o manual" de R4, monitoreo. Agregarlos a la matriz 3.3 |
| QR | Vence a los 60 s | Además, solo se genera o escanea desde 2 h antes del inicio hasta 2 h después del fin | Anti-fraude extra (5.8) |
| API en desarrollo | — | Escucha solo en 127.0.0.1; el celular entra por el front-service | Replica la separación DMZ / red segura también en desarrollo |
| CORS | "se configura con los orígenes propios" | Variable `CORS_ORIGINS` en el front-service (vacía = ninguno) | 5.7 |
| Pruebas | "tests automáticos de control de acceso" | 132 tests (Jest + Supertest + mongodb-memory-server) que recorren la matriz | Evidencia de RS1, RS2, RS3, RS4, RS8 y RS10 |
