// Synthetic data only. External requests, including production Supabase, are blocked.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const header=html.slice(html.indexOf('<section class="top-panel">'),html.indexOf('<div class="top-switch-row">'));
const section=html.slice(html.indexOf('<section id="statisticsNotebook"'),html.indexOf('<section id="clientsNotebook"'));
async function run(){
 const browser=await chromium.launch({headless:true,...(process.env.SATIS_CHROMIUM?{executablePath:process.env.SATIS_CHROMIUM}:{})});
 try{
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>{
  const url=new URL(route.request().url()),name=url.pathname.slice(1);
  if(url.origin!=='http://satis.test')return route.abort();
  if(!name)return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="pl"><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"></head><body><main class="app-shell">${header}${section}</main><script src="statistics.js"></script><script>
  let owner=false,ready=true,reads=0;
  const fixture={devices:Array.from({length:72},(_,i)=>({id:'d-'+i,model:i%2?'Aparat testowy dłuższa nazwa modelu':'Model drugi',manufacturer:'Producent testowy',location:i%2?'P63':'P50',type:i%3?'SPRZEDANY':'NA STANIE',validStockIdentity:true,accessory:i%9===0,receivedDate:'2025-12-15',saleDate:'2026-'+String(i%10+1).padStart(2,'0')+'-02'})),
   services:Array.from({length:36},(_,i)=>({id:'r-'+i,location:i%2?'P63':'P50',category:i%2?'NAPRAWA GWARANCYJNA':'NAPRAWA POGWARANCYJNA',receivedDate:'2026-'+String(i%10+1).padStart(2,'0')+'-03',order:i%3===0,closed:i%2===0,completedDate:'2026-11-04'}))};
  const host=document.querySelector('#statisticsContent'),module=SatisStatistics.create({host,document,allowed:()=>owner,ready:()=>ready,today:()=> '2026-11-18',data:()=>{reads++;return fixture;}});
  const shortcut=document.querySelector('[data-notebook="statistics"]');shortcut.addEventListener('click',()=>{if(!owner)return;document.querySelector('#statisticsNotebook').hidden=false;shortcut.classList.add('active');shortcut.setAttribute('aria-pressed','true');module.render();});
  function setOwner(value){owner=value;shortcut.hidden=!value;if(!value)module.clear();}
  document.querySelector('#appTitle').textContent='Statystyki';module.render();
  </script></body></html>`});
  if(!['statistics.js','styles.css','satis-monogram.png','InterVariable.woff2','InterVariable-Italic.woff2'].includes(name))return route.abort();
  return route.fulfill({body:fs.readFileSync(path.join(root,name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':'font/woff2'});
 });
 await page.goto('http://satis.test');
 assert.equal(await page.evaluate(()=>reads),0);assert.equal(await page.locator('[data-notebook="statistics"]').isVisible(),false);
 await page.evaluate(()=>{setOwner(true);ready=false;});await page.getByRole('button',{name:'Statystyki',exact:true}).click();
 assert.match(await page.locator('#statisticsContent').textContent(),/Trwa pobieranie/);assert.equal(await page.evaluate(()=>reads),0);
 await page.evaluate(()=>{ready=true;module.render();});
 assert.equal(await page.locator('.statistics-chart').count(),2);assert.equal(await page.locator('.statistics-chart li').count(),24);
 const initial=await page.locator('.statistics-domains .statistics-metrics dd').allTextContents();assert.ok(Number(initial[0])>0);
 await page.getByRole('button',{name:'P63',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'P63',exact:true}).getAttribute('aria-pressed'),'true');
 const filtered=await page.locator('.statistics-domains .statistics-metrics dd').allTextContents();assert.ok(Number(filtered[0])<Number(initial[0]));
 await page.getByLabel('Rok statystyk').selectOption('2025');assert.equal(await page.locator('.statistics-domains .statistics-metrics dd').first().textContent(),'0');
 await page.getByRole('button',{name:'Lata',exact:true}).click();assert.equal(await page.getByLabel('Rok statystyk').count(),0);
 assert.equal(await page.locator('.statistics-chart li').count(),4);
 await page.getByRole('button',{name:'Miesiące',exact:true}).click();await page.getByLabel('Rok statystyk').selectOption('2026');
 await page.getByRole('button',{name:'Wszystkie',exact:true}).click();
 await page.locator('.statistics-details > summary').first().click();assert.equal(await page.locator('.statistics-details table tbody tr').count(),12);
 await page.locator('.statistics-details > summary').first().click();
 for(const viewport of [{width:1366,height:768},{width:1920,height:1080},{width:390,height:844}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'page must not scroll sideways');
  const bars=await page.locator('.statistics-bar').evaluateAll(nodes=>nodes.map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,color:getComputedStyle(n).backgroundColor})));
  assert.ok(bars.some(n=>n.width>10&&n.height>=12&&n.color!=='rgba(0, 0, 0, 0)'), 'charts render colored bars');
  const metrics=await page.locator('.statistics-metrics dd').evaluateAll(nodes=>nodes.map(n=>({width:n.clientWidth,scroll:n.scrollWidth})));assert.ok(metrics.every(n=>n.scroll<=n.width));
  if(process.env.SATIS_QA_DIR)await page.screenshot({path:path.join(process.env.SATIS_QA_DIR,'statistics-'+viewport.width+'.png'),fullPage:true});
 }
 await page.evaluate(()=>setOwner(false));assert.equal(await page.locator('#statisticsContent').textContent(),'');
 const readCount=await page.evaluate(()=>reads);await page.evaluate(()=>module.render());assert.equal(await page.evaluate(()=>reads),readCount);
 assert.deepEqual(errors,[]);console.log('Statistics browser: loading, owner access, filters, dates and responsive charts OK.');
 }finally{await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
