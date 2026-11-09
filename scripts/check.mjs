import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { validate } from './validate.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.resolve(process.argv[2]||path.join(root,'data/course.json')),'utf8').replace(/^\uFEFF/,''));
const html=fs.readFileSync(path.resolve(process.argv[3]||path.join(root,'index.html')),'utf8');
validate(data);
const embedded=html.match(/<script id="course-data" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(embedded,'Embedded course must exist');
assert.deepEqual(JSON.parse(embedded[1]),data,'HTML must match current course data');
assert.ok(!html.includes('__COURSE_JSON__'),'No unresolved course placeholder');
const code=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
new vm.Script(code);

// A deliberately small DOM substitute checks application state and generated markup.
// It does not measure layout or emulate a real browser's focus/accessibility behavior.
function harness(initial={},blocked=false){
  const entries=new Map(Object.entries(initial)), elements=new Map(),listeners={};
  function element(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',dataset:{},disabled:false,classList:{toggle(){}},setAttribute(){},removeAttribute(){},focus(){},click(){}});return elements.get(id);}
  element('course-data').textContent=embedded[1];
  const document={getElementById:element,querySelectorAll:()=>Array.from({length:10},()=>element(Math.random())),querySelector:()=>element('selected'),addEventListener:(event,fn)=>listeners[event]=fn,createElement:()=>element(Math.random())};
  const localStorage={getItem:k=>{if(blocked)throw Error('denied');return entries.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('denied');entries.set(k,v);}};
  const context=vm.createContext({document,localStorage,window:{scrollTo(){}},confirm:()=>true,console,Blob,URL,setTimeout});
  vm.runInContext(code,context);
  return {run:s=>vm.runInContext(s,context),element,entries,listeners};
}
const h=harness();
assert.match(h.element('app').innerHTML,/一张地图/);
for(const m of data.modules){h.run(`currentModule=${JSON.stringify(m.id)};go('learn')`);assert.ok(h.element('app').innerHTML.includes(m.title));}
for(const q of data.questions){
  for(const answer of q.answers){assert.equal(h.run(`grade(Q.get(${JSON.stringify(q.id)}),${JSON.stringify(answer)})`),true);assert.equal(h.run(`grade(Q.get(${JSON.stringify(q.id)}),${JSON.stringify('  '+answer.toUpperCase().replaceAll(' ','   ')+'  ')})`),true);}
  assert.equal(h.run(`grade(Q.get(${JSON.stringify(q.id)}),'this cannot be an accepted answer 123')`),false);
}
// Empty submissions and repeated clicks cannot increment totals.
const first=data.questions[0],firstId=JSON.stringify(first.id);
h.run(`start([${firstId}]);submit()`);
assert.equal(h.run('totals().total'),0);
assert.match(h.element('answer-error').textContent,/先选择或输入/);
h.run(`quiz.selected=${JSON.stringify(first.answers[0])};submit();submit()`);
assert.equal(h.run('totals().total'),1);
assert.equal(h.run('totals().correct'),1);
h.run('next();next()');
assert.equal(h.run('state.history.length'),1);
// Wrong answers enter the notebook; successful review removes them, preserving stats.
h.run(`start([${firstId}]);quiz.selected='wrong';submit();next()`);
assert.equal(h.run(`Boolean(state.wrong[${firstId}])`),true);
h.run(`start([${firstId}],true);quiz.selected=${JSON.stringify(first.answers[0])};submit();next()`);
assert.equal(h.run(`Boolean(state.wrong[${firstId}])`),false);
assert.equal(h.run('totals().total'),3);
assert.equal(h.run('totals().correct'),2);
// Text entry grading uses the actual input; allow accepted alternative answers.
for(const type of ['fill','repair']){
  const q=data.questions.find(q=>q.type===type);if(!q)continue;
  h.run(`start([${JSON.stringify(q.id)}])`);
  h.element('answer').value=q.answers.at(-1).replace(/[.]$/,'');
  h.run('submit()');assert.equal(h.run('quiz.results[0].ok'),true);
}
// Topic/difficulty filtering and lack of eligible items.
h.element('topic').value=data.modules[0].id;
h.element('level').value='3';h.element('count').value='10';
const expected=data.questions.filter(q=>q.module===data.modules[0].id&&q.level===3).length;
assert.equal(h.run('pool().length'),expected);
h.run('availability()');assert.ok(h.element('available').textContent.includes(`符合条件 ${expected} 道`));
h.element('topic').value='nonexistent';h.run('availability()');assert.equal(h.element('selected').disabled,true);
// Switching tabs must preserve typed work and the active quiz.
const fill=data.questions.find(q=>q.type==='fill');
if(fill){h.run(`start([${JSON.stringify(fill.id)}]);quiz.selected='draft';go('home');go('practice')`);assert.match(h.element('app').innerHTML,/value="draft"/);}
// A new instance restores persisted records; invalid storage cannot crash startup.
const restored=harness(Object.fromEntries(h.entries));
assert.equal(restored.run('totals().total'),h.run('totals().total'));
const denied=harness({},true);assert.equal(denied.run('storageOK'),false);assert.match(denied.element('app').innerHTML,/无法读取或保存/);
const corrupt=harness({'grammar-lab:v1':'{broken JSON'});assert.equal(corrupt.run('totals().total'),0);
const stale=harness({'grammar-lab:v1':JSON.stringify({version:data.version,wrong:{'missing-id':{answer:'x'}},stats:{},history:[]})});assert.equal(stale.run('Object.keys(state.wrong).length'),0);
assert.equal(h.run(`normalize('  Hello,   world!  ','repair')`),'hello, world');
assert.notEqual(h.run(`normalize('hello world','repair')`),h.run(`normalize('hello, world','repair')`));
const damaged=structuredClone(data);damaged.questions[0].module='missing-module';assert.throws(()=>validate(damaged));
// Complete an entire mixed-type quiz, checking progression and the final aggregate.
const full=harness();
full.run('start(COURSE.questions.map(q=>q.id))');
for(let i=0;i<data.questions.length;i++){
  const id=full.run('quiz.items[quiz.index]'),q=data.questions.find(q=>q.id===id);
  if(q.type==='choice')full.run(`quiz.selected=${JSON.stringify(q.answers[0])}`);
  else full.element('answer').value=q.answers[0];
  full.run('submit();next()');
}
assert.equal(full.run('quiz.finished'),true);
assert.equal(full.run('totals().correct'),data.questions.length);
assert.equal(full.run('state.history.length'),1);
assert.ok(full.element('app').innerHTML.includes('100%'));
assert.equal(full.run('esc("<img src=x onerror=alert(1)>")'),'&lt;img src=x onerror=alert(1)&gt;');
// Validate essential skill metadata without a Python runtime.
const skill=fs.readFileSync(path.join(root,'SKILL.md'),'utf8');
const front=skill.match(/^---\n([\s\S]*?)\n---/);assert.ok(front);
const name=front[1].match(/^name: (.+)$/m)?.[1],description=front[1].match(/^description: (.+)$/m)?.[1];
assert.match(name,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.ok(name.length<64);assert.ok(description?.length&&description.length<=1024&&!/[<>]/.test(description));
assert.ok(!/\[TODO:/.test(skill));
for(const link of skill.matchAll(/\]\(([^):]+\/[^)]+)\)/g))assert.ok(fs.existsSync(path.join(root,link[1])),`Missing skill resource ${link[1]}`);
console.log(`PASS: ${data.modules.length} lessons; ${data.questions.length} questions; accepted variants; grading; empty/repeat submissions; notebook lifecycle; filters; tab retention; persisted/corrupt/blocked storage; skill metadata/resources.`);
console.log('Verification boundary: VM state tests and HTML checks only; no real-browser layout or interaction test.');
