# PrintCloud v2.2 · Revisión y slider del login

Fecha: 4 de noviembre de 2026.

Aplicación del documento `PrintCloud-Mejoras-y-Slider-Login.md` sobre su base indicada, `Printcloud-Original-Mejorado-v2.1.zip`. La entrega incluye el proyecto completo y sus once pantallas; `index.html` conserva la función de matriz de elementos.

## Cambios

1. Incorporación de la base v2.1 al repositorio: refinamientos visuales y de contraste, tablas con detalle y CSV, selección persistente entre páginas y filtros, selección parcial, limpieza, búsquedas sin tildes, chips removibles, búsqueda del inventario, submit unificado y fondo inerte del menú móvil.
2. Slider del login con exactamente tres características y los textos propuestos. Sin autoplay ni dependencias nuevas de ejecución. Cada slide incluye una composición HTML/SVG marcada como demostración.
3. Anterior y Siguiente circulares, tres indicadores con `aria-pressed`, contador y anuncio breve con `role="status"`. El foco permanece en el botón utilizado. Las diapositivas inactivas tienen `hidden`, `inert`, `aria-hidden` y visibilidad oculta; se conserva su espacio para estabilizar el panel.
4. Desde 1024 px, slider izquierdo y formulario derecho. Bajo ese ancho, se muestra únicamente el formulario y el slider queda oculto, según el ajuste posterior solicitado. Se comprueba la estabilidad geométrica en las tres diapositivas.
5. Claro, Oscuro y Sistema conforme al documento actual. La preferencia Sistema se conserva y sigue al sistema operativo. Se elimina el control sin comportamiento «Recordar usuario» y se indica usar datos ficticios.
6. Fuente reutilizable en `components/login-slider.html`, integración idempotente en `scripts/refine_pages.py`, estilos específicos en `src/refinements.css` e interacciones en `src/app.js`.
7. Ampliación de QA DOM y nuevo ensayo opcional en navegador, comprobación reproducible de recursos y contraste, evidencias y capturas actuales. Los informes de v2.1 se conservan como históricos.

## Comprobaciones

- 33 casos de lógica DOM aprobados.
- 24 grupos de comprobaciones en Chrome aprobados: slider en 360/768/1024/1440 px y tres preferencias de tema, teclado, árbol accesible, estabilidad, movimiento reducido, descarga CSV y regresión de las once pantallas.
- Auditoría estática de 11 HTML sin incidencias en las reglas comprobadas.
- 233 referencias locales correctas y 15 pares seleccionados de contraste aprobados.
- Regeneración del HTML, posprocesado idempotente y compilación Tailwind verificados.

Ver `QA.md` para el alcance exacto. Quedan pendientes lectores de pantalla reales, zoom nativo, Safari/Firefox, Lighthouse/axe y revisión integral de todos los estados. Los ensayos no certifican conformidad WCAG 2.2 AA.

El prototipo no autentica ni integra RUT, backend, cámara o impresoras. La entrega corresponde al prototipo local; no se ha desplegado en un entorno productivo.
