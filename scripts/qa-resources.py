"""Referencias locales y contraste de pares seleccionados. No audita WCAG completa."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
import json

root=Path(__file__).resolve().parents[1]
references=[]
for file in sorted(root.glob('*.html')):
 soup=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser')
 for node in soup.select('[href],[src]'):
  for attr in ('href','src'):
   value=node.get(attr)
   if not value:continue
   url=urlsplit(value)
   if url.scheme or url.netloc:continue
   target=file.parent/unquote(url.path) if url.path else file
   valid=target.is_file()
   if valid and url.fragment and target.suffix=='.html':
    linked=BeautifulSoup(target.read_text(encoding='utf-8'),'html.parser')
    valid=bool(linked.find(id=unquote(url.fragment)))
   references.append({'page':file.name,'reference':value,'exists':valid})

def luminance(color):
 values=[int(color.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)]
 linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values]
 return sum(a*b for a,b in zip(linear,(.2126,.7152,.0722)))

pairs=[
 ('Foco claro / blanco','#286184','#ffffff',3),
 ('Borde de campo claro / blanco','#7d8fa1','#ffffff',3),
 ('Texto botón primario','#ffffff','#3c759f',4.5),
 ('Título slider / extremo más claro del gradiente','#ffffff','#344f70',4.5),
 ('Descripción slider / extremo más claro del gradiente','#e0ecf5','#344f70',4.5),
 ('Texto auxiliar slider / extremo más claro del gradiente','#d3e4f1','#344f70',4.5),
 ('Texto de visualización / panel','#edf5fb','#1e334e',4.5),
 ('Texto de estado / fondo de estado','#edf5fb','#2b4865',4.5),
 ('Borde del estado / fondo de estado','#87a9c5','#2b4865',3),
 ('Borde de controles / extremo más claro del gradiente','#9bbad2','#344f70',3),
 ('Indicador inactivo / extremo más claro del gradiente','#92adc5','#344f70',3),
 ('Foco slider / extremo más claro del gradiente','#b9e0ff','#344f70',3),
 ('Foco navegación / sidebar','#b9e0ff','#20334d',3),
 ('Texto en tema oscuro','#f0f5fb','#172638',4.5),
 ('Borde campo oscuro','#829ab1','#172638',3),
]
contrast=[]
for name,fg,bg,threshold in pairs:
 a,b=sorted((luminance(fg),luminance(bg)))
 ratio=(b+.05)/(a+.05)
 contrast.append({'pair':name,'foreground':fg,'background':bg,'ratio':round(ratio,2),'threshold':threshold,'pass':ratio>=threshold})
report={'pages':len(list(root.glob('*.html'))),'references':len(references),'errors':[r for r in references if not r['exists']],'details':references}
(root/'docs/QA-RECURSOS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(root/'docs/QA-CONTRASTE.json').write_text(json.dumps({'scope':'Pares seleccionados; no incluye todos los estados ni certifica conformidad.', 'pairs':contrast},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"{report['pages']} páginas; {report['references']} referencias locales; {len(report['errors'])} errores.")
print(f"Contraste: {sum(p['pass'] for p in contrast)}/{len(contrast)} pares seleccionados aprobados.")
raise SystemExit(bool(report['errors']) or any(not p['pass'] for p in contrast))
