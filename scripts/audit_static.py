"""Auditoría estática de base — NO sustituye un informe de conformidad WCAG 2.2."""
from pathlib import Path
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1]
errors=[]
files=sorted(R.glob('*.html'))
for f in files:
 s=BeautifulSoup(f.read_text(encoding='utf-8'),'html.parser')
 ids=[x.get('id') for x in s.select('[id]')]
 checks=[(bool(s.html.get('lang')),'lang HTML ausente'),(len(s.select('main'))==1,'número de main distinto de 1'),(len(s.select('h1'))==1,'número de h1 distinto de 1'),(bool(s.select_one('.skip-link[href="#mainContent"]')),'falta enlace de salto'),(not s.select('img:not([alt])'),'imagen sin alt'),(not s.select('button:not([type])'),'button sin tipo explícito'),(len(ids)==len(set(ids)),'IDs duplicados')]
 for ok,msg in checks:
  if not ok:errors.append(f'{f.name}: {msg}')
 for control in s.select('input,select,textarea'):
  if control.get('type')=='hidden' or control.find_parent('label') or control.get('aria-label') or control.get('aria-labelledby'):continue
  id_=control.get('id')
  if not id_ or not s.select_one(f'label[for="{id_}"]'):errors.append(f'{f.name}: control sin nombre — {id_}')
 for target in s.select('a,button'):
  if not (target.get('aria-label') or target.get('aria-labelledby') or target.get_text(' ',strip=True) or target.select_one('img[alt]:not([alt=""])')):
   errors.append(f'{f.name}: acción sin nombre accesible')
 for el in s.select('[aria-labelledby],[aria-describedby],[aria-controls]'):
  for attr in ('aria-labelledby','aria-describedby','aria-controls'):
   for id_ in el.get(attr,'').split():
    if id_ not in ids:errors.append(f'{f.name}: referencia {attr} inexistente — {id_}')
print(f'HTML auditados: {len(files)}; problemas detectados: {len(errors)}')
for e in errors[:80]:print('  -',e)
raise SystemExit(bool(errors))
