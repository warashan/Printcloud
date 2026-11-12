/* Pruebas de lógica en DOM simulado. No sustituyen un navegador o lector de pantalla. */
import {JSDOM} from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const results=[];
function load(file){
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://printcloud.test/'+file,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let dark=false;const listeners=[];
 w.matchMedia=q=>({get matches(){return q.includes('color-scheme')?dark:false;},addEventListener:(type,fn)=>listeners.push(fn)});
 w.changeOS=()=>{dark=!dark;listeners.forEach(fn=>fn());};
 // Solo permite probar que se solicita abrir/cerrar el diálogo, no su comportamiento nativo.
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.Blob=class{constructor(parts){this.parts=parts;w.lastBlob=this;}};
 w.URL.createObjectURL=()=> 'blob:printcloud-test';w.URL.revokeObjectURL=()=>{};
 w.document.addEventListener('click',e=>{if(e.target.closest('a[download]'))e.preventDefault();});
 w.eval(fs.readFileSync(path.join(root,'src/theme-init.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'src/app.js'),'utf8'));
 if(w.document.querySelector('script[src="src/dashboard-model.js"]'))w.eval(fs.readFileSync(path.join(root,'src/dashboard-model.js'),'utf8'));
 if(w.document.querySelector('script[src="src/dashboard.js"]'))w.eval(fs.readFileSync(path.join(root,'src/dashboard.js'),'utf8'));
 if(w.document.querySelector('script[src="src/merma.js"]'))w.eval(fs.readFileSync(path.join(root,'src/merma.js'),'utf8'));
 const $=s=>w.document.querySelector(s), $$=s=>[...w.document.querySelectorAll(s)];
 const input=(s,value,event='input')=>{$(s).value=value;$(s).dispatchEvent(new w.Event(event,{bubbles:true}));};
 return {w,$,$$,input,close:()=>dom.window.close()};
}
function test(name,fn){fn();results.push({name,status:'Aprobado'});}
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){test('Inicialización '+file,()=>{const d=load(file);assert.ok(d.$('main'));assert.ok(d.$('link[href="src/refinements.css"]'));d.close();});}
{
 const d=load('tablas.html'),{w,$,$$,input}=d;
 const visible=()=>$$('#tableBody tr:not([hidden])');
 test('Tabla: 26 registros y paginación inicial',()=>{assert.equal($$('#tableBody tr').length,26);assert.equal(visible().length,10);});
 test('Seleccionar visibles y selección parcial',()=>{$('#selectAll').click();assert.match($('#selectionCount').textContent,/10 seleccionadas/);visible()[0].querySelector('.table-select').click();assert.equal($('#selectAll').indeterminate,true);});
 test('Conservar selección al paginar',()=>{$('#tablePagination button[aria-label="Página 2"]').click();assert.match($('#selectionCount').textContent,/9 seleccionadas/);assert.equal($('#selectAll').checked,false);});
 test('Limpiar selección',()=>{$('#clearSelection').click();assert.equal($$('.table-select:checked').length,0);});
 test('Filtro ignora tildes',()=>{input('#tableSearch','Vina');assert.ok(visible().length>0);assert.ok(visible().every(row=>row.textContent.includes('Viña')));});
 test('CSV contiene resultados filtrados',()=>{$('#exportTable').click();assert.match(w.lastBlob.parts[0],/Viña del Mar/);assert.ok(!w.lastBlob.parts[0].includes('Quilpué'));});
 test('CSV de selección exporta solo seleccionadas filtradas',()=>{visible()[0].querySelector('.table-select').click();$('#exportTable').click();assert.equal(w.lastBlob.parts[0].split('\r\n').length,2);});
 test('Detalle coincide con fila',()=>{const row=visible()[0];row.querySelector('.table-detail').click();assert.equal($('#tableDetailDialog').open,true);assert.equal($('#tableDetailTitle').textContent,row.dataset.code);assert.match($('#tableDetailFields').textContent,/Viña del Mar/);$('#tableDetailDialog [data-close-dialog]').click();assert.equal($('#tableDetailDialog').open,false);});
 test('Sin resultados y restauración',()=>{input('#tableSearch','zzzzzzzz');assert.equal(visible().length,0);assert.equal($('#exportTable').disabled,true);assert.equal($('#tableEmpty').hidden,false);$('#clearTableFilters').click();assert.equal(visible().length,10);assert.equal($('#tableEmpty').hidden,true);});
 test('Orden descendente anunciado',()=>{$('#sortCode').click();assert.equal($('#sortCode').closest('th').getAttribute('aria-sort'),'descending');assert.equal(visible()[0].dataset.code,'SOL-2026-0026');});
 d.close();
}
{
 const d=load('formularios.html'),{$,w,input}=d;
 test('Formulario: envío por evento submit valida vacíos',()=>{$('#demoForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));assert.equal($('#rut').getAttribute('aria-invalid'),'true');assert.equal($('#rutError').hidden,false);});
 test('Corregir campos limpia error y valida',()=>{input('#rut','12.345.678-9');input('#folio','SOL-DEMO');assert.equal($('#rutError').hidden,true);$('#demoForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));assert.match($('#formFeedback').textContent,/Campos obligatorios presentes/);});
 test('Limpiar formulario restablece feedback',()=>{$('#formReset').click();assert.equal($('#rut').value,'');assert.equal($('#formFeedback').textContent,'');});d.close();
}
{
 const d=load('buscadores.html'),{$,$$,input}=d;
 test('Buscador: texto sin tildes y chips removibles',()=>{input('#searchTerm','vina');assert.ok($$('.search-result:not([hidden])').length>0);assert.ok($('#activeFilters button'));$('#activeFilters button').click();assert.equal($('#searchTerm').value,'');assert.equal($$('.search-result:not([hidden])').length,9);});d.close();
}
{
 const d=load('index.html'),{$,$$,w,input}=d;
 test('Tema del sistema persiste y sigue cambios del SO',()=>{$('[data-theme-choice="system"]').click();assert.equal(w.localStorage.getItem('printcloud-ds-appearance'),'system');w.changeOS();assert.equal(w.document.documentElement.dataset.theme,'dark');assert.equal($('[data-theme-choice="system"]').getAttribute('aria-pressed'),'true');});
 test('Inventario: filtra y restaura módulos',()=>{const total=$$('.nav-details').length;input('#menuSearch','ZZZZZZZ');assert.equal($$('.nav-details:not([hidden])').length,0);input('#menuSearch','');assert.equal($$('.nav-details:not([hidden])').length,total);});d.close();
}
{
 const d=load('login.html'),{$,$$,w}=d;
 const active=()=>$$('[data-login-slide]').filter(slide=>!slide.hidden);
 test('Login: tres diapositivas y primera activa',()=>{assert.equal($$('[data-login-slide]').length,3);assert.equal(active().length,1);assert.equal(active()[0].getAttribute('aria-label'),'1 de 3');assert.equal($('#loginSlideCount').textContent,'1 de 3');assert.equal($('#loginSlideStatus').textContent.trim(),'');});
 test('Login: siguiente conserva foco y anuncia el cambio',()=>{$('#loginSlideNext').focus();$('#loginSlideNext').click();assert.equal(w.document.activeElement,$('#loginSlideNext'));assert.equal(active()[0].getAttribute('aria-label'),'2 de 3');assert.equal($('#loginSlideCount').textContent,'2 de 3');assert.match($('#loginSlideStatus').textContent,/Captura y revisión de información/);});
 test('Login: anterior e indicadores coinciden',()=>{$('#loginSlidePrev').click();assert.equal($('#loginSlideCount').textContent,'1 de 3');$('[data-login-go="2"]').click();assert.equal($('#loginSlideCount').textContent,'3 de 3');assert.equal($('[data-login-go="2"]').getAttribute('aria-pressed'),'true');assert.equal($$('[data-login-go][aria-pressed="true"]').length,1);});
 test('Login: diapositivas ocultas son inertes',()=>{$$('[data-login-slide]').forEach(slide=>{assert.equal(slide.getAttribute('aria-hidden'),String(slide.hidden));assert.equal(slide.hasAttribute('inert'),slide.hidden);});});
 test('Login: navegación circular y controles nativos',()=>{$('#loginSlideNext').click();assert.equal($('#loginSlideCount').textContent,'1 de 3');$('#loginSlidePrev').click();assert.equal($('#loginSlideCount').textContent,'3 de 3');$$('.login-carousel-controls button').forEach(button=>{assert.equal(button.type,'button');assert.equal(button.disabled,false);});});
 test('Login: sin recordar usuario ni conexiones productivas',()=>{assert.equal($('#rememberMe'),null);assert.match($('.login-feature-note').textContent,/no están disponibles/);});
 d.close();
}
{
 const d=load('dashboard.html'),{$,$$,w,input}=d;
 const metric=key=>Number($(`[data-dashboard-metric="${key}"]`).textContent.replace(/\./g,''));
 test('Centralizado: seis indicadores y stock actual',()=>{assert.equal($$('[data-dashboard-metric]').length,6);assert(metric('total')>0);assert.equal(metric('stock'),664);assert.equal(metric('total'),metric('printed')+metric('pending'));});
 test('Centralizado: filtro por fechas y sucursal',()=>{input('#dashboardFrom','2026-10-01');input('#dashboardTo','2026-11-12');input('#dashboardOffice','Valparaíso');$('#dashboardFilters').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(metric('stock'),72);assert.equal($$('#dashboardBranchRows tr').length,1);});
 test('Centralizado: escenario sin solicitudes',()=>{input('#dashboardScenario','empty','change');assert.equal(metric('total'),0);assert.equal(metric('stock'),72);assert.equal($('#dashboardOverdueEmpty').hidden,false);assert.equal($('#dashboardExport').disabled,true);});
 test('Centralizado: configuración y UTM se guardan localmente',()=>{input('#dashboardSlaDays','3');$('#dashboardSlaForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(JSON.parse(w.localStorage.getItem('printcloud-centralizado-settings-v1')).days,3);input('#dashboardUtmMonth','2026-11');input('#dashboardUtmValue','72500');$('#dashboardUtmForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(JSON.parse(w.localStorage.getItem('printcloud-centralizado-utm-v1'))['2026-11'].value,72500);});
 d.close();
}
console.log(JSON.stringify({environment:'Node + jsdom 26; DOM simulado, sin layout ni motor de navegador',results},null,2));
