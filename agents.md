# Reglas de arquitectura y estilo para la API REST de Eventos y Recintos

## 1. Descripción del proyecto

API RESTful construida con Node.js, Express y Mongoose para gestionar recintos, eventos y las entradas a los mismos, almacenados en una base de datos MongoDB llamada `eventos`.

## 2. Estructura de carpetas y archivos obligatoria

Todo el código fuente debe estar estructurado estrictamente de la siguiente manera:

- `models/` (Esquemas y modelos de Mongoose)
  - `models/recinto.js` (Esquema y modelo de recintos)
  - `models/evento.js` (Esquema de entradas como subdocumento, esquema y modelo de eventos con referencia al recinto)
- `routes/` (Enrutadores de Express)
  - `routes/recintos.js` (Endpoints de recintos)
  - `routes/eventos.js` (Endpoints de eventos y gestión de entradas)
- `index.js` (Punto de entrada del servidor Express y conexión a MongoDB)
- `.env` (Variables de entorno locales: `PORT` y `MONGODB_URI`)
- `.env.example` (Plantilla de ejemplo de variables de entorno)
- `.gitignore` (Exclusión de `node_modules/`, `.env`, etc.)
- `package.json` (Configuración de proyecto con ES Modules)

## 3. Base de datos y Modelos de datos

Base de datos: `eventos` en MongoDB.
Se debe respetar escrupulosamente el nombre de cada campo y modelo (coincidiendo mayúsculas y minúsculas).

### 3.1. Modelo Recintos (`models/recinto.js`)
- **nombre**: Cadena de texto (`String`), obligatorio (`required`), longitud mínima de 5 caracteres (`minlength: 5`).
- **direccion**: Cadena de texto (`String`), obligatorio (`required`), longitud mínima de 10 caracteres (`minlength: 10`).
- **localidad**: Cadena de texto (`String`), obligatorio (`required`), longitud mínima de 3 caracteres (`minlength: 3`).
- **aforoMaximo**: Numérico (`Number`), no obligatorio.

Exportar el modelo `recintos`.

### 3.2. Subdocumento Entradas (dentro de `models/evento.js`)
- **tipo**: Cadena de texto (`String`), obligatorio (`required`), longitud mínima de 3 caracteres (`minlength: 3`). Por ejemplo: "VIP", "General".
- **precio**: Numérico (`Number`), obligatorio (`required`), mayor o igual que 0 (`min: 0`).
- **disponibles**: Numérico entero (`Number`), obligatorio (`required`), mayor o igual que 0 (`min: 0`).

### 3.3. Modelo Eventos (`models/evento.js`)
- **nombre**: Cadena de texto (`String`), obligatorio (`required`), longitud mínima de 5 caracteres (`minlength: 5`).
- **fecha**: Fecha (`Date`), obligatoria (`required`).
- **recinto**: Referencia obligatoria por ID al modelo `recintos` (`type: mongoose.Schema.Types.ObjectId`, `ref: 'recintos'`, `required: true`).
- **entradas**: Array/colección de subdocumentos con el esquema de entradas definido anteriormente.

Exportar el modelo `eventos`.

## 4. Estilo de código, convenciones y protocolo de respuesta

- **Módulos**: Utilizar la sintaxis moderna de **ES Modules** (`import` / `export`) de manera homogénea en todo el proyecto. No mezclar con CommonJS (`require`).
- **Asincronía y control de errores**: Usar `async/await` de forma consistente en todos los endpoints, envueltos en bloques `try / catch`.
- **Estructura estricta de las respuestas JSON**:
  - **Todas** las respuestas deben incluir un booleano `ok`:
    - `ok: true` si la petición se ha atendido satisfactoriamente.
    - `ok: false` si se ha producido algún error de cliente o servidor (400, 404, 500).
  - En caso de **éxito**:
    - Código HTTP 200 o 201.
    - Formato JSON: `{ ok: true, resultado: <datos> }`
  - En caso de **error**:
    - Código HTTP 404 o 500 (según corresponda).
    - Formato JSON: `{ ok: false, error: "<mensaje_exacto>" }`
  *(Nota crítica: no utilizar `{ message: "..." }`. Los nombres de campo y códigos deben seguirse al pie de la letra para cumplir los criterios de calificación).*

## 5. Endpoints requeridos

### 5.1. Recintos (`routes/recintos.js`)

- `GET /recintos`:
  - Obtiene el listado de todos los recintos.
  - Si hay al menos un recinto: código `200` y `{ ok: true, resultado: <listado> }`.
  - Si no hay ningún recinto o falla la consulta: código `500` y `{ ok: false, error: "No se han encontrado recintos" }`.

- `GET /recintos/:id`:
  - Obtiene el recinto por ID.
  - Si se encuentra: código `200` y `{ ok: true, resultado: <recinto> }`.
  - Si no se encuentra (resultado nulo o error general): código `404` y `{ ok: false, error: "Recinto X no encontrado" }` (donde X es el ID de la URL).

- `GET /recintos/localidad/:nombre`:
  - Obtiene los recintos de la localidad indicada.
  - Si hay al menos uno: código `200` y `{ ok: true, resultado: <listado> }`.
  - Si no hay ninguno o falla la consulta: código `404` y `{ ok: false, error: "No se han encontrado recintos de la localidad indicada" }`.

- `POST /recintos`:
  - Añade un nuevo recinto recibido por JSON en el cuerpo (`body`).
  - Si se crea correctamente: código `201` y `{ ok: true, resultado: <recintoCreado> }`.
  - Si hay error: código `500` y `{ ok: false, error: "Error añadiendo recinto" }`.

- `DELETE /recintos/:id`:
  - Elimina el recinto por ID.
  - Si se elimina satisfactoriamente: código `200` y `{ ok: true, resultado: <recintoEliminado> }`.
  - Si no se encuentra (resultado nulo o error): código `404` y `{ ok: false, error: "Error eliminando recinto X" }` (donde X es el ID de la URL).

### 5.2. Eventos (`routes/eventos.js`)

- `GET /eventos`:
  - Obtiene todos los eventos con toda la información de recinto y entradas (usando `.populate('recinto')`).
  - Si hay al menos uno: código `200` y `{ ok: true, resultado: <listado> }`.
  - Si no hay eventos o falla la consulta: código `500` y `{ ok: false, error: "No se han encontrado eventos" }`.

- `GET /eventos/:id`:
  - Obtiene el evento por ID (con información del recinto poblada).
  - Si se encuentra: código `200` y `{ ok: true, resultado: <evento> }`.
  - Si no se encuentra (resultado nulo o error en la consulta): código `404` y `{ ok: false, error: "Evento X no encontrado" }` (donde X es el ID de la URL).

- `GET /eventos/localidad/:nombre`:
  - Obtiene los eventos que se celebren en recintos de la localidad indicada y cuya fecha aún no haya pasado (`fecha >= hoy`).
  - Si hay al menos uno: código `200` y `{ ok: true, resultado: <listado> }`.
  - Si no hay eventos o falla la consulta: código `404` y `{ ok: false, error: "No se han encontrado eventos" }`.

- `POST /eventos`:
  - Añade un nuevo evento recibido por JSON en el cuerpo (`body`).
  - Si se crea correctamente: código `201` y `{ ok: true, resultado: <eventoCreado> }`.
  - Si hay error: código `500` y `{ ok: false, error: "Error añadiendo evento" }`.

- `PUT /eventos/:id`:
  - Actualiza los datos del evento con el ID indicado.
  - Si se actualiza correctamente: código `200` y `{ ok: true, resultado: <eventoActualizado> }`.
  - Si no se encuentra (resultado nulo o error): código `404` y `{ ok: false, error: "Error actualizando evento X" }` (donde X es el ID de la URL).

- `DELETE /eventos/:id`:
  - Elimina el evento con el ID indicado.
  - Si se elimina correctamente: código `200` y `{ ok: true, resultado: <eventoEliminado> }`.
  - Si no se encuentra (resultado nulo o error): código `404` y `{ ok: false, error: "Error eliminando evento X" }` (donde X es el ID de la URL).

### 5.3. Endpoints específicos para Entradas (en `routes/eventos.js`)

- `GET /eventos/entradas/:idEvento/:tipoEntrada`:
  - Obtiene el precio y las entradas disponibles del evento y tipo de entrada indicados.
  - Si se encuentra: código `200` y `{ ok: true, resultado: { precio: <precio>, disponibles: <disponibles> } }`.
  - Si no se encuentra o hay error: código `404` y `{ ok: false, error: "Error obteniendo datos de entrada para evento X" }` (donde X es el ID del evento).

- `PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad`:
  - Resta la cantidad indicada a las entradas disponibles del evento y tipo de entrada especificados.
  - Si se actualiza correctamente: código `200` y `{ ok: true, resultado: <eventoConEntradasActualizadas> }`.
  - Si falla la operación o no hay suficientes entradas disponibles para restar: código `404` y `{ ok: false, error: "Error actualizando entradas del evento X" }` (donde X es el ID del evento).

## 6. Servidor principal (`index.js`)

- Cargar variables de entorno desde `.env` (usando `process.loadEnvFile()` o equivalente nativo).
- Conectar a la base de datos `eventos` de MongoDB vía Mongoose (`MONGODB_URI`).
- Configurar Express y el middleware `express.json()` para parsear el cuerpo de peticiones JSON.
- Cargar y montar los enrutadores:
  - `app.use('/recintos', recintosRouter)`
  - `app.use('/eventos', eventosRouter)`
- Escuchar en el puerto definido por variable de entorno (`PORT`, por defecto 3000).
