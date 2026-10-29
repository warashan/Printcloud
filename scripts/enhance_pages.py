"""Ajustes estructurales compartidos de marca, semántica y accesibilidad.
Invocado por generate.py. Requiere beautifulsoup4 solo durante la generación;
los HTML resultantes NO dependen de Python ni de este paquete en ejecución.
"""
from pathlib import Path
from bs4 import BeautifulSoup

BRAND='''<picture class="brand-picture" aria-hidden="true"><img class="brand-wordmark" src="assets/brand/printcloud_blanco.png" width="1001" height="241" alt=""></picture><img alt="" class="brand-symbol" height="38" src="assets/brand/favicon.png" width="38" /><span class="sr-only">PrintCloud by Concordia — Biblioteca de componentes</span>'''
LOGIN_COLOR='''<a class="login-mobile-brand" href="index.html" aria-label="PrintCloud by Concordia — Biblioteca de componentes"><img class="login-mobile-logo-color" src="assets/brand/printcloud_color.png" width="1001" height="241" alt=""><img class="login-mobile-logo-white" src="assets/brand/printcloud_blanco.png" width="1001" height="241" alt=""></a>'''

def fragment(html):
  return BeautifulSoup(html,'html.parser')

def enhance_all(root: Path):
  for file in sorted(root.glob('*.html')):
    soup=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser')
    for choice in soup.select('[data-theme-choice="system"]'):
      choice.decompose()
    head=soup.head
    link=soup.new_tag('link', rel='icon', href='assets/brand/favicon.png', type='image/png');head.append(link)
    # La estructura visual contiene un solo H1 por vista. Skip link visible al foco.
    skip=fragment('<a class="skip-link" href="#mainContent">Saltar al contenido principal</a>').a
    soup.body.insert(0,skip)
    main=soup.select_one('main')
    if main:
      main['id']='mainContent';main['tabindex']='-1'
    else:
      # En login, la sección de formulario es el contenido principal.
      main=soup.select_one('.login-panel')
      if main:
        main.name='main';main['id']='mainContent';main['tabindex']='-1'
    sidebar=soup.select_one('#sidebar')
    if sidebar:
      sidebar['tabindex']='-1'
      brand=sidebar.select_one('.brand')
      if brand:
        brand.clear()
        for ch in list(fragment(BRAND).contents):brand.append(ch)
      close=fragment('<button type="button" class="sidebar-close icon-btn" id="sidebarClose" aria-label="Cerrar menú">×</button>').button
      sidebar.insert(0,close)
      # Favicon original marca el pie y no se usa como icono de navegación de Lucide.
      note=sidebar.select_one('.sidebar-note')
      if note:
        img=soup.new_tag('img',src='assets/brand/favicon.png',alt='',width='42',height='42')
        img['class']='sidebar-note-icon';note.insert(0,img)
    topbar=soup.select_one('.topbar')
    if topbar:
      left=topbar.select_one('.topbar-left')
      if left and not left.select_one('#sidebarToggle'):
        left.insert(0,fragment('''<button aria-controls="sidebar" aria-expanded="true" aria-label="Contraer menú lateral" class="icon-btn sidebar-toggle" id="sidebarToggle" title="Contraer menú lateral" type="button"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18m7-13-4 4 4 4"></path></svg></button>''').button)
      for logo in topbar.select('.topbar-brand'):
        logo.decompose()
      right=topbar.select_one('.topbar-right')
      if right and not right.select_one('#notificationToggle'):
        right.insert(0,fragment((root/'components/notificaciones.html').read_text(encoding='utf-8')).select_one('.notification-center'))
      avatar=topbar.select_one('.avatar')
      if avatar:avatar['aria-label']='PrintCloud — perfil de demostración'
    logo=soup.select_one('.login-logo')
    if logo:
      logo.clear()
      logo.append(fragment('<img src="assets/brand/printcloud_blanco.png" alt="PrintCloud by Concordia" width="1001" height="241" class="login-story-brand">').img)
      loginpanel=soup.select_one('.login-form')
      if loginpanel:loginpanel.insert(0,fragment(LOGIN_COLOR).a)
      para=soup.select_one('.story-copy')
      if para: para.string='Gestiona solicitudes, captura fotográfica e impresión de tarjetas TNE en una plataforma centralizada, clara y eficiente.'
      hero_heading=soup.select_one('.story-heading')
      if hero_heading: hero_heading.name='p' # copy de marca, no encabezado de la jerarquía de la vista
    for button in soup.select('button'):
      if not button.has_attr('type'):button['type']='button'
    # inputs/labels: asociar explícitamente, también en los ejemplos no operativos.
    for ix, control in enumerate(soup.select('input,select,textarea')):
      if control.get('type')=='hidden':continue
      if control.get('aria-label') or control.get('aria-labelledby'): continue
      if control.parent.name=='label':continue
      id_=control.get('id')
      if id_ and soup.select_one(f'label[for="{id_}"]'):continue
      parent=control.parent
      label=parent.find_previous_sibling('label') or parent.find('label') if parent else None
      if not label:
        # Para componentes de muestra, la etiqueta y el campo suelen compartir contenedor.
        parent=control.find_parent(['div','form'])
        if parent:label=parent.find('label')
      if label:
        if not id_:
          id_=f'pc-{file.stem}-control-{ix+1}';control['id']=id_
        label['for']=id_
      else:
        control['aria-label']='Campo de ejemplo' if not control.get('placeholder') else control.get('placeholder')
    # Todas las tablas con cabeceras y captions accesibles.
    for ix,table in enumerate(soup.select('table')):
      if not table.find('caption'):
        cap=soup.new_tag('caption');cap['class']='sr-only';cap.string='Solicitudes TNE de demostración' if file.stem=='tablas' else 'Tabla de ejemplo PrintCloud'
        table.insert(0,cap)
      for th in table.select('thead th'):th['scope']='col'
      scroll=table.find_parent(class_='data-wrap')
      if scroll:
        scroll['tabindex']='0';scroll['role']='region';scroll['aria-label']='Tabla desplazable horizontalmente. Usa las flechas para recorrer las columnas.'
    # Leyendas y navegación por teclado.
    for dialog in soup.select('dialog'):
      title=dialog.select_one('h1,h2,h3,.dialog-title,.card-title')
      if title:
        titleid=title.get('id',f'{dialog.get("id","pc-dialog")}-title');title['id']=titleid
        dialog['aria-labelledby']=titleid
    for ix,button in enumerate(soup.select('button[data-dismiss-alert]')):
      title=button.find_parent('.alert').select_one('.alert-title') if button.find_parent('.alert') else None
      if title: button['aria-label']='Descartar alerta: '+title.get_text(' ',strip=True)
    note=soup.select_one('.sidebar-note')
    if note:
      for node in note.find_all(string=True):
        if 'Biblioteca UI v1.0' in str(node):node.replace_with(str(node).replace('Biblioteca UI v1.0','Biblioteca UI v2.0'))
    if file.stem=='steppers':
      for node in soup.select('#stepBadge .badge-dot'):node.attrs.pop('id',None)
      stage=soup.select_one('#stepStage')
      if stage:stage['aria-live']='polite';stage['aria-atomic']='true'
      stepper=soup.select_one('#stepper')
      if stepper:
        stepper['role']='list'
        for node in stepper.select('[data-step-item]'):node['role']='listitem'
    if file.stem=='login':
      pw=soup.select_one('#loginPassword');u=soup.select_one('#loginUser')
      fb=soup.select_one('#loginFeedback')
      if fb:fb['role']='status';fb['aria-live']='polite'
      for control in (u,pw):
        if control:control['aria-describedby']='loginFeedback'
      pwbutton=soup.select_one('#togglePassword')
      if pwbutton:pwbutton['aria-controls']='loginPassword';pwbutton['aria-pressed']='false'
    if file.stem=='formularios':
      for name in ['rut','folio']:
        c=soup.select_one('#'+name)
        if c:c['aria-describedby']=name+'Error'
      feedback=soup.select_one('#formFeedback')
      if feedback:feedback['role']='status';feedback['aria-live']='polite'
    if file.stem=='tablas':
      pager=soup.select_one('#tablePagination')
      if pager:pager['role']='navigation';pager['aria-label']='Páginas de resultados'
      count=soup.select_one('#tableCount')
      if count:count['aria-live']='polite';count['aria-atomic']='true'
    if file.stem=='iconos':
      count=soup.select_one('#iconCount')
      if count:count['aria-live']='polite'
    if file.stem=='buscadores':
      count=soup.select_one('#searchCount')
      if count:count['role']='status';count['aria-live']='polite'
    # Aplicar códigos semánticos sin decoración inline de marcas ajenas.
    for old in soup.select('[onmouseenter], [onmouseleave]'):
      old.attrs.pop('onmouseenter',None);old.attrs.pop('onmouseleave',None)
      old['class']=list(dict.fromkeys(old.get('class',[])+['hover-lift']))
    file.write_text(str(soup),encoding='utf-8')
  print('Brand + accessibility enhancements applied to all HTML files.')

if __name__=='__main__':
  enhance_all(Path(__file__).resolve().parents[1])
