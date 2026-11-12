/* Centralizado en Chrome real. Variables opcionales de Playwright/Chrome: ver README. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PRINTCLOUD_PLAYWRIGHT_PATH || 'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'docs/qa-centralizado');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PRINTCLOUD_CHROME_PATH?{executablePath:process.env.PRINTCLOUD_CHROME_PATH}:{})});
const results=[],errors=[];
const record=name=>results.push({name,status:'Aprobado'});
try {
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.abort());
 const go=file=>page.goto(pathToFileURL(path.join(root,file)).href);
 const metric=key=>page.locator(`[data-dashboard-metric="${key}"]`).evaluate(node=>Number(node.textContent.replace(/\./g,'')));
 await page.setViewportSize({width:1440,height:1050});await go('dashboard.html');
 const total=await metric('total');assert(total>0);assert.equal(await metric('stock'),664);assert.equal(total,await metric('printed')+await metric('pending'));assert.equal(await page.locator('[data-dashboard-metric]').count(),6);assert.equal(await page.locator('#dashboardBranchRows tr').count(),12);record('Seis indicadores y 12 sucursales con totales coherentes');
 const sums=await page.locator('#dashboardDailyRows tr').evaluateAll(rows=>rows.reduce((sum,row)=>sum+Number(row.children[1].textContent)+Number(row.children[2].textContent),0));assert.equal(sums,total);assert.equal(await page.locator('#dashboardDailyRows tr').count(),30);record('Gráfico diario y tabla coinciden con indicadores');
 assert(await page.locator('#dashboardOverdueEmpty').isVisible());assert(await page.locator('#dashboardExport').isDisabled());record('Escenario del mes: estado sin atrasos y exportación deshabilitada');
 await page.locator('#dashboardFrom').fill('2026-12-01');await page.locator('#dashboardFilters button[type="submit"]').click();assert((await page.locator('#dashboardFilterError').textContent()).includes('posterior'));assert.equal(await metric('total'),total);await page.locator('#dashboardCurrentMonth').click();record('Rango inválido no altera el resumen y Mes actual restaura fechas');
 await page.locator('#dashboardOffice').selectOption('Valparaíso');await page.locator('#dashboardFilters button[type="submit"]').click();assert.equal(await metric('stock'),72);assert.equal(await page.locator('#dashboardBranchRows tr').count(),1);assert(await metric('total')<total);await page.locator('#dashboardOffice').selectOption('');await page.locator('#dashboardLast90').click();record('Filtros de sucursal y rango amplían o reducen el resumen');
 assert(await page.locator('#dashboardOverdueRows tr').count()>0);assert(await page.locator('#dashboardConversionAlert').isVisible());assert((await page.locator('#dashboardMetricNote-fine').textContent()).includes('pendiente'));record('Atrasos presentes y UTM faltante se muestra como conversión pendiente');
 await page.locator('#dashboardOverdueNext').click();assert((await page.locator('#dashboardOverduePage').textContent()).includes('2 de'));await page.locator('#dashboardSearch').fill('sin-coincidencias');assert(await page.locator('#dashboardOverdueEmpty').isVisible());await page.locator('#dashboardSearch').fill('vina');assert((await page.locator('#dashboardOverdueRows tr').first().textContent()).includes('Viña'));record('Paginación y búsqueda sin tildes en atrasos');
 await page.locator('#dashboardOverdueRows button').first().focus();await page.keyboard.press('Enter');assert(await page.locator('#dashboardDetail').isVisible());assert.equal(await page.locator('#dashboardDetailSteps [aria-current="step"]').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement?.hasAttribute('data-dashboard-detail'));record('Detalle nativo y retorno de foco al cerrar con Escape');
 const downloadPromise=page.waitForEvent('download');await page.locator('#dashboardExport').click();const download=await downloadPromise;const csv=fs.readFileSync(await download.path(),'utf8');assert(csv.includes('Viña del Mar'));assert(!csv.includes('Valparaíso'));assert(csv.includes('Conversión pendiente'));record('CSV real respeta filtro e identifica conversión pendiente');
 await page.locator('#dashboardSearch').fill('');await page.locator('#dashboardCompleteUtm').click();assert.equal(await page.locator('#dashboardUtmMonth').inputValue(),'2026-11');await page.locator('#dashboardUtmValue').fill('72500');await page.locator('#dashboardUtmForm button[type="submit"]').click();assert(await page.locator('#dashboardConversionAlert').isHidden());assert(!(await page.locator('#dashboardMetricNote-fine').textContent()).includes('pendiente'));record('Guardar UTM completa la conversión y actualiza el panel');
 await page.locator('#dashboardSlaDays').fill('5');await page.locator('#dashboardSlaRate').fill('0.5');await page.locator('#dashboardHolidays').fill('2026-11-09');await page.locator('#dashboardSlaForm button[type="submit"]').click();assert((await page.locator('#dashboardSlaStatus').textContent()).includes('guardada'));await page.reload();assert.equal(await page.locator('#dashboardSlaDays').inputValue(),'5');assert.equal(await page.locator('#dashboardSlaRate').inputValue(),'0.5');assert.equal(await page.locator('#dashboardHolidays').inputValue(),'2026-11-09');assert((await page.locator('#dashboardUtmRows').textContent()).includes('72.500'));record('SLA, feriados y UTM persisten después de recargar');
 await page.locator('#dashboardHolidays').fill('2026-02-30');await page.locator('#dashboardSlaForm button[type="submit"]').click();assert((await page.locator('#dashboardSlaError').textContent()).includes('fechas reales'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('printcloud-centralizado-settings-v1')).holidays[0]),'2026-11-09');await page.locator('#dashboardSlaReset').click();record('Validación de feriados no guarda fechas inexistentes y restablecimiento funciona');
 await page.locator('#dashboardScenario').selectOption('empty');assert.equal(await metric('total'),0);assert.equal(await metric('stock'),664);assert(await page.locator('#dashboardTrackingEmpty').isVisible());assert(await page.locator('#dashboardOverdueEmpty').isVisible());assert(await page.locator('#dashboardExport').isDisabled());record('Escenario vacío conserva stock actual y mensajes sin resultados');
 await page.locator('#dashboardScenario').selectOption('sample');await page.locator('#dashboardRefresh').click();assert.equal(await page.locator('#dashboardOverview').getAttribute('aria-busy'),'true');await page.waitForFunction(()=>document.querySelector('#dashboardOverview').getAttribute('aria-busy')==='false');assert((await page.locator('.toast').last().textContent()).includes('Centralizado'));record('Actualización, loader y notificación del escenario');
 while(await page.locator('.toast .alert-dismiss').count())await page.locator('.toast .alert-dismiss').last().click();
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>window.PCTheme.set(theme),theme);
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:1050});await page.mouse.move(0,0);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow a ${width}/${theme}`);
   if([390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,`centralizado-${width}-${theme}.png`),fullPage:true});}
  }
  record(`Layout sin overflow de página a 320/390/768/1024/1440px en tema ${theme}`);
 }
 await page.setViewportSize({width:1440,height:1050});await page.locator('#sidebarToggle').click();await page.waitForTimeout(300);assert.equal(Math.round(await page.locator('#sidebar').evaluate(node=>node.getBoundingClientRect().width)),76);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('#sidebarToggle').click();record('Menú compacto compatible');
 await page.emulateMedia({reducedMotion:'reduce'});const details=page.locator('#dashboardSlaPanel');await details.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await details.evaluate(node=>node.open),false);await page.keyboard.press('Enter');assert.equal(await details.evaluate(node=>node.open),true);record('Paneles configurables con teclado y movimiento reducido');
 assert.deepEqual(errors,[]);record('Sin excepciones JavaScript');
 console.log(JSON.stringify({environment:'Chrome local; file://; recursos remotos bloqueados',results,errors},null,2));
}finally{fs.writeFileSync(path.join(root,'docs/QA-CENTRALIZADO.json'),JSON.stringify({results,errors},null,2)+'\n');await browser.close();}
