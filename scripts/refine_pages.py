"""Refinamientos v2.1: posprocesado idempotente de la biblioteca original."""
from pathlib import Path
from bs4 import BeautifulSoup

def refine_all(root):
 for file in sorted(root.glob('*.html')):
  soup=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser')
  def insert(html):return BeautifulSoup(html,'html.parser')
  if not soup.select_one('link[href="src/refinements.css"]'):
   soup.head.append(soup.new_tag('link',rel='stylesheet',href='src/refinements.css'))
  # Mantener la selección claro/oscuro e incorporar preferencia del sistema.
  for group in soup.select('.theme-wrap'):
   if not group.select_one('[data-theme-choice="system"]'):
    group.append(insert('<button type="button" class="theme-btn theme-system" data-theme-choice="system" aria-label="Tema del sistema" title="Tema del sistema" aria-pressed="false"><svg class="icon icon-sm" aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="13" rx="2"></rect><path d="M8 21h8M12 16v5"></path></svg></button>').button)
  avatar=soup.select_one('.topbar .avatar')
  if avatar and not soup.select_one('#profileToggle'):
   profile=insert((root/'components/perfil.html').read_text(encoding='utf-8'))
   for node in list(profile.contents):avatar.insert_before(node)
   avatar.decompose()
  sidebar=soup.select_one('#sidebar')
  if sidebar and not soup.select_one('#menuSearch'):
   groups=sidebar.select('.nav-details')
   if groups:
    groups[0].insert_before(insert('<div class="menu-search"><label for="menuSearch" class="label">Buscar módulo del inventario</label><input id="menuSearch" type="search" class="field" placeholder="Nombre de módulo…" aria-describedby="menuCount"><p id="menuCount" class="field-hint" role="status">Inventario documental · módulos sin conexión</p></div>'))
  for id_ in ['iconCount','loaderCount','stepEyebrow']:
   node=soup.select_one('#'+id_)
   if node:node['role']='status';node['aria-live']='polite';node['aria-atomic']='true'
  # Estados del paso anunciados sin mover el foco del botón Siguiente.
  node=soup.select_one('#stepText')
  if node:node['aria-live']='polite';node['aria-atomic']='true'
  node=soup.select_one('#formSubmit')
  if node:node['type']='submit'
  if file.stem=='login':
   # Fuente única del panel informativo; controles del formulario primero en el DOM.
   story=soup.select_one('.login-story')
   if story and not soup.select_one('#loginCarousel'):
    slider=insert((root/'components/login-slider.html').read_text(encoding='utf-8')).section
    story.replace_with(slider)
   layout=soup.select_one('.login-page')
   panel=soup.select_one('.login-panel')
   if layout and panel and layout.find(recursive=False) is not panel:
    panel.extract();layout.insert(0,panel)
   # La demo no recuerda credenciales. No ofrecer un control que no hace nada.
   remember=soup.select_one('#rememberMe')
   if remember:
    label=remember.find_parent('label')
    label.replace_with(insert('<span class="field-hint">Usa datos ficticios para probar el formulario.</span>'))
   for id_ in ['loginUser','loginPassword']:
    node=soup.select_one('#'+id_)
    if node:node['autocomplete']='off'
  if file.stem=='tablas':
   if not soup.select_one('#selectionCount'):
    filters=soup.select_one('#tableSearch').find_parent('div',class_='surface-body')
    filters.append(insert('<div class="table-tools"><button id="clearTableFilters" class="btn btn-secondary btn-sm" type="button">Limpiar filtros</button><span id="selectionCount" role="status" aria-live="polite">0 seleccionadas</span><button id="clearSelection" class="btn btn-ghost btn-sm" type="button" disabled>Quitar selección</button></div><p class="field-hint">La selección se conserva al cambiar de página. Se exportan las filas seleccionadas que coinciden con los filtros; sin selección en los resultados, se exportan todos los resultados filtrados.</p>'))
    empty=soup.select_one('#tableEmpty')
    empty.append(insert('<p class="field-hint">Usa «Limpiar filtros» para volver al listado completo.</p>'))
   if not soup.select_one('#tableDetailDialog'):
    soup.body.append(insert('<dialog class="dialog" id="tableDetailDialog" aria-labelledby="tableDetailTitle" aria-describedby="tableDetailNote"><div class="dialog-header"><h2 id="tableDetailTitle" class="section-title">Detalle de solicitud</h2><button type="button" class="icon-btn" data-close-dialog aria-label="Cerrar detalle">×</button></div><div class="dialog-content"><p id="tableDetailNote" class="field-hint">Datos ficticios de la biblioteca. No corresponde a una solicitud real.</p><dl id="tableDetailFields" class="detail-fields"></dl></div><div class="dialog-footer"><button type="button" class="btn btn-secondary" data-close-dialog>Cerrar</button></div></dialog>'))
  file.write_text(soup.prettify(),encoding='utf-8')

if __name__=='__main__':refine_all(Path(__file__).resolve().parents[1])
