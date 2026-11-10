/* Ensayo opcional del Dashboard en Chromium. Ver variables de QA en README. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PRINTCLOUD_PLAYWRIGHT_PATH || 'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'docs/qa-dashboard');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PRINTCLOUD_CHROME_PATH?{executablePath:process.env.PRINTCLOUD_CHROME_PATH}:{})});
const results=[],errors=[];
const record=name=>results.push({name,status:'Aprobado'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.abort());
 const go=file=>page.goto(pathToFileURL(path.join(root,file)).href);
 const metric=key=>page.locator(`[data-dashboard-metric="${key}"]`).evaluate(element=>Number(element.textContent.replace(/\./g,'')));
 await go('index.html');await page.locator('#sidebar a[href="dashboard.html"]').click();await page.waitForURL('**/dashboard.html');
 const initial=await metric('total');assert(initial>0);assert.equal(await page.locator('#dashboardRows tr').count(),5);record('Acceso desde la biblioteca e inicialización');
 const sum=await page.locator('#dashboardChartData tr').evaluateAll(rows=>rows.reduce((sum,row)=>sum+Number(row.lastElementChild.textContent),0));assert.equal(sum,initial);assert.equal(Number(await page.locator('#dashboardDonutTotal').textContent()),initial);record('Totales coherentes entre indicadores, gráfico diario y distribución');
 await page.locator('#dashboardOffice').selectOption('Valparaíso');const officeTotal=await metric('total');assert(officeTotal<initial);assert((await page.locator('#dashboardRows').textContent()).includes('Valparaíso'));await page.locator('#dashboardPeriod').selectOption('14');assert(await metric('total')>officeTotal);assert.equal(await page.locator('#dashboardChartData tr').count(),14);record('Filtros de oficina y período actualizan todo el resumen');
 const code=await page.locator('#dashboardRows tr').first().textContent();await page.locator('#dashboardNext').click();assert.notEqual(await page.locator('#dashboardRows tr').first().textContent(),code);await page.locator('#dashboardSearch').fill('no-coincide');assert(await page.locator('#dashboardEmpty').isVisible());await page.locator('#dashboardEmptyReset').click();await page.locator('#dashboardSearch').fill('vina');assert((await page.locator('#dashboardRows tr').first().textContent()).includes('Viña'));record('Paginación, búsqueda sin tildes, estado vacío y restauración');
 await page.locator('#dashboardAttention').click();assert.equal(await page.locator('[data-dashboard-filter="Con observaciones"]').getAttribute('aria-pressed'),'true');assert((await page.locator('#dashboardRows tr').first().textContent()).includes('Con observaciones'));await page.locator('#dashboardRows button').first().focus();await page.keyboard.press('Enter');assert(await page.locator('#dashboardDetail').isVisible());assert.equal(await page.locator('#dashboardDetailSteps [aria-current="step"]').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement?.hasAttribute('data-dashboard-detail'));record('Observaciones, detalle nativo, progreso y retorno de foco');
 await page.locator('#dashboardReset').click();await page.locator('#dashboardRefresh').click();assert.equal(await page.locator('#dashboardOverview').getAttribute('aria-busy'),'true');await page.waitForFunction(()=>document.querySelector('#dashboardOverview').getAttribute('aria-busy')==='false');assert(await page.locator('#dashboardLoading').isHidden());assert((await page.locator('.toast').last().textContent()).includes('datos de demostración'));await page.locator('.toast .alert-dismiss').last().click();record('Actualización con loader, aria-busy e historial de notificaciones');
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>window.PCTheme.set(theme),theme);
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:1050});await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow a ${width}/${theme}`);assert.equal(await page.locator('.nav-link[aria-current="page"]').evaluate(element=>getComputedStyle(element).boxShadow),'none');
   if([390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,`dashboard-${width}-${theme}.png`),fullPage:true});}
  }
  record(`Dashboard responsive sin overflow y sin franja de selección, tema ${theme}`);
 }
 await page.setViewportSize({width:1440,height:1050});await page.locator('#sidebarToggle').click();await page.waitForTimeout(350);assert.equal(Math.round(await page.locator('#sidebar').evaluate(element=>element.getBoundingClientRect().width)),76);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('#sidebarToggle').click();record('Menú compacto y Dashboard adaptado al espacio disponible');
 for(const theme of ['light','dark']){await go('index.html');await page.evaluate(theme=>window.PCTheme.set(theme),theme);await page.waitForTimeout(300);const colors=await page.locator('.metric-icon').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).color));assert(new Set(colors).size>=5);assert.equal(await page.locator('.metric-icon:not([data-icon-tone])').count(),0);await page.screenshot({path:path.join(output,`biblioteca-iconos-${theme}.png`),fullPage:true});}record('Paleta multicolor en iconos de tarjetas en ambos temas');
 for(const file of fs.readdirSync(root).filter(file=>file.endsWith('.html')&&file!=='login.html')){await go(file);assert.equal(await page.locator('#sidebar a[href="dashboard.html"]').count(),1);assert.equal(await page.locator('.metric-icon:not([data-icon-tone])').count(),0);}record('Dashboard enlazado e iconos con tono en todas las pantallas con menú');
 await go('dashboard.html');await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#dashboardOffice').selectOption('Quilpué');assert((await page.locator('#dashboardRows tr').first().textContent()).includes('Quilpué'));record('Controles funcionales con movimiento reducido');
 assert.deepEqual(errors,[]);record('Sin excepciones JavaScript');
 console.log(JSON.stringify({environment:'Chrome local; file://; fuentes remotas bloqueadas',results,errors},null,2));
}finally{fs.writeFileSync(path.join(root,'docs/QA-DASHBOARD.json'),JSON.stringify({results,errors},null,2)+'\n');await browser.close();}
