# QA de la entrega v2.1

Fecha: 4 de noviembre de 2026. Artefacto: copia mejorada de Printcloud(1).zip. Entorno: Node 24, jsdom 26.1, Python con BeautifulSoup. Estas pruebas no equivalen a auditoría de conformidad WCAG.

| ID | Prueba / pasos | Esperado | Observado | Estado | Evidencia |
|---|---|---|---|---|---|
| Q01 | `node --check src/app.js` y `src/theme-init.js` | Sintaxis válida | Ambos sin errores | Aprobado | Ejecución Node |
| Q02 | `python3 scripts/audit_static.py` | Semántica cubierta por las reglas sin errores | 11 HTML, 0 problemas | Aprobado | `QA-ESTATICA.txt` |
| Q03 | Resolver href/src y fragmentos locales de todos los HTML | Recursos existentes | 233 referencias, 0 problemas | Aprobado | `QA-RECURSOS.json` |
| Q04 | `npm run build` | Compilar CSS local | 202 clases candidatas; 11 páginas | Aprobado | `QA-BUILD.txt` |
| Q05 | `npm run qa:dom` | Inicializar 11 páginas y comprobar flujos | 27 casos aprobados | Aprobado | `QA-DOM.json`; script reproducible |
| Q06 | Calcular luminancia relativa de 10 pares seleccionados | Umbrales 4.5 texto / 3 componentes en esos pares | Todos superan el umbral correspondiente | Aprobado | `QA-CONTRASTE.json` |
| Q07 | Regenerar HTML y repetir posprocesado | Mejoras presentes; segunda pasada idéntica | Auditoría y pruebas DOM aprobadas; hashes HTML sin cambios en segunda pasada | Aprobado | Generador + comparación SHA-256 |
| Q08 | Abrir servidor local desde navegador remoto | Página accesible | Navegador devolvió ERR_HTTP_RESPONSE_CODE_FAILURE para localhost:8080 | Bloqueado | Intento real de navegación del navegador disponible |
| Q09 | Revisar 360/768/1024/1440px, claro/oscuro | Sin recortes o desbordamiento de página | Sin evidencia de renderizado para esta entrega | No ejecutado | Requiere navegador con acceso al proyecto |
| Q10 | Teclado, Escape, foco del menú/diálogos, descarga real | Flujos nativos correctos | Solo lógica DOM probada, sin motor de layout ni comportamiento nativo de dialog | No ejecutado | Revisión manual pendiente |
| Q11 | NVDA/VoiceOver, zoom 200/400%, contraste de todos los estados | Criterios WCAG relevantes satisfechos | No evaluado | No ejecutado | Requiere tecnologías de asistencia y navegador |

Los tests jsdom simulan `matchMedia`, `dialog`, Blob y URL para comprobar decisiones y contenido. No validan las animaciones, la geometría, la descarga a disco, el foco nativo ni la apariencia. La verificación de submit usa el evento, no una pulsación física de Enter. Tampoco se ejecutaron Lighthouse o axe.

## Cómo revisar

Abrir index.html, recorrer las once páginas y probar temas. En tablas: seleccionar filas, cambiar de página, filtrar «Vina», exportar, abrir detalle y limpiar filtros. En formularios: enviar vacío con Enter y corregir. En móvil: abrir menú, recorrer con Tab/Shift+Tab y cerrar con Escape. Confirmar retorno de foco y ausencia de acceso al fondo. Revisar detalle y descarga CSV en el navegador objetivo.

## Criterio de cierre

Entrega local lista para revisión con lógica y estructura verificadas. La aceptación visual, las pruebas de teclado nativo y la conformidad integral WCAG 2.2 AA siguen pendientes. Los informes históricos de v2 no se presentan como resultados actuales.
