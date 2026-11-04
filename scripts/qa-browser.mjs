/* Navegador real opcional: configurar PRINTCLOUD_PLAYWRIGHT_PATH y PRINTCLOUD_CHROME_PATH.
   No requiere instalar Playwright para abrir ni utilizar el prototipo. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PRINTCLOUD_PLAYWRIGHT_PATH || 'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'docs','qa-v2.2');fs.mkdirSync(output,{recursive:true});
const results=[];const errors=[];
const browser=await chromium.launch({headless:true,...(process.env.PRINTCLOUD_CHROME_PATH?{executablePath:process.env.PRINTCLOUD_CHROME_PATH}:{})});
const context=await browser.newContext({acceptDownloads:true});
await context.route('https://**/*',route=>route.abort());
const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
const go=file=>page.goto(pathToFileURL(path.join(root,file)).href);
const wait=()=>page.waitForTimeout(260);
const record=(name,evidence={})=>results.push({name,status:'Aprobado',...evidence});
const geometry=()=>page.evaluate(()=>{
 const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};};
 return {form:rect('.login-form'),controls:rect('.login-carousel-controls'),slides:rect('.login-slides')};
});
try {
 for(const width of [360,768,1024,1440]){
  await page.setViewportSize({width,height:1000});
  for(const theme of ['light','dark','system']){
   await page.emulateMedia({colorScheme:'dark',reducedMotion:'no-preference'});
   await go('login.html');await page.evaluate(theme=>window.PCTheme.set(theme),theme);await wait();
   assert.equal(await page.locator('[data-login-slide]').count(),3);
   assert.equal(await page.locator('[data-login-slide]:not([hidden])').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}/${theme}: overflow`);
   if(width<1024){
    assert(await page.locator('.login-story').isHidden());
    assert(await page.locator('#loginDemo').isVisible());
    const snapshot=await page.locator('body').ariaSnapshot();
    assert(!snapshot.includes('Características de PrintCloud'));
    await page.screenshot({path:path.join(output,`login-${width}-${theme}.png`),fullPage:true});
    record(`Login a ${width}px en tema ${theme}`,{layout:'solo formulario; slider oculto'});
    continue;
   }
   const positions=await page.evaluate(()=>{const main=document.querySelector('.login-panel').getBoundingClientRect(),story=document.querySelector('.login-story').getBoundingClientRect();return {formTop:main.top,formLeft:main.left,storyTop:story.top,storyLeft:story.left};});
   if(width>=1024)assert(positions.storyLeft<positions.formLeft);else assert(positions.formTop<positions.storyTop);
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme==='system'?'dark':theme);
   const before=await geometry();
   for(const index of [1,2,0]){
    const button=page.locator(`[data-login-go="${index}"]`);await button.focus();await page.keyboard.press('Enter');await wait();
    assert.equal(await button.getAttribute('aria-pressed'),'true');assert(await button.evaluate(element=>element===document.activeElement));
    assert.equal((await page.locator('#loginSlideCount').textContent()).trim(),`${index+1} de 3`);
    assert.equal(await page.locator('[data-login-slide][hidden][inert][aria-hidden="true"]').count(),2);
    if(theme==='light' && [360,1440].includes(width) && index>0){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,`login-${width}-slide-${index+1}.png`),fullPage:true});}
    const after=await geometry();for(const key of ['form','controls','slides'])for(const field of ['y','height'])assert(Math.abs(before[key][field]-after[key][field])<1,`${width}/${theme}: salto de ${key}.${field}`);
   }
   const targets=await page.locator('.login-carousel-controls button').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return [r.width,r.height];}));
   assert(targets.every(([w,h])=>w>=44&&h>=44));
   const focusColor=await page.locator('[data-login-go="0"]').evaluate(element=>getComputedStyle(element).outlineColor);
   assert.equal(focusColor,'rgb(185, 224, 255)');
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,`login-${width}-${theme}.png`),fullPage:true});
   record(`Slider a ${width}px en tema ${theme}`,{layout:width>=1024?'dos columnas':'formulario primero',stable:true});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await go('login.html');
 await page.locator('#loginSlideNext').focus();await page.keyboard.press('Space');assert.equal((await page.locator('#loginSlideCount').textContent()).trim(),'2 de 3');
 await page.locator('#loginSlidePrev').focus();await page.keyboard.press('Enter');assert.equal((await page.locator('#loginSlideCount').textContent()).trim(),'1 de 3');
 const snapshot=await page.locator('#loginSlides').ariaSnapshot();assert(snapshot.includes('Gestión centralizada'));assert(!snapshot.includes('Captura y revisión'));assert(!snapshot.includes('Seguimiento del proceso'));
 await page.waitForTimeout(700);assert.equal((await page.locator('#loginSlideCount').textContent()).trim(),'1 de 3');record('Teclado nativo, árbol accesible y ausencia de rotación automática');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#loginSlideNext').click();await wait();assert.equal(await page.locator('[data-login-slide]:not([hidden])').evaluate(element=>getComputedStyle(element).animationName),'none');record('Movimiento reducido');
 await page.locator('[data-theme-choice="system"]').click();await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');record('Sistema sigue cambios de apariencia del SO');
 await page.locator('#loginUser').fill('demo');await page.locator('#loginPassword').fill('ejemplo');await page.keyboard.press('Enter');assert((await page.locator('#loginFeedback').textContent()).includes('no realiza autenticación real'));record('Login de demostración mediante Enter');
 await go('tablas.html');await page.locator('#selectAll').check();await page.locator('.table-select:visible').first().uncheck();assert.equal(await page.locator('#selectAll').evaluate(element=>element.indeterminate),true);await page.getByRole('button',{name:'Página 2',exact:true}).click();assert((await page.locator('#selectionCount').textContent()).includes('9 seleccionadas'));assert(await page.locator('#tablePagination [aria-current="page"]').evaluate(element=>element===document.activeElement));
 await page.locator('#tableSearch').fill('Vina');assert(await page.locator('#tableBody tr:visible').count()>0);await page.locator('.table-detail:visible').first().click();assert(await page.locator('#tableDetailDialog').isVisible());await page.keyboard.press('Escape');assert(await page.locator('#tableDetailDialog').isHidden());
 const downloadPromise=page.waitForEvent('download');await page.locator('#exportTable').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'PrintCloud-solicitudes-demo.csv');const downloadPath=await download.path();const csv=fs.readFileSync(downloadPath,'utf8');assert(csv.includes('Viña del Mar'));assert(!csv.includes('Quilpué'));record('Tabla: selección, foco al paginar, detalle nativo y descarga CSV filtrada',{csvRows:csv.split('\r\n').length-1});
 await page.setViewportSize({width:360,height:1000});await go('index.html');await page.locator('#notificationToggle').click();await page.locator('#menuToggle').click();await wait();assert(await page.locator('#notificationPanel').isHidden());assert(await page.locator('.main-wrapper').evaluate(element=>element.inert));await page.keyboard.press('Shift+Tab');assert(await page.locator('#sidebar').evaluate(element=>element.contains(document.activeElement)));await page.keyboard.press('Escape');assert.equal(await page.locator('.main-wrapper').evaluate(element=>element.inert),false);assert(await page.locator('#menuToggle').evaluate(element=>element===document.activeElement));record('Menú móvil: fondo inerte, foco contenido, notificaciones y Escape');
 for(const width of [360,768,1024,1440]){
  await page.setViewportSize({width,height:1000});
  for(const file of fs.readdirSync(root).filter(file=>file.endsWith('.html'))){await go(file);await wait();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${file} overflow a ${width}`);}
  record(`11 pantallas sin desbordamiento a ${width}px`);
 }
 // Equivalente geométrico de 200%/400% sobre 1440px; no automatiza el zoom nativo.
 for(const width of [720,360]){await page.setViewportSize({width,height:1000});await go('login.html');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 record('Reflow equivalente de 200%/400% (zoom nativo pendiente)');
 assert.deepEqual(errors,[]);record('Sin excepciones JavaScript en navegador');
 console.log(JSON.stringify({environment:'Chromium local, navegación file://, sin recursos remotos',results},null,2));
} finally {
 fs.writeFileSync(path.join(root,'docs','QA-BROWSER.json'),JSON.stringify({results,errors},null,2)+'\n');await browser.close();
}
