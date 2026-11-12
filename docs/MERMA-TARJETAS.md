# Merma de tarjetas

Abrir `merma-tarjetas.html` o seleccionar **Merma de tarjetas** en «Páginas de prueba». Reutiliza el shell, los tokens, campos, botones, badges, superficies, tabla, diálogos nativos, notificaciones y efectos hover existentes. Compatible con temas claro/oscuro y movimiento reducido.

El contenido inicial reproduce los seis lotes de las capturas: 28, 27, 24, 17, 14 y 7. Los folios y archivos no informados se identifican como tales. La captura no incluye la fotografía del lote 28; su consulta muestra una ilustración SVG señalada explícitamente como demostración.

- Buscar combina oficina, fecha exacta de registro y operador; Limpiar muestra todos los lotes. Hay paginación de seis filas y estado vacío.
- Nuevo abre «Nueva declaración de merma». Se añadió la selección de oficina para asignar correctamente cada nuevo lote, dado que no hay sesión ni inventario real del cual derivarla.
- Son obligatorios oficina, motivo, adjuntos, confirmación de cobertura y al menos un folio. Estado: Mermada.
- Adjuntos: hasta cinco archivos JPEG, PNG, WebP o PDF, no vacíos y de hasta 5 MB cada uno. Se comprueban tipo declarado y extensión, se pueden quitar y consultar después de declarar. Las imágenes tienen miniatura; los PDF se pueden descargar.
- Folios: de seis a doce dígitos, sin duplicados ni folios previamente declarados en la pestaña. Se puede agregar con Enter o botón, borrar los seleccionados o todos. La comprobación es exclusivamente de formato y duplicados de la demo.
- Declarar crea una fila al inicio y una notificación, y limpia los filtros para mostrar el lote. La fecha se presenta en zona America/Santiago. Cancelar, Escape o cerrar descartan el borrador y restauran el foco a Nuevo.

Los registros nuevos y adjuntos viven solo en memoria hasta recargar o cerrar la pestaña; no se transmiten ni se guardan en un servidor y no alteran stock ni el escenario del dashboard. Los object URLs de borradores descartados o adjuntos quitados se liberan; los de registros creados se conservan mientras vive la página.

Fuentes: `components/merma-content.html`, `src/merma.js`, sección «Merma» de `src/refinements.css`, `scripts/generate.py` y `scripts/refine_pages.py`. Regenerar HTML antes de compilar CSS.

QA en Chrome: `npm run qa:merma`, con las variables opcionales `PRINTCLOUD_PLAYWRIGHT_PATH` y `PRINTCLOUD_CHROME_PATH` descritas en README. Evidencia: `QA-MERMA.json` y `qa-merma/`.
