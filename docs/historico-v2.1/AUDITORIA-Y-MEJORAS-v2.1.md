# PrintCloud · Auditoría y mejoras del proyecto original v2.1

Fecha: 4 de noviembre de 2026. Modalidad: HTML + CSS + JavaScript, Tailwind ya existente. Entrada: `Printcloud(1).zip`. Alcance autorizado: auditar, corregir y devolver una copia mejorada. Usuarios previstos: diseño y desarrollo de la plataforma de administración de tarjetas estudiantiles. Entorno local, sin publicación.

## Resultado

Se conservan las 11 pantallas, el mapa de 25 grupos/108 opciones, los logos, la paleta azul, los modos claro/oscuro y la arquitectura del sistema de diseño. Se mejora la propuesta existente; no se sustituye por otro dashboard. La biblioteca sigue siendo una demostración con datos ficticios. El mapa heredado es inventario documental, no acceso a módulos productivos.

## Hallazgos y resolución

Todos los hallazgos siguientes fueron observados en los archivos del ZIP, mediante lectura de código. Las pruebas de lógica usan jsdom y no implican renderizado visual.

| ID | Componente y evidencia original | Hallazgo e impacto | Prioridad / esfuerzo | Mejora implementada | Verificación |
|---|---|---|---|---|---|
| A01 | `src/app.js`, listener `#exportTable` | Exportar solo emitía un aviso: la acción no entregaba archivo | Alta / medio | CSV de resultados filtrados o selección dentro de esos resultados; botón indica alcance y cantidad | Lógica y contenido CSV en DOM simulado |
| A02 | `src/app.js`, `.table-detail` | Ver detalle solo mostraba un toast con el código | Media / medio | Diálogo con código, tipo, oficina, estado y fecha de la fila | Datos y solicitud de apertura/cierre en DOM simulado; comportamiento nativo pendiente |
| A03 | `src/app.js`, `refresh()` y `#selectAll` | Se reiniciaba el checkbox global sin reflejar las filas marcadas; sin resumen de selección | Alta / medio | Estado parcial, contador, filas resaltadas, selección entre páginas y acción para quitarla | Casos DOM aprobados |
| A04 | `formularios.html`, `#formSubmit[type=button]`; `src/app.js`, submit | Enter no ejecutaba la validación asociada al clic | Alta / bajo | Botón submit y un único manejador; error se limpia al corregir el campo | Evento submit probado; tecla física pendiente |
| A05 | `src/app.js`, búsqueda por `toLowerCase()`; chips como span | «Vina» no coincidía con «Viña» y los filtros no podían retirarse individualmente | Media / bajo | Normalización de tildes, chips con botón y nombre accesible, limpiar filtros de tabla | Casos DOM aprobados |
| A06 | `src/styles.css`, `--ds-focus:#7eb4dd` y borde claro `#adbdcc` | Contraste débil sobre blanco en foco y delimitación de campos | Alta / bajo | Foco claro `#286184` y borde `#7d8fa1`, foco propio sobre sidebar | Cálculo de pares; inspección de todos los estados pendiente |
| A07 | `src/styles.css`, campos 14px, títulos de tarjeta 14px y descripciones 12px | Jerarquía y lectura pueden resultar pequeñas en uso prolongado; es una evaluación contextual, no un incumplimiento por tamaño | Media / bajo | Campos 16px, títulos de tarjeta 16px, descripciones 14px, líneas más cómodas | Revisión CSS; validación visual pendiente |
| A08 | Menú móvil en `src/app.js` | Se aplicaba aria-modal sin volver inerte el contenido principal; el listado de foco no filtraba todos los elementos ocultos | Alta / medio | Fondo inerte durante apertura y recorrido limitado a elementos con geometría visible | Código corregido; prueba de teclado real pendiente |
| A09 | `src/theme-init.js`, preferencia `system` | Se convertía y guardaba como claro/oscuro; no seguía cambios del sistema | Media / bajo | Tercera opción Sistema, preferencia conservada y listener del SO | Persistencia y cambio de SO simulados |
| A10 | Sidebar, login y `.toast-zone` | Inventario largo sin búsqueda; Recordar usuario sin efecto; toasts acumulables sin límite visual | Media / medio | Búsqueda del mapa; retirada del control sin implementación; región de avisos con scroll sin borrado automático | Inventario DOM y revisión de código; layout pendiente |

## Especificación aplicada

- Identidad y estructura original conservadas. La portada permanece como matriz de elementos.
- Cambios visuales centralizados en `src/refinements.css`, cargado después de `dist/styles.css`: jerarquía tipográfica, separación de herramientas, campos, estados seleccionados y contraste.
- Reglas de base móvil con ajustes a 480/841px, compatibles con los breakpoints originales. Deben verificarse en 360, 768, 1024 y 1440px en un navegador.
- En tabla: seleccionar todas afecta solo las filas visibles; la selección persiste al paginar o filtrar. CSV usa seleccionadas que coinciden con los filtros, o todos los resultados filtrados si no hay seleccionadas en ellos. La interfaz explica esta regla.
- Detalle: diálogo nativo con título y descripción; Escape y retención de foco dependen del navegador y requieren prueba manual.
- Filtros removibles por teclado mediante botones nativos. Resultados y cambios de paso con mensajes de estado.
- No se implementan autenticación, validación real del RUT, captura fotográfica, servicios de backend ni impresión física.

## Mantenimiento

Las mejoras HTML se aplican desde `scripts/refine_pages.py`, invocado al final del generador original mediante `enhance_pages.py`. El posprocesado es idempotente y se verificó que ejecutar el generador mantiene las mejoras. La compilación Tailwind se ejecutó correctamente. Los fragmentos de `components/` mantienen su papel documental; aún no son componentes de una aplicación productiva.

Los informes y capturas previos están en `docs/historico-v2/` y representan la versión de entrada. No deben interpretarse como evidencia de esta entrega. Consultar `QA.md` para los resultados actuales y sus limitaciones.
