# PrintCloud · Proyecto original mejorado v2.2

Actualización sobre `Printcloud-Original-Mejorado-v2.1.zip`, siguiendo la revisión del 4 de noviembre de 2026. Conserva las pantallas de la biblioteca, los logotipos originales, el sistema de diseño azul, los loaders, las animaciones y el historial de notificaciones. `index.html` sigue siendo la matriz de elementos.
<img width="1786" height="895" alt="image" src="https://github.com/user-attachments/assets/553502c5-953f-4b56-a4f1-9789f7e799f1" />


## Abrir

Descomprimir y abrir **index.html**. El CSS compilado y los recursos locales están incluidos; no se necesita instalación. Fira Sans se solicita opcionalmente a Google Fonts; sin conexión se usa la fuente alternativa del sistema.

## Novedad: slider del login

Tres características de PrintCloud, una por diapositiva: gestión centralizada de solicitudes, captura y revisión de información, y seguimiento del proceso de impresión. Navegación manual mediante Anterior, Siguiente e indicadores; contador, estado accesible y anuncio breve de los cambios. No hay rotación automática.

Desde 1024 px, el slider ocupa el panel izquierdo y el formulario queda a la derecha. Bajo ese ancho, se muestra únicamente el formulario de acceso y se oculta el slider. El panel conserva la altura al cambiar de diapositiva y respeta movimiento reducido. Las ilustraciones utilizan HTML y SVG locales.

## Mejoras de v2.1 conservadas

- Legibilidad, contraste de campos y foco, colores forzados y refinamientos responsive.
- Tabla con diálogo de detalle, CSV local, selección entre páginas y filtros, selección parcial, contador y limpieza.
- Se exportan las filas seleccionadas que coinciden con el filtro; si no hay seleccionadas dentro de los resultados, se exportan todos los resultados filtrados.
- Búsqueda sin tildes, chips removibles e inventario documental de 25 grupos y 108 opciones con búsqueda.
- Submit unificado, corrección de errores al escribir y foco en el primer campo inválido.
- Temas Claro, Oscuro y Sistema; Sistema conserva la preferencia y sigue al sistema operativo.
- Fondo inerte en el menú móvil, foco contenido y cierre de notificaciones al abrirlo.

La biblioteca usa datos ficticios. No incluye autenticación, validación real del RUT, backend, cámara ni impresión real. Los módulos del menú heredado son un inventario documental.

## Páginas

`index.html`, `dashboard.html`, `merma-tarjetas.html`, `login.html`, `tipografia.html`, `iconos.html`, `loaders.html`, `formularios.html`, `steppers.html`, `modales.html`, `tablas.html`, `buscadores.html` y `alertas.html`.

## Desarrollo y regeneración

```bash
npm ci
python3 -m pip install -r requirements-build.txt
python3 scripts/generate.py
npm run build
```

El generador original requiere **Python 3.12 o posterior**, por su sintaxis de f-strings. `scripts/enhance_pages.py` integra `scripts/refine_pages.py`, que aplica las mejoras y el slider. El marcado del panel se mantiene en `components/login-slider.html`; sus estilos están encapsulados en `src/refinements.css`, cargado después de `dist/styles.css`. Edita estas fuentes para conservar los cambios al regenerar.

Para visualizar desde HTTP, ejecutar `python3 -m http.server 8080` y abrir `http://localhost:8080`.

## Pruebas

```bash
npm run qa:dom
python3 scripts/audit_static.py
python3 scripts/qa-resources.py
npm run build
```

Las pruebas opcionales `npm run qa:browser` usan Playwright y Chrome/Chromium. Configurar `PRINTCLOUD_PLAYWRIGHT_PATH` con la ruta al módulo instalado si no está disponible por nombre, y opcionalmente `PRINTCLOUD_CHROME_PATH` con el ejecutable de Chrome. Estas herramientas son exclusivas de QA y no se requieren para abrir la plantilla.

- [QA actual y pendientes](docs/QA.md).
- [Resumen de cambios](docs/RESUMEN-v2.2.md).
- Evidencia actual: `docs/QA-*.json`, `QA-ESTATICA.txt`, `QA-BUILD.txt` y capturas en `docs/qa-v2.2/`.
- Informes de la versión base: `docs/historico-v2.1/`. Informes anteriores: `docs/historico-v2/`.

Las comprobaciones parciales no constituyen una declaración de conformidad integral WCAG 2.2 AA.

## Dashboard Centralizado · 12 de noviembre de 2026

Abrir `dashboard.html`, disponible en **Páginas de prueba → Dashboard**. Se reorganizó de acuerdo con las capturas recibidas, conservando los componentes, colores, temas y efectos hover.

- Filtros Desde/Hasta, sucursal, Mes actual y Últimos 90 días.
- Seis indicadores: solicitudes, stock disponible, impresas, pendientes, merma oficial y multas estimadas.
- Seguimiento acumulativo por fecha de solicitud, estado diario por recepción y gráfico por sucursal, con tablas alternativas.
- Atrasos con búsqueda, paginación, detalle y exportación CSV.
- Configuración local de plazo hábil, tarifa UTM, feriados y criterio de conversión; valores UTM mensuales editables.
- Selector de escenario con datos o sin solicitudes para comprobar estados vacíos.

El corte del escenario es **12 de noviembre de 2026**, no la fecha actual. El stock de 664 tarjetas es una fotografía de ejemplo y no cambia con el rango de fechas. Los valores UTM de enero a octubre reproducen referencias de las capturas; no hay consulta al SII. Noviembre debe completarse como valor de ejemplo si se requiere una conversión. Una UTM faltante se muestra como «Conversión pendiente», sin asumir cero.

Fuentes: `components/dashboard-content.html`, `src/dashboard-model.js`, `src/dashboard.js` y los estilos encapsulados en `src/refinements.css`. El generador conserva la vista y sus scripts. Ver [guía y alcance](docs/DASHBOARD.md).

```bash
npm run qa:dashboard-model
npm run qa:dom
# Opcional, con Playwright/Chrome configurado:
npm run qa:dashboard
```

## Merma de tarjetas

Nueva página `merma-tarjetas.html`, accesible desde el menú de páginas de prueba y la matriz. Incluye filtros, tabla paginada, consulta de adjuntos y un modal para declarar merma con motivo, fotografías/documentos y selección de folios. Los registros y archivos duran hasta recargar la pestaña; no hay conexión a inventario ni backend. Detalle en [docs/MERMA-TARJETAS.md](docs/MERMA-TARJETAS.md). Verificación: `npm run qa:merma`.
