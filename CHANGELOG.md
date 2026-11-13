# Historial de cambios · PrintCloud Centralizado

Este documento resume los cambios funcionales, visuales y de documentación del proyecto, desde los más recientes. Las fechas corresponden al historial de Git; los hashes permiten consultar cada entrega en GitLab o GitHub. Se agrupan por fecha porque estas entregas no tienen etiquetas de versión publicadas.

## Pendiente de publicar

Los próximos cambios se registran aquí y se trasladan a su fecha de entrega cuando se publiquen, indicando el commit correspondiente.

## 2026-11-13

### Corregido

- **Logotipo persistente en el menú lateral:** la marca de PrintCloud permanece visible mientras las opciones se desplazan en un contenedor independiente. El botón de cierre del menú móvil también permanece disponible. Se ajustaron los selectores del menú contraído y la regeneración de todas las páginas. Commit: `458e136`.

### Documentación

- Reemplazada la captura del README por la imagen actualizada de la matriz de elementos. La imagen se guarda en `docs/printcloud_actualizado.png` y se referencia con una ruta relativa compatible con ambos repositorios. Commit: `b125019`.
- Incorporado este changelog y su enlace en el README.

### Repositorios

- Integrado el historial inicial de GitLab con el historial del proyecto, conservando los archivos existentes y sin sobrescribir commits. GitLab quedó configurado como remoto de seguimiento de `main`; GitHub se mantiene como remoto adicional. Commit de integración: `27e3f32`.
- La carga inicial en GitLab incluyó `README.md` y `alertas.html`; se conservan los commits `4d50449`, `24d920f` y `82a89c1` como parte de ese historial.
- Sincronizada la rama `main` de GitLab y GitHub hasta el fix del menú lateral, incluyendo la actualización del README.

## 2026-11-12

Entrega: `9cbb3ed` — **Feat: Actualización de dashboard y nueva página de merma de tarjetas**.

### Agregado

- Página **Merma de tarjetas**, accesible desde el menú lateral y la matriz de elementos, reutilizando los componentes y los temas de la biblioteca.
- Filtros por oficina, fecha de registro y operador; tabla de lotes con los datos de referencia, paginación y estado vacío.
- Modal **Nueva declaración de merma**, con oficina, estado, motivo, documentos/fotografías, confirmación de cobertura y selección de folios.
- Validación de campos obligatorios, formato de folios, duplicados y folios ya declarados en la demostración; acciones para agregar y borrar folios seleccionados o todos.
- Selección y eliminación de adjuntos, miniaturas de imágenes y consulta/descarga de evidencias del lote. La fotografía original no incluida en las capturas se representa mediante una ilustración identificada como demostración.
- Creación de lotes y notificaciones dentro de la pestaña. Los registros nuevos y los archivos se restablecen al recargar y no se envían a un servidor.
- Modelo de datos del dashboard separado de la interfaz y pruebas de sus reglas de cálculo.
- Documentación y evidencias de QA del [dashboard](docs/DASHBOARD.md) y de [merma de tarjetas](docs/MERMA-TARJETAS.md).

### Modificado

- Dashboard adaptado a las seis capturas de referencia de Centralizado, conservando los componentes y el estilo gráfico de la propuesta.
- Filtros de fechas y sucursal; seis indicadores: solicitudes, stock disponible, impresas, pendientes, merma oficial y multas estimadas.
- Seguimiento global de tarjetas, con etapas acumulativas, tabla por fecha de solicitud y avance de impresión.
- Gráficos por fecha de recepción y por sucursal, con alternativas tabulares.
- Consulta de solicitudes pendientes con atraso, búsqueda, detalle, paginación y exportación CSV.
- Paneles desplegables de configuración de SLA/multas y valores UTM de demostración, con guardado local y validación. Cuando falta un valor UTM, la conversión se muestra pendiente.
- Matriz de elementos actualizada a trece vistas de referencia.

## 2026-11-10

Entrega: `f991cba` — **Feat: Mejoras visuales en hover de cards e implementación de dashboard**.

### Agregado

- Primera página de prueba **Dashboard**, con indicadores, gráficos y solicitudes de ejemplo, accesible desde la navegación y la matriz.
- Colores diferenciados en los iconos de las tarjetas, con variantes para los temas claro y oscuro.
- Efectos hover en tarjetas y superficies informativas: elevación, sombra y transición del borde, respetando la preferencia de movimiento reducido.
- Documentación, comprobaciones y capturas del dashboard inicial; estas evidencias se conservan como referencia del diseño anterior.

### Modificado

- Colores más vivos para los estados del gráfico de distribución del dashboard.

### Corregido

- Eliminado el borde celeste izquierdo de las opciones seleccionadas del menú lateral.

## 2026-11-09

Entrega: `a6b6dc3` — **Update README with opening instructions and font details**.

### Documentación

- Actualizadas las instrucciones para abrir el proyecto y la información sobre la carga opcional de Fira Sans y la fuente alternativa sin conexión.

## 2026-11-04

Entrega: `7af2bc5` — **Feat: Refinamientos de interfaz y login responsive**.

### Agregado

- Slider informativo del login con tres diapositivas, controles manuales, indicadores y anuncios accesibles, sin rotación automática.
- Menú del avatar con **Configuración** y **Cerrar sesión**; esta última opción conduce al login de demostración.
- Herramientas de QA de lógica DOM, navegador, recursos locales, contraste seleccionado y regeneración idempotente.
- Documentación de la revisión y conservación de las evidencias anteriores como históricos.

### Modificado

- Login responsive: solo formulario bajo 1024 px; slider y formulario en dos columnas desde ese ancho.
- Mejoras de legibilidad, contraste, foco, formularios y estados de validación.
- Tabla de demostración con selección entre páginas, detalle, filtros, CSV y limpieza de selección.
- Buscadores con búsqueda sin tildes, filtros y chips removibles; búsqueda en el inventario documental del menú.
- Preferencias de tema claro, oscuro y sistema, con persistencia y seguimiento de los cambios del sistema operativo.
- Menú móvil con fondo inerte, contención del foco y cierre del panel de notificaciones al abrirlo.

### Corregido

- Espaciado vertical de los badges en la página de buscadores.

## 2026-10-29

### Agregado

- Base del proyecto y biblioteca HTML de componentes: matriz de elementos, tipografía, iconografía, formularios, steppers, modales, tablas, buscadores, alertas y login. Commits iniciales: `ecee0cc` y `779a92a`.
- Menú lateral contraíble en escritorio, con preferencia persistente.
- Animaciones de expansión/contracción y transiciones de interacción.
- Página de **Loaders y spinners**, con catálogo de indicadores de carga y estados de espera.
- Botón de notificaciones en el topbar, con historial local para volver a consultarlas.
- Estas mejoras de interacción y loaders se agruparon en `ef77962` — **Feat: Animaciones y loaders**.

### Corregido

- Formato del HTML y correcciones de escritura/código de la plantilla. Commit: `b2a0f12` — **Fix: Formateo y correccion de codigo**.
- Eliminado el logotipo duplicado del topbar y el badge «Propuesta UI».
- Retirada la opción de tema del sistema en la entrega de animaciones; la revisión del 4 de noviembre volvió a incorporarla.

## Alcance y mantenimiento

La interfaz es un prototipo con datos de demostración. No incorpora autenticación real, backend, validación de inventario, cámara ni impresión. El guardado local del dashboard y el historial de notificaciones son independientes de los registros de merma, que permanecen solo en memoria durante la sesión de la pestaña.

Para cada entrega, documentar los cambios visibles en **Agregado**, **Modificado**, **Corregido**, **Documentación** o **Repositorios**, según corresponda, e incluir la fecha y el commit. No asignar nuevas versiones hasta que exista una decisión de versionado del proyecto.

El alcance y los límites de las comprobaciones automatizadas se consultan en [QA](docs/QA.md); las entradas de este historial no constituyen una certificación de accesibilidad.
