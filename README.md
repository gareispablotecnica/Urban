# VOID Streetwear

Aplicación web de comercio electrónico para una marca de ropa urbana. Incluye una página de inicio y un catálogo de productos con filtros combinables. Frontend en React, backend en Node.js con Express y persistencia en SQLite.

## Tabla de contenidos

1. [Características](#características)
2. [Tecnologías](#tecnologías)
3. [Requisitos](#requisitos)
4. [Instalación](#instalación)
5. [Ejecución](#ejecución)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Configuración de imágenes](#configuración-de-imágenes)
8. [Gestión de productos](#gestión-de-productos)
9. [Documentación de la API](#documentación-de-la-api)
10. [Scripts disponibles](#scripts-disponibles)
11. [Solución de problemas](#solución-de-problemas)
12. [Próximos pasos](#próximos-pasos)

## Características

- Página de inicio con sección principal, categorías destacadas, novedades, banner de ofertas y suscripción a newsletter.
- Catálogo de productos con filtrado por categoría, talle, color, rango de precio y ofertas.
- Búsqueda por nombre y ordenamiento por novedad, precio o nombre.
- Estado de los filtros almacenado en la URL, lo que permite compartir y recargar una búsqueda sin perderla.
- Diseño responsivo; en pantallas pequeñas los filtros se muestran en un panel lateral.
- Imagen de reemplazo automática cuando un producto no tiene foto o su enlace falla.
- Base de datos inicializada automáticamente con productos de ejemplo.
- Registro e inicio de sesión de usuarios, con contraseñas cifradas (bcrypt) y sesión mediante token JWT.
- Página de cuenta protegida, accesible solo con sesión iniciada.
- Respeto por la preferencia de movimiento reducido del sistema operativo.

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React 18, React Router 6, Vite 5 |
| Backend | Node.js, Express 4 |
| Base de datos | SQLite (paquete `sqlite3`) |
| Autenticación | `bcryptjs` y `jsonwebtoken` |
| Estilos | CSS puro con variables personalizadas |

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

Para verificar las versiones instaladas:

```bash
node -v
npm -v
```

## Instalación

Desde la raíz del proyecto:

```bash
npm run install:all
```

Este comando instala las dependencias de la raíz, del servidor y del cliente.

## Ejecución

Para iniciar el servidor y el cliente en simultáneo:

```bash
npm run dev
```

| Servicio | URL |
|----------|-----|
| Aplicación web | http://localhost:5173 |
| API | http://localhost:4000 |

Al iniciar por primera vez, el servidor crea el archivo `server/store.db` y lo completa con los productos definidos en `server/seed.js`. El cliente redirige las solicitudes que comienzan con `/api` hacia el servidor mediante el proxy de Vite.

Para ejecutar cada parte por separado:

```bash
npm run server
npm run client
```

## Estructura del proyecto

```
urbanwear/
  package.json              Scripts globales
  server/
    index.js                Servidor Express, esquema y consultas SQLite
    seed.js                 Productos iniciales e imagen de portada
    store.db                Base de datos (se genera al iniciar)
  client/
    index.html
    vite.config.js          Configuración de Vite y proxy hacia la API
    src/
      main.jsx              Punto de entrada
      App.jsx               Encabezado, rutas y pie de página
      styles.css            Estilos globales
      pages/
        Home.jsx            Página de inicio
        Products.jsx        Catálogo con filtros
      components/
        ProductCard.jsx     Tarjeta de producto e imagen de reemplazo
```

## Configuración de imágenes

Las imágenes se referencian por URL; la aplicación no las almacena. Para asignar una foto a un producto:

1. Abrir el pin o la imagen de origen.
2. Hacer clic derecho sobre la imagen y elegir "Copiar dirección de imagen". La dirección debe apuntar directamente al archivo, por ejemplo `https://i.pinimg.com/736x/xx/xx/xxxx.jpg`, y no a la página que lo contiene.
3. Pegar la dirección en el campo `image` del producto en `server/seed.js`.
4. Para la imagen de portada del inicio, completar la constante `HERO_IMAGE` en el mismo archivo.
5. Eliminar `server/store.db` y reiniciar el servidor para recargar los datos.

Antes de publicar el sitio, verificar que se cuenta con los derechos de uso de cada imagen. Muchas imágenes de Pinterest pertenecen a terceros y pueden requerir autorización o licencia. Además, enlazar directamente a imágenes ajenas puede dejar de funcionar si la fuente las modifica o elimina.

## Gestión de productos

Cada producto en `server/seed.js` tiene los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | texto | Nombre visible |
| `category` | texto | `hoodies`, `remeras`, `pantalones`, `camperas`, `zapatillas` o `accesorios` |
| `price` | entero | Precio actual en pesos |
| `old_price` | entero o `null` | Precio anterior; si existe, el producto se considera en oferta |
| `color` | texto | Color principal, en minúsculas |
| `sizes` | texto | Talles separados por coma, por ejemplo `S,M,L` |
| `tag` | texto | Etiqueta opcional: `NEW`, `SALE` o `HOT` |
| `image` | texto | URL de la imagen; puede quedar vacío |

La semilla solo se aplica cuando la tabla está vacía. Para recargar los datos tras editar el archivo, eliminar `server/store.db` y reiniciar.

Los colores con representación propia en los filtros son: negro, blanco, gris, azul, verde, rojo y beige. Un color distinto se mostrará con un tono neutro por defecto; para personalizarlo, agregarlo al objeto `COLOR_HEX` en `client/src/pages/Products.jsx` y a `PALETTE` en `client/src/components/ProductCard.jsx`.

## Documentación de la API

### GET /api/products

Devuelve la lista de productos. Todos los parámetros son opcionales y se pueden combinar.

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `category` | Una o varias categorías separadas por coma | `hoodies,remeras` |
| `size` | Uno o varios talles separados por coma | `M,L` |
| `color` | Uno o varios colores separados por coma | `negro,verde` |
| `min` | Precio mínimo | `30000` |
| `max` | Precio máximo | `80000` |
| `q` | Texto contenido en el nombre | `cargo` |
| `sale` | `1` para devolver solo productos en oferta | `1` |
| `sort` | `price_asc`, `price_desc`, `name` o `new` | `price_asc` |
| `limit` | Cantidad máxima de resultados | `4` |

Ejemplo:

```
GET /api/products?category=pantalones&size=M&max=80000&sort=price_asc
```

Respuesta:

```json
[
  {
    "id": 9,
    "name": "Jogger Tech Fleece",
    "category": "pantalones",
    "price": 58000,
    "old_price": null,
    "color": "gris",
    "sizes": ["S", "M", "L"],
    "tag": "",
    "image": "",
    "on_sale": false
  }
]
```

### GET /api/filters

Devuelve los valores disponibles para construir los filtros: categorías con su cantidad de productos, colores, talles, precio mínimo y precio máximo.

### Autenticación

| Método y ruta | Descripción | Cuerpo |
|---------------|-------------|--------|
| `POST /api/auth/register` | Crea una cuenta y devuelve token y usuario | `name`, `email`, `password` (mínimo 6 caracteres) |
| `POST /api/auth/login` | Inicia sesión y devuelve token y usuario | `email`, `password` |
| `GET /api/auth/me` | Devuelve el usuario de la sesión actual | Encabezado `Authorization: Bearer <token>` |

Los usuarios se guardan en la tabla `users` de `server/store.db`. Las contraseñas nunca se almacenan en texto plano. El token vence a los 7 días.

Para producción, definir la variable de entorno `JWT_SECRET` con un valor largo y aleatorio; si no existe, se usa un valor de desarrollo que no debe publicarse. El cliente guarda el token en `localStorage`, adecuado para practicar; en un sitio real conviene usar una cookie `httpOnly`. El servidor no limita intentos de inicio de sesión, por lo que también conviene agregar un límite antes de publicarlo.

### GET /api/config

Devuelve la configuración pública, actualmente la imagen de portada (`heroImage`).

## Scripts disponibles

| Script | Ubicación | Función |
|--------|-----------|---------|
| `npm run install:all` | raíz | Instala todas las dependencias |
| `npm run dev` | raíz | Inicia servidor y cliente en modo desarrollo |
| `npm run server` | raíz | Inicia solo el servidor, con recarga automática |
| `npm run client` | raíz | Inicia solo el cliente |
| `npm run build` | `client/` | Genera la versión de producción en `client/dist` |

## Solución de problemas

**Error al instalar `sqlite3`.** El paquete descarga un binario precompilado según el sistema y la versión de Node. Si falla, verificar que Node sea 18 o superior y la conexión a internet. En caso de persistir, instalar las herramientas de compilación de la plataforma.

**El puerto 4000 o 5173 está ocupado.** El puerto de la API se cambia con la variable de entorno `PORT`; en ese caso hay que actualizar también el destino del proxy en `client/vite.config.js`. El puerto del cliente se modifica en el mismo archivo.

**Los productos no se actualizan tras editar `seed.js`.** La semilla solo se carga con la tabla vacía. Eliminar `server/store.db` y reiniciar el servidor.

**Las imágenes no se muestran.** Confirmar que la dirección apunta al archivo de imagen y que se abre directamente en el navegador. Si el enlace falla, la aplicación muestra la imagen de reemplazo.

## Próximos pasos

Mejoras sugeridas para llevar el proyecto a producción:

- Página de detalle de producto.
- Carrito persistente y proceso de pago.
- Panel de administración para cargar productos sin editar archivos.
- Subida de imágenes propias en lugar de enlaces externos.
- Paginación del catálogo.
- Pruebas automatizadas de la API y de los componentes.
