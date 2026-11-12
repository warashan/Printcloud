import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PRINTCLOUD_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'docs/qa-merma');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PRINTCLOUD_CHROME_PATH?{executablePath:process.env.PRINTCLOUD_CHROME_PATH}:{})});
const results=[],errors=[];
const check=name=>results.push({name,passed:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.goto(pathToFileURL(path.join(root,'merma-tarjetas.html')).href);
 assert.equal(await page.locator('#mermaRows tr').count(),6);
 assert.equal(await page.locator('#sidebar a[aria-current="page"]').getAttribute('href'),'merma-tarjetas.html');check('Datos iniciales y navegación activa');
 await page.locator('#mermaOfficeFilter').selectOption('Puerto Montt');await page.locator('#mermaSearch button[type=submit]').click();assert.equal(await page.locator('#mermaRows tr').count(),3);
 await page.locator('#mermaDateFilter').fill('2026-11-12');await page.locator('#mermaSearch button[type=submit]').click();assert(await page.locator('#mermaEmpty').isVisible());await page.locator('#mermaClear').click();assert.equal(await page.locator('#mermaRows tr').count(),6);check('Filtros combinados, estado vacío y limpiar');
 await page.locator('#mermaRows button').first().click();assert(await page.locator('#mermaEvidenceDialog').isVisible());assert((await page.locator('#mermaEvidence').textContent()).includes('ilustrativa'));assert(await page.locator('#mermaEvidence img').evaluate(img=>img.complete&&img.naturalWidth>0));await page.keyboard.press('Escape');check('Consulta de evidencia inicial identificada como ilustración');
 await page.locator('#mermaNew').click();await page.locator('#mermaForm button[type=submit]').click();assert((await page.locator('#mermaFormError').textContent()).includes('Revisa'));assert.equal(await page.locator('#mermaOffice').getAttribute('aria-invalid'),'true');check('Modal y validación de campos obligatorios');
 for(const value of ['abc','990100001']){await page.locator('#mermaFolio').fill(value);await page.locator('#mermaAddFolio').click();assert((await page.locator('#mermaFolioError').textContent()).length>0);}
 for(const value of ['990100002','990100003']){await page.locator('#mermaFolio').fill(value);await page.locator('#mermaAddFolio').click();}
 await page.locator('#mermaFolio').fill('990100002');await page.locator('#mermaAddFolio').click();assert((await page.locator('#mermaFolioError').textContent()).includes('ya'));await page.locator('#mermaFolio').fill('');
 await page.locator('#mermaFolios').selectOption('990100002');await page.locator('#mermaRemoveSelected').click();assert.equal(await page.locator('#mermaFolios option').count(),1);await page.locator('#mermaRemoveAll').click();assert.equal(await page.locator('#mermaFolios option').count(),0);check('Folios inválidos, duplicados y previamente declarados; quitar selección y todos');
 await page.locator('#mermaFiles').setInputFiles({name:'invalido.txt',mimeType:'text/plain',buffer:Buffer.from('demo')});assert((await page.locator('#mermaFilesError').textContent()).length>0);assert.equal(await page.locator('#mermaFileList li').count(),0);
 const image={name:'evidencia.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6SAAAAABJRU5ErkJggg==','base64')};
 await page.locator('#mermaFiles').setInputFiles(image);assert.equal(await page.locator('#mermaFileList li').count(),1);await page.locator('#mermaFileList button').click();assert.equal(await page.locator('#mermaFileList li').count(),0);await page.locator('#mermaFiles').setInputFiles(image);check('Validación de adjuntos, previsualización y quitar archivo');
 await page.locator('#mermaOffice').selectOption('Puerto Montt');await page.locator('#mermaReason').fill('Prueba de impresión con desalineación.');await page.locator('#mermaConfirm').check();await page.locator('#mermaFolio').fill('990100002');await page.locator('#mermaAddFolio').click();
 await page.evaluate(()=>{scrollTo({top:0,behavior:"instant"});document.querySelector('#mermaDialog').scrollTop=0;});await page.screenshot({path:path.join(output,'modal-desktop.png')});
 await page.locator('#mermaForm button[type=submit]').click();assert(await page.locator('#mermaDialog').isHidden());assert((await page.locator('#mermaRows tr').first().textContent()).includes('990100002'));assert((await page.locator('#mermaResults').textContent()).includes('7 lotes'));assert(await page.locator('#mermaNext').isEnabled());
 while(await page.locator('.toast .alert-dismiss').count())await page.locator('.toast .alert-dismiss').last().click();
 await page.locator('#mermaRows button').first().click();assert(await page.locator('#mermaEvidence img').evaluate(img=>img.complete&&img.naturalWidth>0));await page.keyboard.press('Escape');await page.locator('#mermaNext').click();assert.equal(await page.locator('#mermaRows tr').count(),1);await page.locator('#mermaPrev').click();check('Declarar crea lote, conserva evidencia y pagina');
 await page.locator('#mermaNew').click();await page.locator('#mermaFolio').fill('990100002');await page.locator('#mermaAddFolio').click();assert((await page.locator('#mermaFolioError').textContent()).includes('declarado'));await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'mermaNew');check('Declaración evita reutilizar folios y restaura foco');
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>window.PCTheme.set(theme),theme);
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});await page.mouse.move(0,0);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow ${width}/${theme}`);
   if([390,1440].includes(width)){await page.evaluate(()=>{document.activeElement.blur();scrollTo({top:0,behavior:"instant"});});await page.waitForTimeout(150);await page.screenshot({path:path.join(output,`merma-${width}-${theme}.png`),fullPage:true});}
   await page.locator('#mermaNew').click();assert.equal(await page.locator('#mermaDialog').evaluate(e=>e.scrollWidth>e.clientWidth),false);await page.locator('#mermaForm button[type=submit]').scrollIntoViewIfNeeded();assert(await page.locator('#mermaForm button[type=submit]').isVisible());await page.keyboard.press('Escape');
  }
  check(`Página y modal sin desbordamiento, cinco tamaños, tema ${theme}`);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});await page.locator('.merma-page .surface').first().hover();assert.equal(await page.locator('.merma-page .surface').first().evaluate(e=>getComputedStyle(e).transform),'none');check('Respeta movimiento reducido');
 await page.reload();assert.equal(await page.locator('#mermaRows tr').count(),6);assert.equal(errors.length,0,errors.join('\n'));check('Recargar restablece la demostración; sin errores JavaScript');
 const report={date:new Date().toISOString(),checks:results,errors};fs.writeFileSync(path.join(root,'docs/QA-MERMA.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
