# 💀 Caza de Espíritus 2D — Videojuego con API Canvas

**Autor:** Eduardo Zenil Guerrero — Núm. control **25200365**
**Asignatura:** Graficación · GitHub: [zenilguerrero1234-del](https://github.com/zenilguerrero1234-del)
**Demo:** https://zenilguerrero1234-del.github.io/videojuego2d/

## Contexto
Videojuego web 2D construido con la API Canvas, HTML5, CSS3, JavaScript (POO con clases) y Bootstrap 5. Ambientado en un cementerio nocturno de Día de Muertos/Halloween: calaveras, calabazas, fantasmas, murciélagos, velas, tumbas y flores de cempasúchil aparecen y desaparecen entre lluvia y relámpagos bajo la luna.

## Objetivo
Capturar con el mouse a las entidades antes de que el combo se enfríe, aplicando animación Canvas (`requestAnimationFrame` con delta-time), física de colisiones con rebote, eventos del mouse, audio por tipo de objeto y control de versiones con Git/GitHub Pages.

## Justificación
La temática de temporada hace el ejercicio más atractivo sin perder de vista los objetivos técnicos de la materia: animación 2D, detección y resolución de colisiones, manejo de estados de juego (menú, jugando, pausa), Web Audio API y organización de un proyecto real (assets, Git, despliegue).

## Operación
- Siempre hay **25 entidades** visibles. Cada una se mueve en uno de 4 patrones —**arriba, abajo, diagonal o circular**— con su propia velocidad.
- **Aparecen y desaparecen** solas: cada una tiene una vida aleatoria (6–13 s); al expirar se desvanece y reaparece en otro punto con tipo, patrón y velocidad nuevos.
- Al **chocar entre sí** rebotan con física de colisión elástica (reflexión de velocidad + separación) y se dispara una **animación de choque**: onda expansiva, chispas, "squash" del sprite y el texto «¡Choque!».
- **Clic** sobre una entidad: la captura (sonido único según el tipo), suma puntos con multiplicador de **combo**, se desvanece y reaparece lejos del clic — siempre quedan 25.
- HUD con **Capturados**, **Puntos**, **Combo**, **Precisión** y **Récord** (guardado en `localStorage`).
- Controles de **Pausar / Reanudar / Reiniciar**, overlay de bienvenida con instrucciones, música de fondo (archivo real en `/assets`) con botón de silencio, puntero personalizado que cambia al pasar sobre un objetivo, y ambientación con lluvia y relámpagos.
- El canvas es responsivo (se ajusta al ancho de la pantalla) y las coordenadas del clic se recalculan según la escala real.

## Estructura
```
videojuego2d/
├── index.html
├── css/estilos.css
├── js/juego.js
├── assets/   (7 sprites SVG, fondo, favicon, 2 cursores y música .wav)
└── README.md
```

## Reglas de negocio — verificación
| Requisito | Cumplimiento |
|---|---|
| 25 objetos, 4 direcciones, velocidades distintas | `MAX_OBJECTS=25`, `MOVEMENT_TYPES` y `speedBase` aleatorio por objeto |
| Aparecer/desaparecer con aleatoriedad | Estados `entrando/vivo/saliendo` con vida aleatoria |
| Rebote + animación de choque | `resolverColisiones()` + `efectoChoque()` |
| Imagen temática cargada | 7 sprites SVG en `/assets` (no emojis) |
| Clic elimina y reaparece, siempre 25 | `click` → `s.reset(false, p)` |
| Fondo, música y favicon | `assets/fondo.svg`, `assets/musica.wav`, `assets/favicon.svg` |
| Puntero personalizado en `/assets` | `cursor.svg` / `cursor-hit.svg` |
| Contador de clics | HUD «Capturados» |
| Header / Main / Footer con Bootstrap | `index.html` |
| Instrucciones breves | Panel «Cómo jugar» |

## Conclusiones
Este proyecto permitió integrar animación 2D, física de colisiones, manejo de estados de juego, audio sintetizado con Web Audio API y organización profesional de assets. El mayor reto fue mantener los rebotes físicamente coherentes sin romper los 4 patrones de movimiento, resuelto con una fase "balística" temporal tras cada choque. Como mejora futura se podrían agregar niveles de dificultad progresiva, enemigos especiales y un marcador en línea.
