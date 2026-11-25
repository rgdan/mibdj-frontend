# Arrancar el frontend

Necesitás Node.js, npm y el [backend en ejecución](https://github.com/rgdan/mibdj-backend/blob/main/docs/setup.md).
Ejecutá los comandos desde la raíz del frontend.

## Primera vez

```sh
npm install
cp .env.example .env
```

En `.env`, poné la dirección de tu backend:

```dotenv
VITE_API_URL=http://localhost:8080
```

## Arrancar

```sh
npm run dev
```

Abrí la dirección que muestra la terminal. Si cambiás `.env`, reiniciá el servidor.

## Compilar

```sh
npm run build
```

El build queda en `dist/`. La URL de la API se toma al compilar;
las variables `VITE_` son públicas y no deben contener secretos.

[Volver al README](../README.md)
