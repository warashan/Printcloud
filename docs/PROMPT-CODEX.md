# Prompt para Codex — PrintCloud Design System v2.0

Usa el ZIP `PrintCloud-TNE-Design-System-v2.0.zip` como proyecto principal. No partas de Bootstrap/Minton: esta es una interfaz nueva (Tailwind 4 compilado, HTML, JavaScript y CSS semántico). Preserva el branding oficial de PrintCloud by Concordia y los recursos reales en `assets/brand`.

Trabaja desde `scripts/generate.py` como origen de las diez vistas y el helper común de navegación/componentes; `scripts/enhance_pages.py` aplica ajustes transversales. Los componentes base se documentan en `components/` y `docs/DESIGN-SYSTEM.md`. Si agregas un nuevo componente, incorporarlo al catálogo y su CSS con tokens `--ds-*` en `src/styles.css`. No introducir reglas duplicadas por página.

Requisitos no negociables:
1. Mobile first desde 320 px, con breakpoints de ampliación progresiva; tabla con área de desplazamiento y navegación por teclado.
2. Temas Claro, Oscuro, Sistema sincronizados en todas las páginas.
3. WCAG 2.2 A/AA como objetivo, sin declarar conformidad hasta auditoría manual y con ayudas técnicas. Implementar etiquetas accesibles, foco visible, skip link, modales nativos, errores asociados a campos, estados textuales, ARIA donde corresponda.
4. Mantener logotipo blanco en fondos oscuros; logotipo color en fondos claros; ícono oficial para favicon y navegación compacta.
5. Fira Sans y Lucide con iconos SVG; no copiar los logos como recreaciones iconográficas.
6. Los prototipos NO deben ejecutar servicios, autenticación, cámaras ni impresión. El backend no se toca.
7. Ejecutar `python scripts/audit_static.py` y `npm run build` tras cambios; validar visualmente con capturas 320,390,768,1024,1440 en claro y oscuro.
8. Registrar cambios, riesgos, accesibilidad pendiente y evidencias de QA. No desplegar automáticamente.

Ver `docs/AUDITORIA-WCAG-2.2.md` para el alcance y las pruebas pendientes.
