# MiBDJ · Frontend

Interfaz de Mi base de datos de juegos de mesa, hecha con React, TypeScript y Vite.

## Ejecutar en local

Con Node.js y npm instalados:

```sh
npm install
cp .env.example .env
npm run dev
```

Abrí la dirección que aparece en la terminal.

En `.env`, `VITE_API_URL` indica la dirección del backend:

```dotenv
VITE_API_URL=http://localhost:8080
```

Si cambiás esa dirección, reiniciá `npm run dev`. Para producción, configurala
antes de ejecutar el build. Las variables `VITE_` quedan visibles en el navegador;
no pongás contraseñas ni secretos en ellas.

Para generar la versión de producción: `npm run build`.

## Acceso

Con el backend y MySQL corriendo, entrá con el email de un usuario precargado,
por ejemplo `ana.mora@gmail.com`. No se pide contraseña.

Las secciones aparecen después de entrar. `Salir` limpia el usuario activo.
El acceso se mantiene en memoria; al recargar la página hay que volver a entrar.
Catálogo, colección, deseos, partidas y estadísticas todavía muestran pantallas
provisionales.

## Backend

[rgdan/mibdj-backend](https://github.com/rgdan/mibdj-backend)
