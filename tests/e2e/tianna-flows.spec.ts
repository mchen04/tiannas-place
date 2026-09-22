import {test, expect} from './fixtures';
import type {Locator} from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';
import {open, seed, complete, todayIn} from './helpers';
import {addDays} from '../../lib/domain';

// Same journeys run against the unmodified baseline and the revamp. Account routes
// use the real validator/domain with synthetic data; the DB journey is separate.
test('Tianna acceptance journeys and measured taps', async ({page}, info) => {
 test.setTimeout(180000);
 const phase = process.env.TIANNA_PHASE ?? 'after';
 const out = `evidence/tiannas-place/${phase}/flows-${info.project.name}`;
 await mkdir(out, {recursive:true});
 const day = todayIn(); let initial = seed(3);
 initial = complete(initial, addDays(day, -1));
 const box = await open(page, initial, {go:false});
 await page.clock.install({time:new Date(`${day}T16:00:00-07:00`)});
 await page.goto('/'); await expect(page.locator('.home-view')).toBeVisible();
 const records: {flow:string; taps:number; fields:number; steps:string[]}[]=[];
 let record = {flow:'', taps:0, fields:0, steps:[] as string[]};
 const begin = (flow:string) => {record={flow,taps:0,fields:0,steps:[]};records.push(record);};
 const tap = async (target:Locator, name:string) => {await target.click(); record.taps++;record.steps.push(name);};
 const button = (name:string|RegExp) => page.getByRole('button',{name,exact:typeof name==='string'});
 const fill = async (name:string,value:string) => {await page.getByLabel(name,{exact:true}).fill(value);record.fields++;record.steps.push(`Enter ${name}`);};
 const shot = async (name:string) => page.screenshot({path:`${out}/${name}.png`});
 const home = async () => {await button('Home').click();await expect(page.locator('.home-view')).toBeVisible();};
 const saved = async () => {await expect.poll(()=>box.rejected).toEqual([]);await page.waitForFunction(()=>JSON.parse(localStorage.getItem('flaccid75-v1')!).pending.length===0);};

 for(const habit of ['Walk','Workout','Abs','Floss']) {
  begin(`${habit}: complete from home`);
  await tap(page.getByRole('checkbox',{name:`${habit} complete`}), 'Complete');
  await expect(page.getByRole('checkbox',{name:`${habit} complete`})).toBeChecked();
  await saved();await page.reload();await expect(page.getByRole('checkbox',{name:`${habit} complete`})).toBeChecked();
  begin(`${habit}: undo completion from home`);
  await tap(page.getByRole('checkbox',{name:`${habit} complete`}), 'Uncheck');
  await expect(page.getByRole('checkbox',{name:`${habit} complete`})).not.toBeChecked();
 }
 begin('Walk: log minutes from home');
 await tap(button('Open walk'),'Open walk'); await fill('Walk minutes','12.5');await tap(button('Log walk'),'Log walk');
 await expect(page.getByRole('group',{name:'Walk entries'})).toContainText('12:30');await shot('walk-manual');
 begin('Walk: another timed walk from activity');
 await tap(button('Start'),'Start');await page.clock.fastForward(60000);
 await tap(button('Pause'),'Pause');await saved();await page.reload();await expect(button('Resume')).toBeVisible();
 await tap(button('Resume'),'Resume');await page.clock.fastForward(60000);await tap(button('Finish'),'Finish');
 await expect(page.getByRole('group',{name:'Walk entries'}).getByRole('button')).toHaveCount(2);await saved();await shot('walk-two-entries');
 begin('Walk: remove one entry');await tap(button('Remove walk 1'),'Remove first walk');await saved();await page.reload();await expect(page.getByRole('group',{name:'Walk entries'}).getByRole('button')).toHaveCount(1);await home();

 begin('Workout: edit plan and log from home');await tap(button('Open workout'),'Open workout');await tap(button('Edit plan'),'Edit plan');await fill('One move per line','Squats\nRows');await tap(button('Save plan'),'Save plan');
 await tap(page.getByRole('checkbox',{name:'Squats',exact:true}),'Check Squats');await tap(page.getByRole('checkbox',{name:'Rows',exact:true}),'Check Rows');await page.clock.fastForward(60000);await page.reload();await expect(page.getByRole('checkbox',{name:'Rows',exact:true})).toBeChecked();await tap(button('Finish'),'Finish');await expect(page.getByText('Workout logged')).toBeVisible();await saved();await shot('workout-logged');await home();

 begin('Abs: guided routine from home');await tap(button('Open abs'),'Open abs');await tap(button(/Two-minute burst/),'Start routine');await page.clock.fastForward(120000);await expect(page.getByText('Abs logged')).toBeVisible();await saved();await shot('abs-logged');await home();
 begin('Floss: complete from activity');await tap(button('Open floss'),'Open floss');await tap(page.getByRole('checkbox',{name:'Floss complete'}),'Complete');await expect(page.getByRole('checkbox',{name:'Floss complete'})).toBeChecked();await shot('floss-logged');await saved();await home();
 begin('Water: full container from home');await tap(button('Add a Stanley'),'Add full container');await saved();
 begin('Water: half container from home');await tap(button('Open water'),'Open water');await tap(button('Log half a Stanley'),'Log half');await saved();await shot('water-logged');
 begin('Water: phrase and confirm');await fill('Or say it','half my Stanley');await tap(button('Read it'),'Read it');await tap(button('Add 15 oz'),'Confirm pour');await saved();
 begin('Water: undo last pour');await tap(button('Remove last pour'),'Remove last pour');await saved();await home();

 begin('Food: manual meal from home');await tap(button('Log a meal'),'Log a meal');await tap(button('Enter numbers'),'Enter numbers');await fill('Description','Synthetic toast');await fill('Calories · kcal','420');await fill('Protein · g','18');await tap(button('Add to today'),'Add to today');await saved();
 begin('Food: edit manual meal from home');await tap(button('Open food'),'Open food');await tap(button('Correct meal 1'),'Edit meal');await fill('Description','Synthetic toast and beans');await fill('Calories · kcal','500');await tap(button('Save'),'Save');await saved();await page.reload();await expect(page.getByText('Synthetic toast and beans',{exact:true})).toBeVisible();await shot('meal-edited');
 await page.route('**/api/estimate', r=>r.fulfill({json:{items:[{name:'Synthetic oats',grams:100,calories:300,protein:10,source:'estimate'}],calories:300,protein:10}}));
 begin('Food: estimated meal from food page');await tap(button('Log a meal'),'Log a meal');await fill('What did you eat?','Synthetic oats');await tap(button('Look it up'),'Look it up');await expect(page.getByLabel('Portion · g')).toBeVisible();await fill('Portion · g','150');await tap(button('Add to today'),'Add to today');await saved();
 begin('Food: edit saved item');await tap(button('Correct meal 2'),'Edit meal');await fill('Item name','Synthetic oats with milk');await fill('Portion · g','200');await tap(button('Save'),'Save');await saved();await page.reload();await expect(page.getByText('Synthetic oats with milk · 200 g')).toBeVisible();await shot('meal-item-edited');
 begin('Food: remove meal');await tap(button('Remove meal 2'),'Remove meal');await saved();await home();
 begin('Rest: toggle from home');await tap(page.getByRole('checkbox',{name:'Rest day',exact:true}),'Rest day');await saved();await page.reload();await expect(page.getByRole('checkbox',{name:'Rest day',exact:true})).toBeChecked();await shot('rest-logged');await page.getByRole('checkbox',{name:'Rest day',exact:true}).click();
 begin('Meditate: default session from home');await tap(button('Open meditate'),'Open meditate');await tap(button('Start 5 minutes'),'Start');await page.clock.fastForward(301000);await expect(page.getByText('5 min logged today.')).toBeVisible();await saved();await shot('meditate-logged');await home();
 begin('Focus: default work block from home');await tap(button('Open focus'),'Open focus');await tap(button('Start focus'),'Start');await page.clock.fastForward(1501000);await expect(page.getByText(/25 min focused today/)).toBeVisible();await tap(button('End session'),'End session');await saved();await shot('focus-logged');await home();
 begin('Treats: create and redeem from home');await tap(button('Open treats'),'Open treats');await tap(button('Edit'),'Edit treats');await fill('Treat','Synthetic tea break');await fill('Points','10');await tap(button('Add treat'),'Add treat');await tap(button('Save'),'Save');await tap(button('Redeem Synthetic tea break'),'Redeem');await saved();await shot('treat-redeemed');
 begin('Treats: undo redemption');await tap(button('Remove redemption for Synthetic tea break'),'Remove redemption');await saved();await home();
 begin('History: open month from home');await tap(button('Open progress'),'Open progress');await tap(page.getByRole('tab',{name:'Month',exact:true}),'Month');await shot('history');
 await saved();await writeFile(`${out}/tap-counts.json`,JSON.stringify({phase,engine:info.project.name,method:'Control activations counted as taps; typed fields reported separately. Keyboard keystrokes, auto-completion waits, reloads, and returning home between independent journeys excluded. Entry point is stated per flow.',records},null,2));
});
