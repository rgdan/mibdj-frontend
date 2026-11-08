# Acceso de MiBDJ

La pantalla contiene únicamente el nombre MiBDJ y el formulario de username. Sin navegación, presentación del producto, secciones informativas ni pie de página.

## Dirección visual

Colorida y lúdica: el formulario es una carta sobre una mesa de juego, rodeado de dados y fichas dibujados en CSS/SVG. Son ilustraciones decorativas ocultas para lectores de pantalla, no capturas ficticias de la aplicación.

- Papel `#FFF8E7`, tinta `#18243A`, rojo `#E64B36`, amarillo `#F6C84F` y verde `#25866F`, derivados de piezas físicas.
- Bricolage Grotesque local: 700 para el título, 400 para texto y 600 para controles. Su dibujo da carácter sin agregar otra familia tipográfica.
- Bordes definidos y sombras cortas representan cartas y fichas apoyadas sobre la mesa. El espacio y los controles se ajustan en teléfono para mantener el acceso visible.
- Energía 3, ritmo 1 y movimiento 1. Las piezas se acomodan una vez durante 650 ms y quedan quietas. Movimiento reducido elimina esa entrada.

## Comportamiento

El primer Tab enfoca el username, con un contorno visible. El acceso sigue siendo una vista previa señalada: botón deshabilitado, explicación visible y formulario sin peticiones ni almacenamiento. Enter no crea sesiones ni cambia la URL. No hay selector de usuarios ni contraseña.

## Comprobación

`npm test` construye producción y comprueba 360, 390 y 1440 px, teclado, ausencia de navegación y pie, formulario sin envío, almacenamiento vacío y movimiento reducido. Playwright requiere `npx playwright install chromium --only-shell` en un entorno nuevo.

El desarrollo local se inicia con `npm run dev`. Esta versión no conecta el backend, no se publica y no modifica README.

## Resultado de revisión

- Hard Gate PASS: build y cuatro pruebas de navegador correctos; Axe no detectó infracciones A/AA a 360, 390 y 1440 px. El formulario no envía peticiones ni guarda datos.
- Purpose Gate PASS: la paleta, las piezas y sus sombras tienen su razón en la composición de mesa; solo queda el contenido del acceso.
- Liveliness PASS: energía 3 y movimiento 1 mediante una entrada breve de piezas, sin animación continua ni movimiento cuando se pide reducirlo.
- Craft PASS: el primer Tab enfoca el único campo, no hay desbordamiento horizontal, navegación ni pie. El estado de vista previa permanece visible.

Capturas verificadas con Chromium de escritorio y tamaños de teléfono simulados; sin prueba en un teléfono físico.
