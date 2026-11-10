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

`index.html`, `dashboard.html`, `login.html`, `tipografia.html`, `iconos.html`, `loaders.html`, `formularios.html`, `steppers.html`, `modales.html`, `tablas.html`, `buscadores.html` y `alertas.html`.

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

## Dashboard de prueba · 10 de noviembre de 2026

Abrir `dashboard.html`, disponible en **Páginas de prueba → Dashboard** y desde una tarjeta de la portada. Es una pantalla operativa de demostración con indicadores, gráficos, tabla, detalle de solicitud y accesos a los ejemplos del formulario, buscadores y stepper.

- Oficina y período actualizan indicadores, gráficos y tabla de manera coherente.
- La búsqueda, los estados y la paginación se aplican a la tabla.
- «Requieren atención» filtra las observaciones; «Actualizar resumen» muestra el loader y genera una notificación de demostración.
- Las fechas corresponden a un escenario fijo de noviembre de 2026; no se consultan servicios ni se modifican registros reales.

La biblioteca incorpora seis tonos de iconos con variantes para claro y oscuro, definidos en `src/refinements.css`. La selección del menú conserva su fondo, sin franja lateral celeste.

Fuentes del Dashboard: `components/dashboard-content.html` y `src/dashboard.js`. El generador conserva la página y sus enlaces. Ver [guía y QA del Dashboard](docs/DASHBOARD.md).
