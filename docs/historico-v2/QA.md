# Accesibilidad — auditoría preliminar PrintCloud DS v2.0

**Objetivo de diseño:** WCAG **2.2 nivel AA** (incluye nivel A). **No es una declaración de conformidad formal**. WCAG exige revisar página completa, interacciones y adaptaciones; las pruebas automáticas no cubren todos los criterios y queda pendiente evaluación con tecnologías de apoyo y personas usuarias.

## Validaciones realizadas

- Comprobación estructural en las 10 páginas (`python scripts/audit_static.py`): 0 incidencias entre reglas implementadas: un `<main>` y un `<h1>` por pantalla, `lang="es"`, etiquetas de formulario, nombres de enlaces/botones, imágenes con `alt`, IDs únicos, referencias ARIA existentes y skip link.
- Pruebas automatizadas en Chromium con HTML, CSS y assets embebidos temporalmente para el test: anchuras 320, 390, 768, 1024 y 1440 CSS px, sobre las 10 vistas. No se detectó desbordamiento horizontal a nivel de página ni excepciones JS en esa ejecución. Las tablas permiten desplazamiento horizontal de la región (contenido bidimensional).
- Interacciones probadas: selector claro/oscuro; menú móvil con foco inicial y retorno al cierre por Escape; `<dialog>` abre/cierra con Escape; la tabla pagina y muestra estado vacío al filtrar; login da feedback cuando falta usuario o contraseña.
- Contraste calculado de tokens base: blanco sobre `#3C759F`: **4,96:1**; texto principal `#283A55` sobre blanco: **11,50:1**; nav caption `#A4BBCE` sobre `#20334D`: **6,44:1**. Para textos secundarios se ajustó el tono `--ds-muted` claro a `#53677D`.

## Cobertura de requisitos relevantes

| Criterio WCAG 2.2 | Trabajo realizado | Estado |
|---|---|---|
| 1.1.1 Contenido no textual (A) | Marca con texto alternativo adecuado; íconos decorativos ocultos a lectores de pantalla | Comprobación estructural |
| 1.3.1 Información y relaciones (A) | Labels de campo, headings, tabla con `<caption>` y `<th scope>`, landmarks | Comprobación estructural |
| 1.4.3 Contraste mínimo (AA) | Tokens de color contrastados, revisión de pares principales | Parcial: verificar todos los estados renderizados |
| 1.4.10 Reflow (AA) | CSS mobile first, 320–1440 px; desplazamiento independiente en tablas | Prueba de viewport, pendiente 400% zoom manual |
| 1.4.11 Contraste no textual (AA) | Bordes de campo y foco visibles según tema | Pendiente inspección total por estado |
| 2.1.1 Teclado (A) | Controles nativos, menú móvil con tab y Escape, dialogs nativos | Pruebas parciales, ampliar recorrido |
| 2.4.1 Evitar bloques (A) | Enlace «Saltar al contenido principal» | Verificado |
| 2.4.7 Foco visible (AA) | Anillo `:focus-visible`; retorno de foco en menú | Prueba parcial |
| 2.4.11 Foco no oculto (mínimo) (AA) | Foco y scroll-margin; barra sticky | Pendiente revisar cada estado de foco |
| 2.5.8 Tamaño mínimo del objetivo (AA) | Botones 40–48 px; controles iconográficos ampliados | Inspección parcial, validar todas las excepciones |
| 3.3.1 Identificación de errores (A) | Texto y estados `aria-invalid` en formulario y login | Prueba parcial |
| 3.3.8 Autenticación accesible (AA) | Permite pegar/autocompletar contraseñas; sin CAPTCHA ni pruebas cognitivas | Demo sin backend: pendiente flujo real |
| 4.1.2 Nombre, función, valor (A) | Roles y etiquetas ARIA y elementos nativos | Auditoría estructural parcial |
| 4.1.3 Mensajes de estado (AA) | `role=status` / `aria-live` para feedback, resultados y progreso | Pendiente prueba NVDA/VoiceOver |

## Pendientes obligatorios para sostener conformidad AA

- Inspección manual integral de cada página en **ambos temas** y en estados activo, hover, foco, disabled, error y vacío; comprobar contrastes de todos los textos y componentes gráficos.
- Probar con **NVDA + Firefox/Chrome**, **VoiceOver + Safari/iOS**, TalkBack/Android según audiencia, navegación solo por teclado y por control de voz.
- 200% y 400% de zoom, tamaño de texto ampliado, espaciado personalizado (WCAG 1.4.12), orientación móvil, teclado externo y reducción de movimiento.
- Revisar orden de foco, contenido emergente, mensajes dinámicos, tablas amplias, target spacing real, mensajes de éxito y errores, y permanencia de ayuda.
- Auditar la **autenticación y los flujos productivos reales** una vez que se integre backend, captura fotográfica, impresoras y perfiles de usuario.
- Ejecutar axe-core/Lighthouse/WAVE en ambiente servido y registrar defectos concretos con captura, criterio WCAG y evidencia de corrección.

**Limitación del entorno:** las páginas fueron renderizadas mediante `page.set_content()` con recursos locales embebidos en el ensayo, porque la navegación directa a file:// y localhost fue restringida por el navegador de prueba. Esta estrategia permitió comprobar layout e interacciones, pero no reemplaza pruebas en el hosting definitivo.

Referencias normativas: https://www.w3.org/TR/WCAG22/ · mobile-first Tailwind: https://tailwindcss.com/docs/responsive-design
