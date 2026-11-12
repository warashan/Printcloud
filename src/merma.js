/* Prototipo de merma: datos y adjuntos solo en memoria, sin peticiones de red. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 if (!$('mermaForm')) return;
 const offices = ['Oficina #0','Antofagasta','Concepción','Coquimbo','La Serena','Ovalle','Puerto Montt','Santiago Demo','Talca','Valdivia','Valparaíso','Valparaíso Demo','Viña del Mar'];
 const records = [28,27,24,17,14,7].map((id,i) => ({id,office:i===0?'Oficina #0':[24,17].includes(id)?'Viña del Mar':'Puerto Montt',reason:i===0?'DATO FICTICIO: prueba local de merma de tarjeta en blanco':'DEMO: merma por impresión',folios:i===0?['990100001']:[],operator:'Admin Demo',date:i===0?'2026-11-12':'2026-09-30',time:i===0?'12:52:56':'13:00:00',files:[],illustrative:i===0}));
 let page=1, active={office:'',date:'',operator:''}, files=[], folios=[], evidenceTrigger=null;
 const pageSize=6;
 const node=(tag,text,cl)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cl)e.className=cl;return e;};
 const error=(id,message)=>{ $(id+'Error').textContent=message;const field=$(id);if(field){field.setAttribute('aria-invalid',String(!!message));} };
 for(const id of ['mermaOffice','mermaReason','mermaConfirm'])$(id).addEventListener(id==='mermaReason'?'input':'change',()=>{error(id,'');$('mermaFormError').textContent='';});
 $('mermaFolio').addEventListener('input',()=>error('mermaFolio',''));
 $('mermaChooseFiles').addEventListener('click',()=>$('mermaFiles').click());
 const message=(text,tone='success')=>window.PCToast?.(text,tone);
 for(const id of ['mermaOfficeFilter','mermaOffice'])for(const name of offices)$(id).add(new Option(name,name));
 $('mermaOffice').setAttribute('aria-describedby','mermaOfficeError');
 function render(){
  const rows=records.filter(r=>(!active.office||r.office===active.office)&&(!active.date||r.date===active.date)&&(!active.operator||r.operator===active.operator));
  const pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages);
  $('mermaRows').replaceChildren();
  for(const r of rows.slice((page-1)*pageSize,page*pageSize)){
   const tr=node('tr');
   for(const text of [String(r.id),r.office,r.reason,r.folios.length?r.folios.join(', '):'No informadas',r.operator,`${r.date} ${r.time}`])tr.append(node('td',text));
   const td=node('td');
   if(r.files.length||r.illustrative){const b=node('button',r.illustrative?'Ver fotografía 1':`Ver adjuntos (${r.files.length})`,'btn btn-secondary btn-sm');b.type='button';b.setAttribute('aria-label',`${b.textContent} del lote ${r.id}`);b.addEventListener('click',()=>showEvidence(r,b));td.append(b);}else td.append(node('span','Sin adjuntos','field-hint'));
   tr.append(td);$('mermaRows').append(tr);
  }
  $('mermaEmpty').hidden=!!rows.length;
  $('mermaLotCount').textContent=`${records.length} lotes registrados · ${records.reduce((n,r)=>n+r.folios.length,0)} folios informados`;
  $('mermaResults').textContent=rows.length?`${(page-1)*pageSize+1}–${Math.min(page*pageSize,rows.length)} de ${rows.length} lotes`:'0 lotes';
  $('mermaPage').textContent=`${page} / ${pages}`;$('mermaPrev').disabled=page<=1;$('mermaNext').disabled=page>=pages;
 }
 function showEvidence(r,trigger){
  evidenceTrigger=trigger;$('mermaEvidenceTitle').textContent=`Adjuntos del lote #${r.id}`;
  const container=$('mermaEvidence');container.replaceChildren();
  if(r.illustrative){const figure=node('figure',undefined,'merma-evidence-item');figure.append(node('p','La captura de referencia no incluye el archivo original. Esta imagen es ilustrativa.','field-hint'));const img=node('img');img.src='assets/merma-demo.svg';img.alt='Ilustración de tarjetas de prueba, no corresponde a una fotografía original.';figure.append(img,node('figcaption','Fotografía 1 · Referencia ilustrativa de demostración'));container.append(figure);}
  for(const file of r.files){const figure=node('figure',undefined,'merma-evidence-item');if(file.type.startsWith('image/')){const img=node('img');img.src=file.url;img.alt=`Evidencia adjunta: ${file.name}`;figure.append(img);}else figure.append(node('p','Documento PDF','badge badge-info'));figure.append(node('figcaption',file.name));const a=node('a','Descargar archivo','btn btn-secondary btn-sm');a.href=file.url;a.download=file.name;figure.append(a);container.append(figure);}
  $('mermaEvidenceDialog').showModal();
 }
 $('mermaEvidenceDialog').addEventListener('close',()=>{evidenceTrigger?.focus();});
 $('mermaSearch').addEventListener('submit',e=>{e.preventDefault();active={office:$('mermaOfficeFilter').value,date:$('mermaDateFilter').value,operator:$('mermaOperatorFilter').value};page=1;render();$('mermaFilterStatus').textContent='Filtros aplicados.';});
 $('mermaClear').addEventListener('click',()=>{$('mermaSearch').reset();active={office:'',date:'',operator:''};page=1;render();$('mermaFilterStatus').textContent='Mostrando todos los lotes.';});
 $('mermaPrev').addEventListener('click',()=>{page--;render();});$('mermaNext').addEventListener('click',()=>{page++;render();});
 function syncFolios(){
  const selected=new Set([...$('mermaFolios').selectedOptions].map(o=>o.value));
  $('mermaFolios').replaceChildren(...folios.map(f=>{const o=new Option(f,f);o.selected=selected.has(f);return o;}));
  syncSelection();$('mermaRemoveAll').disabled=!folios.length;
  $('mermaFolioStatus').textContent=`${folios.length} ${folios.length===1?'folio agregado':'folios agregados'}.`;
 }
 function syncSelection(){$('mermaRemoveSelected').disabled=!$('mermaFolios').selectedOptions.length;}
 function addFolio(){
  const value=$('mermaFolio').value.trim();
  if(!/^\d{6,12}$/.test(value)){error('mermaFolio','Ingresa un folio de 6 a 12 dígitos.');$('mermaFolio').focus();return;}
  if(folios.includes(value)||records.some(r=>r.folios.includes(value))){error('mermaFolio','Este folio ya está agregado o declarado en la demostración.');$('mermaFolio').focus();return;}
  error('mermaFolio','');error('mermaFolios','');folios.push(value);$('mermaFolio').value='';syncFolios();$('mermaFolio').focus();
 }
 $('mermaAddFolio').addEventListener('click',addFolio);
 $('mermaFolio').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addFolio();}});
 $('mermaFolios').addEventListener('change',syncSelection);
 $('mermaRemoveSelected').addEventListener('click',()=>{const selected=new Set([...$('mermaFolios').selectedOptions].map(o=>o.value));folios=folios.filter(f=>!selected.has(f));syncFolios();});
 $('mermaRemoveAll').addEventListener('click',()=>{folios=[];syncFolios();});
 function renderFiles(){
  $('mermaFileCount').textContent=files.length?`${files.length} ${files.length===1?'archivo adjunto':'archivos adjuntos'}`:'Sin archivos seleccionados';
  $('mermaFileList').replaceChildren();
  files.forEach((file,i)=>{const li=node('li');if(file.type.startsWith('image/')){const img=node('img');img.src=file.url;img.alt='';li.append(img);}li.append(node('span',file.name));const b=node('button','Quitar','btn btn-ghost btn-sm');b.type='button';b.setAttribute('aria-label',`Quitar ${file.name}`);b.addEventListener('click',()=>{URL.revokeObjectURL(file.url);files.splice(i,1);renderFiles();});li.append(b);$('mermaFileList').append(li);});
 }
 $('mermaFiles').addEventListener('change',()=>{
  const incoming=[...$('mermaFiles').files];$('mermaFiles').value='';
  const allowed={'image/jpeg':/\.jpe?g$/i,'image/png':/\.png$/i,'image/webp':/\.webp$/i,'application/pdf':/\.pdf$/i};
  if(files.length+incoming.length>5){error('mermaFiles','Puedes adjuntar hasta 5 archivos.');return;}
  if(incoming.some(f=>!allowed[f.type]?.test(f.name)||f.size>5*1024*1024||!f.size)){error('mermaFiles','Adjunta archivos JPG, PNG, WebP o PDF válidos, de hasta 5 MB cada uno.');return;}
  for(const f of incoming)if(!files.some(x=>x.name===f.name&&x.size===f.size))files.push({name:f.name,size:f.size,type:f.type,url:URL.createObjectURL(f)});
  error('mermaFiles','');renderFiles();
 });
 function clearDraft(){
  files.forEach(f=>URL.revokeObjectURL(f.url));files=[];folios=[];$('mermaForm').reset();
  for(const id of ['mermaOffice','mermaReason','mermaFiles','mermaConfirm','mermaFolio','mermaFolios','mermaForm'])error(id,'');
  renderFiles();syncFolios();
 }
 $('mermaNew').addEventListener('click',()=>{clearDraft();$('mermaOffice').value=active.office;$('mermaOffice').focus();});
 $('mermaDialog').addEventListener('close',()=>{clearDraft();$('mermaNew').focus();});
 $('mermaForm').addEventListener('submit',e=>{
  e.preventDefault();let first=null;
  for(const [id,valid,text] of [
   ['mermaOffice',offices.includes($('mermaOffice').value),'Selecciona una oficina.'],
   ['mermaReason',!!$('mermaReason').value.trim(),'Describe el motivo de la merma.'],
   ['mermaFiles',files.length>0,'Adjunta al menos un documento o fotografía.'],
   ['mermaConfirm',$('mermaConfirm').checked,'Debes confirmar la cobertura de las fotografías.'],
   ['mermaFolios',folios.length>0,'Agrega al menos un folio.']
  ]){error(id,valid?'':text);if(!valid&&!first)first=$(id==='mermaFiles'?'mermaChooseFiles':id);}
  if($('mermaFolio').value.trim()){error('mermaFolio','Agrega este folio o vacía el campo antes de declarar.');first||=$('mermaFolio');}
  if(first){$('mermaFormError').textContent='Revisa los campos indicados antes de declarar.';first.focus();return;}
  const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()).split(' ');
  const id=Math.max(...records.map(r=>r.id))+1;
  records.unshift({id,office:$('mermaOffice').value,reason:$('mermaReason').value.trim(),folios:[...folios],operator:'Admin Demo',date:parts[0],time:parts[1],files:[...files]});
  files=[]; // Los adjuntos pasan a ser propiedad del registro; el cierre solo libera borradores.
  $('mermaDialog').close();$('mermaSearch').reset();active={office:'',date:'',operator:''};page=1;render();
  $('mermaFilterStatus').textContent=`Lote #${id} creado. Mostrando todos los lotes.`;message(`Declaración de merma #${id} creada en esta pestaña.`);
 });
 render();syncFolios();
})();
