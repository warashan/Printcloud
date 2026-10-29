# PrintCloud / TNE Centralizado — Design System v2.0

Propuesta de **interfaz nueva** creada para migrar de php a nuevas tecnologías.

## Abrir prototipo

1. Descomprimir el ZIP respetando las carpetas.
2. Abrir `index.html` en el navegador. Desde allí se accede a las **10 páginas**.
3. Cambiar apariencia en la barra superior: **Claro / Oscuro / Sistema**. Se guarda en `localStorage` de ese navegador.
4. El prototipo contiene datos ficticios; no incluye autenticación, integraciones, acceso a cámara ni envío a impresión.

Las hojas CSS compiladas, los SVG y la lógica de los ejemplos están incluidos y **no requieren CDN**. La tipografía **Fira Sans** se carga opcionalmente desde Google Fonts; si no hay conexión, se utiliza la fuente alternativa del sistema. En una intranet productiva conviene empaquetar Fira Sans de una fuente licenciada junto al proyecto, conforme a la política de la organización.

## Vistas

| Archivo | Página | Contenido |
|---|---|---|
| `index.html` | Matriz de elementos | Resumen, tokens, botones, controles y vínculos a matrices |
| `login.html` | Login | Composición institucional, visibilidad de contraseña, validación **solo de demostración** |
| `tipografia.html` | Matriz tipográfica | Fira Sans, 400–700, jerarquía, tamaños, identificadores TNE |
| `iconos.html` | Matriz de iconos | Catálogo de SVG estilo Lucide, filtrado y copia de nombre |
| `formularios.html` | Formularios | Inputs, selects, date, textarea, checkbox, radio, switch, archivo y validación |
| `steppers.html` | Steppers | Proceso interactivo de 5 pasos y patrón vertical |
| `modales.html` | Modales | Detalle, confirmación y advertencia mediante `<dialog>` |
| `tablas.html` | Tablas | Filtro, orden local, selección, paginación, acciones y estados |
| `buscadores.html` | Buscadores | Búsqueda inmediata, filtros combinados, chips y estado vacío |
| `alertas.html` | Alertas | Éxito, info, advertencia, error, toasts y mensajes vacíos |

## Arquitectura

```
printcloud-design-system/
├── index.html           Matriz y portada de la biblioteca
├── login.html           Acceso visual
├── tipografia.html      Escala tipográfica
├── iconos.html          Catálogo iconográfico
├── formularios.html     Formularios
├── steppers.html        Flujos progresivos
├── modales.html         Diálogos
├── tablas.html          Tablas y paginación
├── buscadores.html      Búsqueda y filtros
├── alertas.html         Feedback y alertas
├── src/
│   ├── styles.css       Tailwind v4 + tokens + componentes semánticos
│   ├── app.js           Interacciones solo de demostración
│   ├── theme-init.js    Detección de tema antes del CSS
│   └── legacy-menu.json Mapa recuperado del HTML existente (25 grupos, 107 opciones)
├── dist/styles.css      CSS compilado de Tailwind (incluido)
├── scripts/
│   ├── build.mjs        Compilación sin CDN usando el paquete tailwindcss v4
│   └── generate.py      Generador de HTML de esta entrega
├── docs/
│   ├── DESIGN-SYSTEM.md
│   ├── QA.md
│   ├── PROMPT-CODEX.md
│   └── vista-*.png       Capturas de referencia
└── package.json
```

### Para desarrollar

```bash
npm install
npm run build
python3 -m http.server 8080
```

Abrir `http://localhost:8080`. Se utiliza **Tailwind CSS 4.1.10**, fijado en `package.json`, con una compilación local reproducible. `scripts/build.mjs` usa la API del paquete Tailwind y detecta las clases existentes en las páginas HTML. `dist/styles.css` ya viene generado para visualizar la entrega sin instalar dependencias.

**Importante:** `scripts/generate.py` es el generador de esta entrega y mantiene el contenido de las páginas. Si se desarrolla de forma independiente en HTML, editar esos archivos directamente; reconstruirlos con ese script sobrescribe cambios manuales. Para evoluciones productivas, separar componentes repetidos en plantillas o componentes reales según el stack de aplicación elegido.

## Identidad

- Fira Sans: 400 / 500 / 600 / 700.
- Azul institucional `#283A55`; azul acción `#3C759F`.
- Componentes con tokens semánticos `--ds-*`; el dark theme no invierte fotos, QR ni vistas físicas de tarjetas.
- Iconografía inline basada en el estilo de trazos de Lucide (2 px). Para producción usar la biblioteca [Lucide](https://lucide.dev) versionada, con un registro controlado de nombres.
- Estados de interacción y mensajes con etiquetas textuales.
- Controles de 42 px de alto como base; compactos de 34 px cuando el contexto lo permite.

## Menús del sistema original

Se preservaron como **mapa documental** las 25 agrupaciones y 107 opciones legibles del HTML facilitado. Los textos aparecen bajo «Mapa de menús existentes». Se trata de un inventario; **no se replicaron URLs ni se activaron módulos originales**. Las páginas nuevas de la biblioteca están en «Sistema de diseño».

## Alcance y pendientes

- Esta entrega es un prototipo navegable y una base de diseño técnico, **no el sistema productivo**.
- El logo es una marca tipográfica/ícono de referencia: sustituir por los archivos corporativos definitivos antes de implementar.
- Integrar autenticación, APIs, QR, edición de imagen, captura, impresión y validaciones reales solo después de definir contratos de backend.
- Revisar WCAG 2.2 AA, contrastes en todos los estados, contraste de gráficos, 200% zoom y teclado con datos reales.
- Comprobar criterios de impresión *fuera del tema visual*, sin modificar credenciales físicas.


## V2.0 · Branding y accesibilidad

- Logotipos **originales** PrintCloud by Concordia integrados en `assets/brand`, barra lateral, superior, login y favicon.
- CSS de **base móvil** desde 320px; reglas progresivas `min-width` a 480/841/1024/1200px.
- Contraste, botón de salto, iconos decorativos, labels, ARIA y foco mejorados.
- Menú responsive con apertura y cierre por teclado, Escape, foco retenido y devuelto.
- Componentes semánticos en `components/`; generador común en `scripts/generate.py` más transformador en `scripts/enhance_pages.py`.
- Auditoría estática disponible: `python scripts/audit_static.py` (necesita `pip install -r requirements-build.txt`).
- Consulta `docs/AUDITORIA-WCAG-2.2.md`: el objetivo es **WCAG 2.2 AA**, pero los criterios todavía requieren auditoría manual y tecnologías de asistencia antes de declarar conformidad.

## Edición y compilación

```bash
python -m pip install -r requirements-build.txt
python scripts/generate.py
npm install
npm run build
```

El ZIP ya incorpora `dist/styles.css`; si solo deseas visualizar las páginas no necesitas estas herramientas. No publicar contenidos de ejemplo como datos reales.
