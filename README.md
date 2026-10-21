# 💀 Caza de Espíritus 2D - Motor Gráfico Interactivo

[![HTML5 Canvas](https://img.shields.io/badge/Canvas-2D-orange?style=flat-square&logo=html5)](https://developer.mozilla.org/es/docs/Web/API/Canvas_API)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap)](https://getbootstrap.com)
[![Graficación](https://img.shields.io/badge/Asignatura-Graficación-blue?style=flat-square)](https://itch.io)

> **Desarrollador:** Eduardo Zenil Guerrero  
> **Número de Control:** 25200365  
> **Asignatura:** Graficación  
> **Institución:** Instituto Tecnológico de Pachuca (TecNM Pachuca)  
> **Repositorio GitHub:** [zenilguerrero1234-del/videojuego2d](https://github.com/zenilguerrero1234-del/videojuego2d)  
> **Enlace Remoto (GitHub Pages):** [https://zenilguerrero1234-del.github.io/videojuego2d/](https://zenilguerrero1234-del.github.io/videojuego2d/)

---

## 📌 1. Contexto
El presente proyecto se desarrolla como parte de las prácticas de la materia de **Graficación**. La aplicación consiste en un videojuego interactivo en entorno web bidimensional (2D) impulsado por el API **HTML5 Canvas** y programado en JavaScript moderno (ES6+). El sistema simula un escenario nocturno ambientado en un cementerio místico (Día de Muertos / Halloween), donde se aplican algoritmos de renderizado gráfico en tiempo real a 60 FPS, matemáticas vectoriales para trayectorias complejas, detección de colisiones elásticas, iluminación dinámica mediante gradientes radiales y síntesis de audio procedural en tiempo real mediante la **Web Audio API**.

---

## 🎯 2. Objetivo
Diseñar y desarrollar un videojuego 2D optimizado para la web que cumpla rigurosamente con las siguientes reglas de negocio y especificaciones técnicas:
1. **Lienzo con 25 Objetos Activos:** Mantener de forma permanente 25 entidades 2D desplazándose simultáneamente en 4 direcciones distintas (*arriba, abajo, diagonal con rebote y circular orbital*).
2. **Dinámica y Colisiones:** Implementar velocidades independientes por objeto, aparición/desaparición aleatoria y física de rebote ante colisiones con animaciones de partículas (chispas).
3. **Temática Visual:** Aplicar sprites vectoriales temáticos (calaveras, calabazas, fantasmas, murciélagos y velas) sobre un fondo de cementerio nocturno animado (lluvia espectral y relámpagos).
4. **Interacción por Mouse:** Permitir la purificación de elementos mediante clics del cursor (con puntero personalizado tipo mira), asegurando el *respawn* inmediato en coordenadas aleatorias para conservar siempre la cuota de 25 objetos.
5. **HUD y Métricas:** Incorporar etiquetas de conteo en tiempo real para objetos atrapados, multiplicador de combo y porcentaje de precisión.
6. **Interfaz Gráfica (UI):** Maquetar el sistema utilizando Bootstrap 5 en secciones semánticas (`Header`, `Main` con menús de bienvenida/pausa y `Footer` con créditos institucionales).

---

## ⚖️ 3. Justificación
Para garantizar la máxima eficiencia, compatibilidad multiplataforma y un rendimiento impecable al ser desplegado en **GitHub Pages**, se tomó la decisión arquitectónica de **no depender de archivos multimedia externos pesados** (como imágenes PNG/JPG masivas o audios MP3). 
* **Gráficos Procedurales y Emojis Vectoriales:** Se utilizarán fuentes tipográficas y renderizado vectorial directo en Canvas, lo que reduce el tiempo de carga a cero milisegundos y garantiza un rendimiento fluido a 60 FPS.
* **Sintetizador FM (Web Audio API):** Tanto la canción ambiental de fondo (drone místico con acordes menores) como los efectos de sonido interactivos únicos por cada tipo de objeto son generados mediante algoritmos matemáticos de frecuencia en tiempo real, evitando errores de carga por rutas relativas en servidores remotos.
* **Diseño Full Stack:** Se integró un menú de bienvenida modal, controles de pausa/reanudar/reiniciar y efectos visuales avanzados (linterna dinámica y estelas espectrales) para elevar el proyecto académico al nivel de una aplicación web de producción profesional.

---

## 🎮 4. Operación del Videojuego
1. **Pantalla de Bienvenida:** Al acceder a la aplicación, se presenta un menú modal inmersivo con el título, descripción de las reglas y el botón **"🚀 Iniciar Cacería"**.
2. **Controles Principales:**
   * **Clic Izquierdo:** Haz clic sobre los espíritus en movimiento para purificarlos y sumar puntos. Si mantienes una racha rápida (menos de 1.2 segundos entre clics), activarás multiplicadores de combo ($x1, x2, x3\dots$).
   * **Botón Pausar / Reanudar:** Detiene momentáneamente las actualizaciones del motor gráfico y congela las entidades en el lienzo.
   * **Botón Reiniciar:** Restablece las métricas de puntuación, precisión y regenera las 25 entidades desde cero.
   * **Botón Audio Místico:** Activa o silencia el sintetizador de audio y la música de ambiente.
3. **Mecánica en el Canvas:** El cursor actúa como una linterna mística que ilumina el área circundante en la oscuridad del cementerio mientras las 25 entidades rebotan en los bordes o ejecutan órbitas circulares.

---

## 💡 5. Conclusiones
El desarrollo de esta aplicación permitió consolidar los conocimientos teóricos y prácticos de la materia de **Graficación**. 
* Se comprendió a profundidad el ciclo de renderizado de JavaScript (`requestAnimationFrame`) y la manipulación de contextos gráficos en 2D (`CanvasRenderingContext2D`).
* Se implementaron con éxito vectores de movimiento trigonométrico y algoritmos de detección de colisión de entidades circulares, demostrando que la programación orientada a objetos (POO) en JavaScript facilita la gestión de múltiples instancias de manera modular y limpia.
* Finalmente, el flujo de trabajo completo con **Git** y el despliegue remoto en **GitHub Pages** reafirmó la importancia de las buenas prácticas en el desarrollo web Full Stack moderno.