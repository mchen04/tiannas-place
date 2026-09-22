// Real HTTP + PostgreSQL acceptance. Refuses remote databases and model keys.
// Each engine starts with the same synthetic legacy state in a temporary schema.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {chromium,webkit,expect} from '@playwright/test';
import {seed,todayIn} from '../tests/e2e/helpers.ts';
import {newDay} from '../lib/domain.ts';

const uri=new URL(process.env.DATABASE_URL);
assert.equal(uri.hostname,'127.0.0.1');assert.equal(uri.pathname,'/tianna_ui_local');assert.ok(!process.env.OPENROUTER_API_KEY);
const out='evidence/tiannas-place/after/real-db';await mkdir(out,{recursive:true});
const admin=new pg.Client({connectionString:uri.toString()});await admin.connect();
const schema='tianna_ui_'+randomUUID().replaceAll('-','');await admin.query(`CREATE SCHEMA ${schema}`);
uri.searchParams.set('options','-c search_path='+schema);
const db=new pg.Client({connectionString:uri.toString()});await db.connect();await db.query(await readFile('migrations/001_initial.sql','utf8'));
const base='http://localhost:3086';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3086'],{env:{...process.env,DATABASE_URL:uri.toString()},stdio:'ignore'});
const evidence=[];
try {
 for(let n=0;n<100;n++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const day=todayIn(),initial=seed(3),legacy=randomUUID(),itemMeal=randomUUID();
  // Older accounts may have aggregate walk sessions and nutrition-only meals.
  initial.days[day]={...newDay(initial.profile.targets),sessions:{walk:{seconds:600,done:true}},mealOrder:[legacy,itemMeal],meals:{[legacy]:{calories:300,protein:12},[itemMeal]:{description:'Synthetic oats',calories:400,protein:16,items:[{name:'Synthetic oats',grams:100,calories:400,protein:16,source:'estimate'}]}},checks:{walk:true}};
  const past=todayIn().slice(0,8)+'01';initial.weights[past]=65;
  await db.query('UPDATE flaccid75_state SET data=$1 WHERE id=1',[JSON.stringify(initial)]);await db.query('DELETE FROM flaccid75_operations');
  const browser=await engine.launch();
  try {
   const context=await browser.newContext({viewport:{width:375,height:667},isMobile:true,hasTouch:true,timezoneId:'America/Los_Angeles',serviceWorkers:'block'});
   const page=await context.newPage();const external=[];
   await context.route('**/*',r=>{if(new URL(r.request().url()).origin!==base){external.push(new URL(r.request().url()).origin);return r.abort();}return r.continue();});
   const b=n=>page.getByRole('button',{name:n,exact:true});
   const save=async()=>page.waitForFunction(()=>JSON.parse(localStorage.getItem('flaccid75-v1')).pending.length===0);
   const state=async()=>(await db.query('SELECT data FROM flaccid75_state WHERE id=1')).rows[0].data;
   await page.goto(base);await page.getByLabel('Passphrase').fill(process.env.APP_PASSPHRASE);await b('Open').click();await expect(page.locator('.home-view')).toBeVisible();
   await b('Open walk').click();await expect(page.getByRole('group',{name:'Walk entries'})).toContainText('10:00');
   await page.getByLabel('Walk minutes').fill('12');await b('Log walk').click();await save();
   await page.getByLabel('Walk minutes').fill('8');await page.waitForTimeout(650);await b('Log walk').click();await save();
   await page.reload();await expect(page.getByRole('group',{name:'Walk entries'}).getByRole('button')).toHaveCount(3);
   await b('Start').click();await page.waitForTimeout(1100);await b('Pause').click();await page.reload();await expect(b('Resume')).toBeVisible();await b('Resume').click();await b('Finish').click();await save();
   assert.equal(Object.keys((await state()).days[day].walkLog).length,4);
   await page.getByRole('checkbox',{name:'Walk complete'}).click();await save();await page.reload();await expect(page.getByRole('checkbox',{name:'Walk complete'})).not.toBeChecked();assert.equal(Object.keys((await state()).days[day].walkLog).length,4);
   await b('Remove walk 2').click();await save();assert.equal(Object.keys((await state()).days[day].walkLog).length,3);
   await page.screenshot({path:`${out}/${name}-walks.png`});
   await b('Home').click();await b('Open food').click();
   await b('Correct meal 1').click();await page.getByLabel('Description',{exact:true}).fill('Synthetic legacy meal, edited');await page.getByLabel('Calories · kcal',{exact:true}).fill('350');await b('Save').click();await expect(page.locator('.meal-edit')).toHaveCount(0);await save();
   await b('Correct meal 2').click();await page.getByLabel('Portion · g').fill('150');await b('Save').click();await expect(page.locator('.meal-edit')).toHaveCount(0);await save();
   await expect.poll(async()=>(await state()).days[day].meals[itemMeal].calories).toBe(600);assert.equal((await state()).days[day].meals[itemMeal].items[0].grams,150);
   await b('Log a meal').click();await b('Enter numbers').click();await page.getByLabel('Description',{exact:true}).fill('Synthetic local soup');await page.getByLabel('Calories · kcal',{exact:true}).fill('210');await page.getByLabel('Protein · g',{exact:true}).fill('15');await b('Add to today').click();await save();
   await page.reload();await expect(page.getByText('Synthetic legacy meal, edited',{exact:true})).toBeVisible();await expect(page.getByText('Synthetic oats · 150 g')).toBeVisible();await expect(page.getByText('Synthetic local soup',{exact:true})).toBeVisible();await page.screenshot({path:`${out}/${name}-meals.png`});
   await b('Remove meal 3').click();await save();
   await b('Home').click();
   for(const habit of ['Workout','Abs','Floss']){await page.getByRole('checkbox',{name:`${habit} complete`}).click();await save();}
   await b('Add a Stanley').click();await save();await page.getByRole('checkbox',{name:'Rest day',exact:true}).click();await save();
   const stored=await state();await page.reload();await expect(page.getByRole('checkbox',{name:'Floss complete'})).toBeChecked();await expect(page.getByRole('checkbox',{name:'Rest day',exact:true})).toBeChecked();
   assert.equal(stored.weights[past],65);assert.deepEqual(stored.profile,initial.profile);assert.equal(Object.keys(stored.days[day].meals).length,2);assert.ok(stored.days[day].water>887);assert.ok(stored.days[day].water<888);assert.equal(stored.days[day].checks.workout,true);assert.equal(stored.days[day].checks.abs,true);
   await b('Open progress').click();await expect(page.getByRole('heading',{name:'Progress',exact:true})).toBeVisible();await page.screenshot({path:`${out}/${name}-history.png`});
   assert.deepEqual(external,[]);
   const storedOperationRows=Number((await db.query('SELECT count(*) FROM flaccid75_operations')).rows[0].count);
   evidence.push({engine:name,realHTTP:true,realPostgres:true,legacyWalkConverted:true,walksPreservedAfterToggle:true,remainingWalks:3,legacyMealEdited:true,itemPortionPersisted:150,mealRemovePersisted:true,weightsAndProfilePreserved:true,completionAndRestReloaded:true,storedOperationRows,externalRequests:external,physicalDevice:false});
  } catch(error) {await writeFile(`${out}/${name}-failure.json`,JSON.stringify((await db.query('SELECT data FROM flaccid75_state WHERE id=1')).rows[0].data,null,2));throw error;} finally {await browser.close();}
 }
 await writeFile(`${out}/results.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
} finally {
 server.kill('SIGTERM');await db.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();
}
