import {test,expect} from './fixtures';
import {open,seed,todayIn} from './helpers';
import {mkdir,writeFile} from 'node:fs/promises';

const modes=[
 {name:'320',width:320,height:568,scale:100},
 {name:'375',width:375,height:667,scale:100},
 {name:'390',width:390,height:844,scale:100},
 {name:'430',width:430,height:932,scale:100},
 {name:'desktop',width:1280,height:900,scale:100},
 {name:'200-percent',width:320,height:568,scale:200},
];

// Measure the rendered art, not only the SVG viewport: a correctly sized SVG can still crop or letterbox its contents.
function sceneGeometry(selector:string){
 const svg=document.querySelector<SVGSVGElement>(selector)!;
 const box=svg.getBoundingClientRect();
 const background=svg.querySelector('rect')!.getBoundingClientRect();
 const cloud=svg.querySelector<SVGGElement>('g[transform="translate(196 198) scale(0.85)"]');
 const cloudBox=cloud?.getBoundingClientRect();
 const container=svg.parentElement!;
 return {width:box.width,height:box.height,
  container:{width:container.clientWidth,scrollWidth:container.scrollWidth,height:container.clientHeight,scrollHeight:container.scrollHeight},
  cloud:cloudBox?{top:cloudBox.top-box.top,bottom:box.bottom-cloudBox.bottom,left:cloudBox.left-box.left,right:box.right-cloudBox.right}:null,
  gutters:{left:background.left-box.left,right:box.right-background.right,top:background.top-box.top,bottom:box.bottom-background.bottom},
  viewBox:{width:svg.viewBox.baseVal.width,height:svg.viewBox.baseVal.height}};
}

test('Tianna hills keep the whole cloud and cat stages fill without cropping at each phone width',async({page},info)=>{
 const out=`evidence/tiannas-place/review-polish/geometry-${info.project.name}`;await mkdir(out,{recursive:true});
 await open(page,seed());await page.emulateMedia({reducedMotion:'reduce'});
 const results=[];
 for(const mode of modes){
  await page.setViewportSize({width:mode.width,height:mode.height});
  await page.evaluate(scale=>document.documentElement.style.fontSize=`${scale}%`,mode.scale);
  for(const route of ['','walk','workout','abs','rest']){
   await page.evaluate(hash=>{location.hash=hash;},route);
   const selector=route?`.stage.${route} .scene`:'.hero .scene';
   await expect(page.locator(selector)).toBeVisible();
   const result=await page.evaluate(sceneGeometry,selector);results.push({mode:mode.name,route:route||'home',...result});
   expect(result.container.scrollWidth,`${mode.name}/${route}: card width`).toBeLessThanOrEqual(result.container.width+1);
   expect(result.container.scrollHeight,`${mode.name}/${route}: card copy height`).toBeLessThanOrEqual(result.container.height+1);
   if(result.cloud){
    for(const clearance of Object.values(result.cloud))expect(clearance,`${mode.name}/${route}: cloud clearance`).toBeGreaterThanOrEqual(-.5);
   }else{
    for(const gutter of Object.values(result.gutters))expect(Math.abs(gutter),`${mode.name}/${route}: unpainted or cropped edge`).toBeLessThan(.5);
    expect(Math.abs(result.width/result.height-result.viewBox.width/result.viewBox.height)).toBeLessThan(.01);
   }
   await page.screenshot({path:`${out}/${mode.name}-${route||'home'}.png`});
  }
 }
 // Negative controls reproduce the review defects without changing source or account data.
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.documentElement.style.fontSize='100%';location.hash='walk';});
 await expect(page.locator('.stage.walk .scene')).toBeVisible();
 await page.locator('.stage.walk .scene').evaluate(el=>el.setAttribute('style','height:200px;min-height:0;aspect-ratio:auto'));
 const clipped=await page.evaluate(sceneGeometry,'.stage.walk .scene');expect(clipped.cloud!.top).toBeLessThan(-1);
 await page.locator('.stage.walk .scene').evaluate(el=>el.removeAttribute('style'));
 await page.evaluate(()=>{location.hash='rest';});await expect(page.locator('.stage.rest .scene')).toBeVisible();
 await page.locator('.stage.rest .scene').evaluate(el=>el.setAttribute('style','height:150px;aspect-ratio:auto'));
 const letterboxed=await page.evaluate(sceneGeometry,'.stage.rest .scene');expect(letterboxed.gutters.left).toBeGreaterThan(5);
 await page.locator('.stage.rest .scene').evaluate(el=>el.removeAttribute('style'));
 await writeFile(`${out}/geometry.json`,JSON.stringify({results,negativeControls:{clipped,letterboxed},physicalDevice:false},null,2));
});

test('Tianna pressed row corners stay rounded and keyboard focus remains visible when rows wrap',async({page},info)=>{
 const out=`evidence/tiannas-place/review-polish/pressed-${info.project.name}`;await mkdir(out,{recursive:true});
 await open(page,seed());const results=[];
 for(const mode of modes.filter(m=>['390','320','200-percent'].includes(m.name))){
  await page.setViewportSize({width:mode.width,height:mode.height});await page.evaluate(scale=>document.documentElement.style.fontSize=`${scale}%`,mode.scale);
  for(const name of ['Open walk','Open water','Open food']){
   const button=page.getByRole('button',{name,exact:true});await button.scrollIntoViewIfNeeded();
   const box=(await button.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
   const pressed=await button.evaluate(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el),row=el.closest('.row')!;
    const corners=[[r.left+1,r.top+1],[r.right-1,r.top+1],[r.left+1,r.bottom-1],[r.right-1,r.bottom-1]];
    return {active:el.matches(':active'),background:s.backgroundColor,radius:parseFloat(s.borderTopLeftRadius),rowRadius:parseFloat(getComputedStyle(row).borderTopLeftRadius),squareHit:corners.some(([x,y])=>el.contains(document.elementFromPoint(x,y))),wraps:r.width>row.getBoundingClientRect().width-1};
   });
   expect(pressed.active).toBe(true);expect(pressed.background).not.toBe('rgba(0, 0, 0, 0)');expect(pressed.radius).toBeGreaterThanOrEqual(pressed.rowRadius);expect(pressed.squareHit).toBe(false);
   await page.screenshot({path:`${out}/${mode.name}-${name.replaceAll(' ','-').toLowerCase()}-pressed.png`});
   await page.mouse.move(0,0);await page.mouse.up();await expect(page.locator('.home-view')).toBeVisible();
   await page.keyboard.press(info.project.name==='webkit'?'Alt+Tab':'Tab');await button.focus();
   const focus=await button.evaluate(el=>{const s=getComputedStyle(el);return {visible:el.matches(':focus-visible'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth),offset:parseFloat(s.outlineOffset)};});
   expect(focus.visible).toBe(true);expect(focus.outline).toBe('solid');expect(focus.width).toBeGreaterThanOrEqual(2);expect(focus.offset+focus.width).toBeLessThanOrEqual(0);
   await page.screenshot({path:`${out}/${mode.name}-${name.replaceAll(' ','-').toLowerCase()}-focus.png`});
   results.push({mode:mode.name,name,pressed,focus});
  }
 }
 // The same corner probe rejects the former square press target.
 const button=page.getByRole('button',{name:'Open walk',exact:true});await button.scrollIntoViewIfNeeded();
 const squareHit=await button.evaluate(el=>{el.style.borderRadius='0';const r=el.getBoundingClientRect();const hit=el.contains(document.elementFromPoint(r.left+1,r.top+1));el.style.removeProperty('border-radius');return hit;});
 expect(squareHit).toBe(true);expect(results.some(r=>r.pressed.wraps)).toBe(true);
 await writeFile(`${out}/states.json`,JSON.stringify({results,negativeControlSquareHit:squareHit,physicalDevice:false},null,2));
});

test('Tianna visible greeting follows time and completion while the brand and date remain',async({page},info)=>{
 const out=`evidence/tiannas-place/review-polish/greeting-${info.project.name}`;await mkdir(out,{recursive:true});
 const today=todayIn();const morning=new Date(today+'T16:00:00Z');await page.clock.setFixedTime(morning);
 const date=new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(today+'T12:00:00Z'));
 await page.setViewportSize({width:320,height:568});await open(page,seed());await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 const results=[];
 for(const [hours,text] of [[0,'Good morning.'],[5,'Good afternoon.'],[10,'Good evening.']] as const){
  await page.clock.setFixedTime(new Date(morning.getTime()+hours*3600000));await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
  await expect(page.locator('.greeting')).toHaveText(text);await expect(page.locator('.greeting')).toBeVisible();
  await expect(page.locator('.topbar h1')).toHaveText('Tianna’s Place');await expect(page.locator('.date')).toContainText(date);
  const fit=await page.locator('.greeting').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,viewport:innerWidth,visibleText:el.textContent};});
  expect(fit.left).toBeGreaterThanOrEqual(0);expect(fit.right).toBeLessThanOrEqual(fit.viewport);results.push(fit);
  await page.screenshot({path:`${out}/${hours}-hours.png`});
 }
 await page.getByRole('checkbox',{name:'Walk complete',exact:true}).click();await expect(page.locator('.greeting')).toHaveText('Good going.');
 for(const habit of ['Workout','Abs','Floss'])await page.getByRole('checkbox',{name:`${habit} complete`,exact:true}).click();
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Add a Stanley',exact:true}).click();
 await expect(page.locator('.greeting')).toHaveText('Nearly there.');await page.reload();await expect(page.locator('.greeting')).toHaveText('Nearly there.');
 await page.getByRole('checkbox',{name:'Rest day',exact:true}).click();await expect(page.locator('.greeting')).toHaveText('Rest day.');
 await page.locator('.topbar').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/rest-day.png`});
 await writeFile(`${out}/greetings.json`,JSON.stringify({timeOfDay:results,completion:['Good going.','Nearly there.','Rest day.'],nearlyTherePersistsOnReload:true,physicalDevice:false},null,2));
});
