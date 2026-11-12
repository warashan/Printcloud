# Dashboard de prueba · Centralizado

Actualizado el 12 de noviembre de 2026 a partir de las seis capturas aportadas. Abrir `dashboard.html` o entrar por «Páginas de prueba → Dashboard». La portada sigue siendo la matriz de elementos.

## Composición

1. Filtros Desde/Hasta y sucursal, con Aplicar filtros, Mes actual y Últimos 90 días.
2. Seis indicadores: Solicitudes, Stock disponible, Impresas, Pendientes, Merma oficial y Multas estimadas.
3. Seguimiento global de tarjetas: Total, Impresas, Ensobradas y tabla por fecha de solicitud, con paginación y avance de impresión.
4. Estado por fecha de recepción: gráfico de impresas vigentes, pendientes actuales y merma oficial; tabla accesible con los mismos datos.
5. Solicitudes por sucursal: doce sucursales según las capturas, con barras para solicitudes y pendientes y una tabla alternativa.
6. Solicitudes pendientes con atraso: búsqueda, paginación, detalle, CSV y estado vacío.
7. Paneles desplegables de configuración de SLA/multas y valores UTM compartidos, usando formularios de la biblioteca.

Se mantienen iconos con colores, temas claro/oscuro/sistema, hovers de paneles, menú compacto, perfil y notificaciones. Los gráficos tienen colores vivos y alternativas tabulares; las tablas y el gráfico diario permiten desplazamiento dentro de su región en pantallas pequeñas.

## Recorrido sugerido

- Aplicar un rango y una sucursal; comprobar que los indicadores y los gráficos usan los mismos filtros.
- Seleccionar **Sin solicitudes** para ver los estados vacíos de las capturas. El stock actual permanece disponible.
- Volver a **Con datos de ejemplo** y usar **Últimos 90 días**: aparecen solicitudes atrasadas para explorar el detalle y la exportación CSV.
- Revisar el aviso de conversión pendiente. Completar un valor de ejemplo para noviembre de 2026 y comprobar el equivalente en CLP.
- Cambiar el plazo, tarifa o feriados y guardar. La estimación se recalcula; los parámetros persisten al recargar.
- Usar «Editar» en una UTM de referencia para cargar el mes y el valor en el formulario.
- Abrir y cerrar los paneles con teclado, cambiar el tema y contraer el menú.

## Datos y reglas explícitas del escenario

El corte está fijado al **12 de noviembre de 2026**. Las solicitudes ficticias cubren los sesenta días previos. Mes actual se refiere al mes de ese corte. El rango admite hasta 366 días y también puede consultarse un período sin registros.

- **Solicitudes/Impresas/Pendientes:** se filtran por fecha de recepción. Una relación física activa, con folio, identificador coincidente y fecha de asignación válida hasta el corte permite contar como impresa. Las demás solicitudes siguen pendientes.
- **Seguimiento:** se filtra por fecha de solicitud. Las etapas son acumulativas: ensobradas ≤ impresas ≤ total. Ensobrar requiere membresía normalizada, sobre coincidente y fecha válida. Por esta diferencia de fecha, los totales de seguimiento pueden diferir de los recibidos en el período; la interfaz lo indica.
- **Merma oficial:** usa su fecha de declaración. No se deriva de restar impresas al total. Una tarjeta anulada no cuenta como vigente.
- **Stock:** suma 664 en el escenario general y puede limitarse por sucursal, pero nunca por rango de fechas. No se descuenta al filtrar ni al guardar parámetros.
- **SLA de ejemplo:** por defecto, 20 días hábiles y 1 UTM por día hábil de atraso. Se excluye la fecha de recepción del conteo, se omiten sábados, domingos y las fechas configuradas como feriado. El mismo día del vencimiento no hay atraso. No se carga un calendario legal automáticamente.
- **Estimación:** se calcula solo sobre las solicitudes recibidas dentro del filtro que siguen pendientes al corte. La fecha original de recepción se mantiene después de una merma. Estas decisiones son reglas explícitas de demostración, no una definición de la política contractual real.
- **Conversión:** el mes se elige por aplicación, recepción o vencimiento. Si falta un valor UTM, el equivalente en CLP queda pendiente; no se calcula como cero. Cada importe CLP se redondea al peso y el total suma los importes por solicitud.

Los valores enero–octubre de 2026 provienen de las capturas y llevan la etiqueta «Referencia de captura · demo». Noviembre no se proporciona inicialmente. Los valores ingresados se identifican como «Ingresado en demo». No se presentan como valores oficiales vigentes ni existe una consulta al SII.

## Guardado local

`printcloud-centralizado-settings-v1` almacena el plazo, tarifa, feriados y criterio de conversión. `printcloud-centralizado-utm-v1` almacena las UTM editadas. La entrada se valida al guardar y al recuperar. Si el navegador bloquea el almacenamiento, el formulario informa que los cambios se aplicaron solo a la pestaña.

La exportación contiene los pendientes atrasados que coinciden con el rango, la sucursal y la búsqueda; no solo la página visible. Si falta conversión, el CSV lo indica expresamente.

## Mantenimiento y QA

- `components/dashboard-content.html`: marcado de la vista.
- `src/dashboard-model.js`: calendario, integridad de etapas, filtros y estimaciones puras del escenario.
- `src/dashboard.js`: interacción, validación, gráficos SVG/HTML, formularios y exportación.
- `scripts/generate.py` y `scripts/refine_pages.py`: regeneración e inclusión ordenada de los scripts.
- `src/refinements.css`: estilos del Dashboard y componentes compartidos.
- `scripts/qa-dashboard-model.mjs`: casos de borde del modelo.
- `scripts/qa-dom.mjs`: inicialización de toda la biblioteca y lógica DOM.
- `scripts/qa-dashboard.mjs`: prueba opcional de Chrome; usar las variables de Playwright/Chrome descritas en el README.

Reportes actuales: `QA-CENTRALIZADO.json`, `QA-CENTRALIZADO-DOM.json`, `QA-CENTRALIZADO-MODELO.json` y capturas en `qa-centralizado/`. Las evidencias de `qa-dashboard/` corresponden al diseño previo. Ver `QA.md` para límites de validación.
