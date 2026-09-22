import {test,expect} from './fixtures';
import {open,seed} from './helpers';
import {mkdir,writeFile} from 'node:fs/promises';

test('Tianna small screens, enlarged text, targets and reduced motion',async({page},info)=>{
 test.setTimeout(180000);
 const out=`evidence/tiannas-place/after/accessibility-${info.project.name}`;
 await mkdir(out,{recursive:true});
 await open(page,seed());
 const results=[];
 for(const mode of [{name:'320',width:320,height:568,scale:100},{name:'375',width:375,height:667,scale:100},{name:'200-percent',width:320,height:568,scale:200}]){
  await page.setViewportSize({width:mode.width,height:mode.height});
  await page.evaluate(scale=>document.documentElement.style.fontSize=`${scale}%`,mode.scale);
  for(const route of ['','walk','workout','abs','floss','water','food','rest','meditate','focus','rewards','progress','you','rules']){
   await page.evaluate(hash=>{location.hash=hash;},route);await page.waitForTimeout(120);
   const result=await page.evaluate(()=>{
    const problems:string[]=[];
    for(const el of document.querySelectorAll<HTMLElement>('body *')){
     if(el.closest('svg,dialog:not([open]),.sr-only')||el.tagName==='SCRIPT'||el.tagName==='STYLE')continue;
     const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
     if(!rect.width||!rect.height||style.visibility==='hidden'||style.display==='none')continue;
     const name=`${el.tagName}.${typeof el.className==='string'?el.className:''}`;
     if(rect.left < -1||rect.right>innerWidth+1)problems.push(`outside viewport: ${name}`);
     if(!['INPUT','TEXTAREA','SELECT'].includes(el.tagName)&&el.scrollWidth>el.clientWidth+2&&/hidden|clip|auto|scroll/.test(style.overflowX))problems.push(`horizontal overflow: ${name}`);
     if(!['INPUT','TEXTAREA'].includes(el.tagName)&&el.scrollHeight>el.clientHeight+2&&/hidden|clip/.test(style.overflowY))problems.push(`clipped height: ${name}`);
     if(el.matches('button,input,select,textarea,summary')&&!el.matches(':disabled')){
      const target=el.matches('input[type=checkbox]')?el.closest('label')!:el;
      const box=target.getBoundingClientRect();
      const minimum=el.closest('.calendar-grid,.bars')?24:44;
      if(box.width<minimum-.5||box.height<minimum-.5)problems.push(`small target ${Math.round(box.width)}×${Math.round(box.height)}: ${name}`);
      if(el.matches('input:not([type=checkbox]),textarea,select')&&parseFloat(style.fontSize)<16)problems.push(`small input text: ${name}`);
     }
    }
    const scroller=document.querySelector('.page')!;
    return {problems:[...new Set(problems)],pageHeight:scroller.scrollHeight,viewportHeight:scroller.clientHeight,documentWidth:document.documentElement.scrollWidth,timerFont:document.querySelector('.dial-time')?parseFloat(getComputedStyle(document.querySelector('.dial-time')!).fontSize):null};
   });
   results.push({mode:mode.name,route:route||'home',...result});
   await page.screenshot({path:`${out}/${mode.name}-${route||'home'}.png`});
  }
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>{location.hash='walk';});await page.getByRole('button',{name:'Start',exact:true}).click();
 const animated=await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).animationName!=='none').length);
 await writeFile(`${out}/layout.json`,JSON.stringify({results,reducedMotionActiveAnimations:animated,notes:'Desktop engines, emulated mobile viewports. 200% root font size exercises relative type tokens; not physical iOS Dynamic Type. Calendar and weekly chart controls use WCAG 24px minimum at narrow widths.'},null,2));
 expect(animated).toBe(0);
 for(const r of results.filter(r=>r.timerFont!==null))expect(r.timerFont).toBe(r.mode==='200-percent'?64:32);
 expect(results.filter(r=>r.problems.length)).toEqual([]);
});

test('Tianna keyboard, sheets, short viewport and safe area padding',async({page},info)=>{
 const out=`evidence/tiannas-place/after/accessibility-${info.project.name}`;await mkdir(out,{recursive:true});
 await open(page,seed());
 await page.getByRole('button',{name:'Open workout',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Workout',exact:true})).toBeFocused();
 const edit=page.getByRole('button',{name:'Edit plan'});await edit.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await page.getByLabel('One move per line').focus();await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(edit).toBeFocused();
 await page.getByRole('button',{name:'Home',exact:true}).click();await expect(page.locator('.topbar h1')).toBeFocused();
 await page.getByRole('button',{name:'Log a meal',exact:true}).click();
 await page.setViewportSize({width:390,height:350});
 await page.getByRole('button',{name:'Enter numbers'}).click();await page.getByLabel('Calories · kcal',{exact:true}).fill('320');await page.getByLabel('Protein · g',{exact:true}).fill('12');
 const save=page.getByRole('button',{name:'Add to today',exact:true});await save.focus();await page.keyboard.press(info.project.name==='webkit'?'Alt+Tab':'Tab');await page.keyboard.press(info.project.name==='webkit'?'Alt+Shift+Tab':'Shift+Tab');await expect(save).toBeFocused();
 const focus=await save.evaluate(el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:innerHeight,outline:getComputedStyle(el).outlineStyle};});
 expect(focus.top).toBeGreaterThanOrEqual(0);expect(focus.bottom).toBeLessThanOrEqual(focus.height);expect(focus.outline).not.toBe('none');
 await page.screenshot({path:`${out}/keyboard-short-viewport.png`});await page.keyboard.press('Enter');await expect(dialog).not.toBeVisible();
 await page.setViewportSize({width:390,height:844});
 // Substitute nonzero CSS env insets in the delivered stylesheet. This tests
 // padding arithmetic, not hardware detection or a physical software keyboard.
 await page.evaluate(()=>{for(const style of document.querySelectorAll('style'))style.textContent=style.textContent!.replaceAll('env(safe-area-inset-top)','47px').replaceAll('env(safe-area-inset-bottom)','34px').replaceAll('env(safe-area-inset-left)','20px').replaceAll('env(safe-area-inset-right)','20px');});
 const safe=await page.evaluate(()=>({top:getComputedStyle(document.querySelector('.app-shell')!).paddingTop,bottom:getComputedStyle(document.querySelector('.page')!).paddingBottom,left:getComputedStyle(document.querySelector('.page')!).paddingLeft}));
 expect(parseFloat(safe.top)).toBeGreaterThanOrEqual(47);expect(parseFloat(safe.bottom)).toBeGreaterThanOrEqual(34);expect(parseFloat(safe.left)).toBeGreaterThanOrEqual(20);
 await page.screenshot({path:`${out}/safe-area-insets.png`});await writeFile(`${out}/keyboard-safe-area.json`,JSON.stringify({focus,safe,physicalDevice:false},null,2));
});

test('Tianna sheets reflow with enlarged text',async({page},info)=>{
 const out=`evidence/tiannas-place/after/accessibility-${info.project.name}`;await mkdir(out,{recursive:true});
 await page.setViewportSize({width:320,height:568});await open(page,seed(),{hash:'you'});
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 const results=[];
 for(const label of ['Daily targets','Your details','Weigh in','Workout plan','Water containers','Treats','How targets are set','Lock this device']){
  await page.getByRole('button',{name:label,exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  const fit=await dialog.evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,children:[...el.querySelectorAll('*')].filter(e=>!e.closest('svg')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth+1);}).map(e=>e.tagName+'.'+e.className)}));
  results.push({sheet:label,...fit});await page.screenshot({path:`${out}/200-percent-sheet-${label.toLowerCase().replaceAll(' ','-')}.png`});await page.keyboard.press('Escape');
 }
 await writeFile(`${out}/sheets.json`,JSON.stringify(results,null,2));expect(results.filter(r=>r.scrollWidth>r.width+1||r.children.length)).toEqual([]);
});
