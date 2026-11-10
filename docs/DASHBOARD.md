# Dashboard de prueba

Página: `dashboard.html`. Disponible en «Páginas de prueba → Dashboard» y en la matriz de elementos. Permite revisar los componentes de PrintCloud dentro de una composición operativa, con datos ficticios.

## Recorrido sugerido para Francisco

1. Cambiar oficina y período: los cuatro indicadores, el gráfico diario, la distribución por estado y las solicitudes cambian juntos.
2. Abrir «Ver datos del gráfico» para consultar los mismos valores en una tabla accesible.
3. Buscar una solicitud, oficina o tipo; «vina» encuentra «Viña». Probar un término inexistente y usar «Restablecer filtros».
4. Elegir un estado y recorrer la tabla con Anterior/Siguiente. «Ver solicitudes» en «Requieren atención» selecciona las observaciones.
5. Abrir «Ver detalle»: se presenta un diálogo con los datos y las etapas del proceso. Escape cierra y devuelve el foco a la solicitud.
6. Pulsar «Actualizar resumen»: se muestra un loader breve y una notificación que también queda en el historial. Los valores siguen siendo los del escenario de ejemplo.
7. Contraer el menú, cambiar de tema y reducir el ancho para comparar el comportamiento responsive.
8. Usar los accesos al formulario, los buscadores y el stepper de la biblioteca.

## Alcance y datos

Los datos se generan de forma determinista en `src/dashboard.js`, con oficinas Santiago, Valparaíso, Viña del Mar y Quilpué. El escenario termina el 10 de noviembre de 2026 y ofrece períodos de 7 o 14 días; no representa el día actual ni una operación real.

Oficina y período afectan todo el resumen. El texto de búsqueda y los botones de estado filtran únicamente la tabla. No se guardan cambios en solicitudes, no se consulta un backend ni se envían trabajos a impresoras.

## Fuentes

- `components/dashboard-content.html`: composición del Dashboard, incluida por `scripts/generate.py`.
- `src/dashboard.js`: datos y comportamiento de esta página, cargado solo en el Dashboard.
- `src/refinements.css`: estilos responsive del Dashboard y seis tonos de iconos, con variantes claro/oscuro.
- `scripts/refine_pages.py`: navegación a páginas de prueba, tonos estables de iconos y conservación del script específico al regenerar.

Los enlaces del menú y el marcado se conservan al ejecutar el generador. La matriz de elementos sigue siendo la portada del proyecto.

## Validación

38 casos de la suite DOM ampliada, 13 grupos de comprobaciones del Dashboard en Chrome y auditoría estática de las 12 páginas aprobados. Capturas y reportes se encuentran en `qa-dashboard/`, `QA-DASHBOARD.json` y `QA-DASHBOARD-DOM.json`.

La prueba de navegador es reproducible con `scripts/qa-dashboard.mjs`, usando las mismas variables de Playwright/Chrome descritas en el README. La plantilla no requiere esas dependencias para visualizarse.
