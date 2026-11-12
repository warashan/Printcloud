# QA actual · PrintCloud v2.2

Fecha: 4 de noviembre de 2026. Base: `Printcloud-Original-Mejorado-v2.1.zip`. Pruebas ejecutadas sobre el proyecto actualizado, con Node 24, Python 3.12 y Chrome/Chromium local mediante Playwright. Las solicitudes remotas de fuentes se bloquearon para verificar el funcionamiento con recursos locales.

## Resultados ejecutados

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Sintaxis de JS y del generador Python | Sin errores | `node --check`, Python 3.12 |
| Inicialización de las once páginas y lógica de tabla, CSV, formularios, filtros, tema e inventario | 33 casos DOM aprobados, incluyendo 6 casos del slider | `QA-DOM.json`, `scripts/qa-dom.mjs` |
| Semántica estática: main, h1, labels, IDs, ARIA, alt, botones y salto de contenido | 11 páginas, 0 incidencias en esas reglas | `QA-ESTATICA.txt` |
| Recursos y anclas locales | 233 referencias, 0 errores | `QA-RECURSOS.json`, `scripts/qa-resources.py` |
| Pares de contraste seleccionados, incluyendo slider y controles | 15/15 pares superan su umbral de 4,5:1 o 3:1 | `QA-CONTRASTE.json` |
| Compilación Tailwind | 11 páginas; estilos compilados sin error | `QA-BUILD.txt` |
| Regeneración y conservación del slider | Slider presente después de generar; posprocesado idéntico entre dos pasadas | `QA-REGENERACION.json` |
| Chrome: slider a 360/768/1024/1440 px en Claro, Oscuro y Sistema | 12 combinaciones verificadas; formulario primero bajo 1024 px; dos columnas desde 1024 px; sin overflow | `QA-BROWSER.json`, `qa-v2.2/login-*.png` |
| Estabilidad al cambiar entre las tres diapositivas | Formulario, controles y altura del slider sin desplazamientos superiores a 1 px | Ensayo geométrico de `scripts/qa-browser.mjs` |
| Controles e indicadores | Anterior, Siguiente y los tres indicadores operativos con Enter/Espacio; foco conservado; contador y estado coherentes; controles de 44 × 44 px o mayores | `QA-BROWSER.json` |
| Diapositivas inactivas | Dos con hidden, inert y aria-hidden; el árbol accesible de Chrome expone solo la activa | `QA-BROWSER.json` |
| Movimiento reducido y ausencia de autoplay | Cambio de slide sin animación al preferir movimiento reducido; ninguna rotación automática | `QA-BROWSER.json` y ausencia de temporizador en implementación |
| Preferencia Sistema | Cambios del SO actualizan claro/oscuro conservando la opción Sistema | Prueba DOM y Chrome |
| Login | Envío con Enter conserva feedback de demostración y no autentica | Chrome |
| Tabla en navegador | Selección parcial y entre páginas, foco al paginar, filtro «Vina», diálogo nativo, Escape y descarga CSV real correctos | `QA-BROWSER.json`; CSV con oficina filtrada, sin filas ajenas |
| Menú móvil | Panel de notificaciones cerrado, fondo inerte, Shift+Tab contenido y retorno al botón al usar Escape | Chrome |
| Regresión de las 11 pantallas | Sin overflow de página en 360/768/1024/1440 px ni excepciones JS | 44 combinaciones, `QA-BROWSER.json` |
| Reflow equivalente a 200%/400% de un área de 1440 px | Sin overflow del login a 720/360 px | Prueba geométrica; no equivale a zoom nativo |

La suite de navegador registra 24 grupos de comprobaciones; algunas agrupan múltiples escenarios. Las capturas de diapositivas 2 y 3 están disponibles adicionalmente a 360 y 1440 px. Las tablas mantienen desplazamiento horizontal dentro de su región.

## Límites y pendientes

- **No ejecutado:** prueba con NVDA, VoiceOver o TalkBack reales. El árbol accesible automatizado no reemplaza escuchar la navegación y los mensajes con esas herramientas.
- **No ejecutado:** zoom nativo del navegador al 200% y 400%, tamaño de texto personalizado, espaciado de texto y control de voz. Se verificó reflow equivalente, no el zoom del navegador.
- **No ejecutado:** Safari, Firefox, dispositivos táctiles físicos, Lighthouse, axe y auditoría integral de contraste de todos los estados y páginas.
- Los tests DOM simulan matchMedia, dialog, Blob y URL. Los ensayos de Chrome complementan esos resultados con layout, foco nativo, diálogo y descarga real, usando file://. Sigue pendiente verificar el hosting objetivo.
- El prototipo no contiene autenticación, validación real del RUT ni integraciones productivas. Sus flujos no permiten certificar el sistema futuro.

Los resultados anteriores a esta actualización se encuentran en `historico-v2.1/` y `historico-v2/`. No se declara conformidad integral WCAG 2.2 AA.

## Reproducir

Instalar las dependencias de desarrollo con `npm ci` y las de Python con `python3 -m pip install -r requirements-build.txt`. Usar Python 3.12 o posterior para el generador original.

```bash
python3 scripts/generate.py
npm run build
npm run qa:dom
python3 scripts/audit_static.py
python3 scripts/qa-resources.py
```

Para las pruebas de Chrome: disponer de Playwright, configurar `PRINTCLOUD_PLAYWRIGHT_PATH` si el módulo no se resuelve por nombre y `PRINTCLOUD_CHROME_PATH` si se utiliza Chrome del sistema; ejecutar `npm run qa:browser`. Las herramientas de QA no son dependencias de ejecución de la plantilla.

## Ajuste posterior · Login móvil sin slider

Por solicitud posterior, bajo 1024 px el panel informativo queda oculto y solo se muestra el formulario de acceso. Se comprobó en Chrome a 360, 768, 1023, 1024 y 1440 px, en claro y oscuro: formulario visible, slider oculto también en el árbol accesible móvil, slider operativo en escritorio y ausencia de overflow. Las capturas y el informe completo anteriores reflejan el diseño previo con slider debajo del formulario en móvil; esta nota actualiza ese comportamiento.

## Actualización · Dashboard y acentos visuales · 10 de noviembre de 2026

Se añadió `dashboard.html`, accesible desde «Páginas de prueba» y desde la portada. El proyecto tiene ahora 12 pantallas. Se conservan las comprobaciones anteriores como evidencia de sus respectivas revisiones.

- Suite DOM ampliada: **38 casos aprobados**, incluyendo filtros, totales coherentes, paginación, estado vacío y detalle del Dashboard. Evidencia: `QA-DASHBOARD-DOM.json`.
- Chrome local: **13 grupos aprobados**, incluyendo filtros y gráficos coherentes, búsqueda sin tildes, paginación, detalle con Escape y retorno de foco, actualización con loader y notificaciones, menú compacto e iconos con colores. Evidencia: `QA-DASHBOARD.json`; capturas en `qa-dashboard/`.
- Dashboard probado a **320, 390, 768, 1024 y 1440 px** en claro y oscuro, sin overflow de página. La tabla conserva su desplazamiento horizontal dentro de la región. Los filtros funcionan con movimiento reducido.
- Auditoría estática: **12 HTML, 0 problemas** en las reglas comprobadas. Recursos actuales: **283 referencias locales correctas**. Contraste: **27/27 pares seleccionados**, incluyendo los seis tonos de iconos en ambos temas.
- Regeneración del generador original, compilación Tailwind y posprocesado idempotente sobre las 12 páginas verificados.

Estas comprobaciones no sustituyen las pruebas manuales pendientes con lectores de pantalla, zoom nativo, dispositivos físicos ni la evaluación WCAG integral indicadas arriba. Los datos de noviembre de 2026 del Dashboard son ficticios y no se consultan servicios.

## Actualización · Dashboard Centralizado según capturas · 12 de noviembre de 2026

Se sustituyó la composición del Dashboard por la vista Centralizado de las seis capturas: filtros Desde/Hasta, seis indicadores, seguimiento acumulativo, estado por recepción, sucursales, atrasos y formularios de SLA/UTM. Los reportes de `qa-dashboard/` corresponden al diseño anterior.

- **23 casos del modelo puro aprobados:** fechas válidas, fines de semana/feriados, vencimiento y atraso, integridad de impresión y ensobrado, relación física ajena/anulada, UTM faltante, tarifa cero, criterio de conversión, filtros por fechas, merma por declaración y stock independiente del rango. Evidencia: `QA-CENTRALIZADO-MODELO.json`.
- **38 casos DOM aprobados:** incluye inicialización de las 12 pantallas y los nuevos filtros, escenarios y guardado de configuración/UTM. Evidencia: `QA-CENTRALIZADO-DOM.json`.
- **19 grupos Chrome aprobados:** consistencia de indicadores y gráficos, rango inválido, filtro por sucursal, atrasos, búsqueda y paginación, detalle con teclado/Escape y retorno de foco, CSV real filtrado, conversión faltante, guardado y recuperación local, validación de feriados, escenario vacío, actualización y notificaciones. Evidencia: `QA-CENTRALIZADO.json`.
- **320/390/768/1024/1440 px en claro y oscuro:** sin overflow a nivel de página; gráfico diario y tablas con scroll interno. Se verificaron también menú compacto, paneles de configuración con teclado y movimiento reducido. Capturas actuales: `qa-centralizado/`.
- **Auditoría estática:** 12 HTML, 0 incidencias entre las reglas comprobadas. **Recursos:** 280 referencias locales, 0 errores. Se conserva la comprobación de los 27 pares seleccionados de contraste; no cubre todos los colores de los gráficos ni todos los estados.
- Regeneración de HTML, compilación Tailwind y posprocesado idempotente verificados.

La estimación usa reglas explícitas de demostración documentadas en `DASHBOARD.md`; no valida una política contractual ni consulta cotizaciones UTM. No se ejecutó una revisión con lectores de pantalla reales, zoom nativo, Safari/Firefox ni una auditoría WCAG integral.

## Merma de tarjetas · 12 de noviembre de 2026

Nueva página con datos de las capturas y los componentes de la biblioteca. Validación en Chrome real: filtros combinados y estado vacío, modal nativo y campos obligatorios, formato y duplicados de folios, borrado individual/múltiple, adjuntos y consulta de evidencias, creación de lotes, paginación y retorno del foco. Página y modal comprobados a 320, 390, 768, 1024 y 1440 px en claro y oscuro; sin desbordamiento de página ni errores JavaScript. Se comprobó el respeto a movimiento reducido y que recargar restablece los registros de demostración. Evidencia en `QA-MERMA.json` y `qa-merma/`.

Compilación: 13 páginas. Auditoría estática: 13 páginas sin incidencias en las reglas automatizadas. Recursos: 317 referencias locales, sin errores; 27/27 pares de contraste seleccionados aprobados. La inicialización DOM incluye la nueva página y su script. Esto no sustituye una auditoría completa de accesibilidad ni valida tarjetas reales.
