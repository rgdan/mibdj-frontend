# MiBDJ

## Dirección elegida

Landing en español, colorida y lúdica. La presentación y la vista previa de acceso comparten una mesa de juego. Dados, cartas y fichas son ilustraciones CSS/SVG, no una captura simulada de la aplicación.

Se consideraron una estantería personal (colección), una hoja de resultados (historial) y una mesa preparada para jugar. La mesa conecta mejor colección, partidas y participantes y permite poner el acceso en el centro de esa composición.

## Sistema

- Fondo papel `#FFF8E7`, tinta `#18243A`, acción roja `#E64B36`, fichas amarillas `#F6C84F` y tapete verde `#25866F`. Rojo oscuro `#CF3926` para texto grande con contraste sobre papel y tinta más oscura `#0A1424` sobre el botón rojo para cumplir contraste AA.
- Bricolage Grotesque local: peso 700 en titulares, 400 en texto y 600 en controles. Su dibujo irregular aporta el carácter de una caja de juego sin perder legibilidad.
- El hero usa dos columnas, el bloque de colección una superficie amarilla y los otros contenidos filas abiertas. Las composiciones varían para evitar una grilla de tarjetas repetidas.
- Bordes de tinta y sombras cortas representan piezas apoyadas sobre la mesa; los controles usan radios menores que las cartas.
- Diales: energía 3, ritmo 2, movimiento 1.

## Movimiento

Las piezas se acomodan una sola vez con transform durante 650 ms y una curva `cubic-bezier(.22, 1, .36, 1)`. Los botones se levantan al apuntarlos y se apoyan al pulsar. La página queda quieta en reposo para no competir con el formulario. Movimiento reducido elimina las animaciones y el scroll suave.

## Comportamiento

La navegación lleva a secciones reales. Entrar enfoca el username. El formulario es una vista previa visible: no envía peticiones, no guarda datos ni simula una sesión. El botón de envío permanece deshabilitado y su explicación es visible.

## Comprobación

Revisar build de producción, teclado, foco, contraste, ancho de 360 px, escritorio y movimiento reducido. Comprobar que Enter no envíe el formulario ni cambie la URL. No hay métricas, testimonios, usuarios o partidas inventados. Esta entrega es local, sin backend, publicación ni cambios a README.
