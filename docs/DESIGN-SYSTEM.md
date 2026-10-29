# PrintCloud by Concordia — Design System 2.0

## Objetivo

Biblioteca HTML de **10 pantallas independientes**, fuente compartida en `scripts/generate.py`, Tailwind CSS v4 compilado y JavaScript local de demostración. Es una propuesta nueva de UI, **no** una adaptación de Bootstrap/Minton.

## Branding oficial aplicado

| Recurso | Uso |
|---|---|
| `assets/brand/printcloud_blanco.png` | sidebar y panel oscuro del login; topbar en tema oscuro |
| `assets/brand/printcloud_color.png` | topbar claro y login móvil claro |
| `assets/brand/favicon.png` | favicon, navegación compacta y pie de menú |
| `assets/brand/printcloud_monotono.png` | alternativa de marca entregada, no aplicada en esta iteración |
| `assets/brand/printcloud_negro.png` | alternativa de marca entregada, no aplicada en esta iteración |

No recrear logos con tipografías ni SVG aproximados. Respetar proporciones, clear-space y contraste del fondo.

## Fundamentos

- Fira Sans (400, 500, 600 y 700). Se solicita a Google Fonts al abrir el HTML; en producción evaluar alojamiento propio, con el permiso/licencia pertinente.
- Azul institucional `#283A55`; acción `#3C759F` (contraste 4,96:1 con texto blanco).
- Temas claro, oscuro y sistema mediante `data-theme` en `<html>`, usando tokens semánticos `--ds-*` en `src/styles.css`.
- Lucide: íconos SVG de trazo uniforme (18 px predeterminados, 15/22/27 px variantes).
- Espaciados en múltiplos de 4 px; bordes redondeados de 9–14 px según el componente.
- Responsive **mobile first**: base sin media queries para móviles, ampliaciones progresivas a `min-width:480px`, `841px`, `1024px`, `1200px`.

## Arquitectura de componentes

El origen reutilizable de las diez páginas es `scripts/generate.py`:

- `I(nombre)` para SVG inline;
- `BTN(...)` para acciones;
- `B(...)` para estados;
- `CARD(...)` para superficies;
- `FIELD(...)` para inputs;
- `shell(...)` para barra superior, navegación, pie y estructura de páginas;
- `NAV` y `LEGACY` como referencias de navegación.

`enhance_pages.py` es una etapa compartida que agrega logotipos, enlaces de salto, nombres accesibles, metadatos y estructura semántica a todas las páginas. Requiere Beautiful Soup solo para **regenerar HTML**, no para ejecutarlo en el navegador.

`components/` contiene ejemplos HTML de botón, campo, buscador, alerta, modal, tabla, stepper y marca. Se utilizan las mismas clases `.btn`, `.field`, `.badge`, `.alert`, `.dialog`, `.data-table`, `.stepper`, etc. No crear estilos ad-hoc por pantalla: primero ampliar el componente base y probar en ambos temas.

## Criterios de implementación

1. Elegir una semántica de componente; cambiar la variante visual por clase y token, no por CSS inline repetitivo.
2. Los estados (`disabled`, `hover`, `focus-visible`, `invalid`, `loading`, `success`, `danger`) deben tener representación textual cuando transmiten información.
3. Declarar `type="button"` por defecto. Los botones de envío usan `type="submit"`.
4. Los campos necesitan `label for=id`; los errores, `aria-invalid`, `aria-describedby` y anuncio; los campos obligatorios, `required`.
5. Las tablas de datos incorporan `<caption>`, `<th scope="col">`, región desplazable enfocables y controles de paginación etiquetados.
6. Los modales usan `<dialog>` nativo (foco, Escape); los menús móviles tienen apertura, cierre, trampa de foco y retorno de foco.
7. Los procesos de impresión, fotografía y QR no heredan inversiones de color del tema oscuro.
8. Mantener separados modelos de datos, navegación y vistas; conectar a backend únicamente tras revisión funcional.

## Ejecución y regeneración

Para **ver** el entregable no hay instalación: abrir `index.html`. Todos los CSS y SVG de interfaz están empaquetados. La carga de Fira Sans necesita red; se ofrece fuente de respaldo sin romper el layout.

Para **editar** la fuente generadora:

```bash
python -m pip install -r requirements-build.txt
python scripts/generate.py
npm install
npm run build
```

La estructura del menú original se conserva en `src/legacy-menu.json` como referencia no funcional; no hay navegación productiva ni autenticación, captura o impresión reales.
