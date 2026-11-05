const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const attendance=require('../vacation-attendance.js');
const input={year:2026,month:11,employee:{id:'jw',name:'Osoba Testowa',attendanceSchedule:{1:['11:00','17:00'],3:['10:00','16:00'],4:['08:00','16:00']}},holiday:date=>({'2026-11-01':{name:'Wszystkich Świętych'},'2026-11-11':{name:'Narodowe Święto Niepodległości'}}[date]||null)};
test('November 2026 has 30 dated rows, correct Polish title and JW weekly hours',()=>{
 const m=attendance.build(input);assert.equal(m.title,'Lista obecności · Listopad 2026');assert.equal(m.rows.length,30);
 for(const [day,start,end]of [[2,'11:00','17:00'],[4,'10:00','16:00'],[5,'08:00','16:00'],[9,'11:00','17:00'],[30,'11:00','17:00']]){const row=m.rows[day-1];assert.equal(row.start,start);assert.equal(row.end,end);}
 assert.equal(m.rows[2].start,'');assert.equal(m.rows[2].note,'Wolne wg grafiku');
 assert.equal(m.rows[10].start,'');assert.equal(m.rows[10].shaded,true);assert.equal(m.rows[10].holiday,'Narodowe Święto Niepodległości');
 assert.equal(m.rows[0].shaded,true);assert.equal(m.rows[6].shaded,true);assert.equal(m.rows[1].shaded,false);
});
test('only approved absences suppress the schedule and do not expose request notes',()=>{
 const r={employeeId:'jw',dateFrom:'2026-11-02',dateTo:'2026-11-02',type:'WYPOCZYNKOWY',status:'ZATWIERDZONY',notes:'Private detail'};
 let m=attendance.build({...input,requests:[r]});assert.equal(m.rows[1].start,'');assert.equal(m.rows[1].note,'Urlop wypoczynkowy');assert.ok(!JSON.stringify(m).includes('Private detail'));
 for(const status of ['OCZEKUJE','ODRZUCONY'])assert.equal(attendance.build({...input,requests:[{...r,status}]}).rows[1].start,'11:00');
 assert.equal(attendance.build({...input,requests:[r],sick:()=>true}).rows[1].note,'L4 - chorobowe');
 assert.equal(attendance.build({...input,requests:[{...r,hours:2}]}).rows[1].note,'Nieobecność godzinowa');
 assert.equal(attendance.build({...input,requests:[{...r,type:'WCZEŚNIEJSZE WYJŚCIE'}]}).rows[1].start,'');
 assert.equal(attendance.build({...input,requests:[{...r,employeeId:'other'}]}).rows[1].start,'11:00');
});
test('other employees have blank hours, leap years work and invalid periods are rejected',()=>{
 assert.ok(attendance.build({...input,employee:{id:'other',name:'Inna Osoba'}}).rows.every(row=>!row.start&&!row.end));
 assert.equal(attendance.build({...input,year:2028,month:2}).rows.length,29);
 for(const change of [{year:2024},{year:2031},{month:0},{month:13},{employee:null}])assert.equal(attendance.build({...input,...change}),null);
});
test('uses the existing Polish holiday helper and prints only the attendance sheet in A4 without split rows',()=>{
 const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8'),html=fs.readFileSync('index.html','utf8');
 assert.match(app,/holiday: polishPublicHolidayOnDate/);assert.match(app,/vacationCanViewBalance\(employee\)/);
 assert.match(html,/id="vacationAttendance"/);assert.match(css,/@page vacationAttendance \{ size: A4 portrait; margin: 10mm; \}/);
 assert.match(css,/\.attendance-table tr \{ break-inside: avoid;/);assert.match(css,/\.attendance-day-off[^}]*background: #e8e8e8/s);
 assert.doesNotMatch(fs.readFileSync('vacation-attendance.js','utf8'),/localStorage|innerHTML|\.rpc\(/);
});
test('print sheet follows the selected employee, clears sensitive content and cleans up after printing',async()=>{
 class E{constructor(tag){this.tag=tag;this.children=[];this.events={};this.attributes={};this.value='';this.classList={add(){},remove(){}};}append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}replaceChildren(...nodes){this.children=[];this.append(...nodes);}setAttribute(k,v){this.attributes[k]=v;}addEventListener(k,fn){this.events[k]=fn;}remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}}
 const host=new E('details'),body=new E('body'),events={};let allowed=true,printed=0;
 const widget=attendance.create({document:{getElementById:()=>host,createElement:tag=>new E(tag),body},window:{addEventListener(k,fn){events[k]=fn;},removeEventListener(k){delete events[k];}},month:()=>11,context:()=>({...input,allowed,requests:[{employeeId:"jw",dateFrom:"2026-11-05",dateTo:"2026-11-05",type:"L4",status:"ZATWIERDZONY"}],sick:()=>true}),print:async()=>{printed++;},error:message=>assert.fail(message)});
 widget.render();assert.equal(host.hidden,false);
 const button=host.children[1].children[1];await button.events.click();assert.equal(printed,1);assert.equal(body.children.length,1);
 const page=body.children[0].children[0],table=page.children.find(n=>n.tag==='table');assert.equal(table.children[1].children.length,30);
 const sickRow=table.children[1].children[4];assert.equal(sickRow.children[5].textContent,"L4 - chorobowe");assert.equal(sickRow.children[2].textContent,"");assert.equal(sickRow.children[3].textContent,"");
 events.afterprint();assert.equal(body.children.length,0);
 allowed=false;widget.render();assert.equal(host.hidden,true);assert.equal(host.children[3].children.length,0);
 widget.clear();assert.equal(host.open,false);
});

for(const [name,end]of [['Osoba Testowa A','15:00'],['Osoba Testowa B','16:00']]){
 test(`${name}: weekday hours are automatic but holidays, weekends and approved leave remain blank`,()=>{
  const employee={id:'staff',name,attendanceSchedule:Object.fromEntries([1,2,3,4,5].map(day=>[day,['08:00',end]]))},model=attendance.build({...input,employee});
  assert.equal(model.scheduled,true);
  for(const row of model.rows){if(row.shaded){assert.equal(row.start,'');assert.equal(row.end,'');}else{assert.equal(row.start,'08:00',row.date);assert.equal(row.end,end,row.date);}}
  assert.equal(model.rows[10].note,'Święto');
  const leave={employeeId:'staff',dateFrom:'2026-11-02',dateTo:'2026-11-02',status:'ZATWIERDZONY',type:'WYPOCZYNKOWY'};
  const absent=attendance.build({...input,employee,requests:[leave]});assert.equal(absent.rows[1].start,'');assert.equal(absent.rows[1].note,'Urlop wypoczynkowy');
  assert.equal(attendance.build({...input,employee,requests:[{...leave,status:'OCZEKUJE'}]}).rows[1].end,end);
  assert.equal(attendance.build({...input,employee:{...employee,name:name.toLowerCase()}}).rows[1].end,end);
 });
}

test('printed attendance keeps a complete top border, stronger grid and taller signature rows without sticky headers',()=>{
 const css=fs.readFileSync('styles.css','utf8');
 assert.match(css,/\.attendance-table th \{[^}]*position: static;[^}]*top: auto;[^}]*z-index: auto;/);
 assert.match(css,/\.vacation-attendance-print \.attendance-table \{[^}]*border: 0\.35mm solid #333;/);
 assert.match(css,/\.vacation-attendance-print \.attendance-table :is\(th,td\) \{[^}]*border: 0\.3mm solid #444;[^}]*font-size: inherit;/);
 assert.match(css,/\.vacation-attendance-print \.attendance-table thead th \{ border-top: 0\.35mm solid #333;/);
 assert.match(css,/\.vacation-attendance-print \.attendance-table tr \{ height: 7\.2mm;/);
 const december=attendance.build({...input,month:12});assert.equal(december.rows.length,31);
 assert.ok((december.rows.length+1)*7.2+40<297-20,'31 rows plus the header leave space for title and footnotes inside A4 margins');
});

test('approved L4 covers its whole calendar period on attendance, including JW days off, and takes precedence over other leave',()=>{
 const sick={employeeId:'jw',dateFrom:'2026-11-05',dateTo:'2026-11-12',type:'L4',status:'ZATWIERDZONY',notes:'Private medical detail'};
 const ordinary={...sick,type:'WYPOCZYNKOWY',notes:''};
 for(const type of ['L4','INNY','WYPOCZYNKOWY']){
  const requests=[ordinary,{...sick,type,notes:'L4'}];
  const model=attendance.build({...input,requests,sick:r=>r.type==='L4'||r.notes==='L4'});
  for(const row of model.rows.slice(4,12)){
   assert.equal(row.note,'L4 - chorobowe',row.date);assert.equal(row.start,'');assert.equal(row.end,'');
  }
  assert.equal(model.rows[6].shaded,true);assert.equal(model.rows[10].shaded,true);
  assert.equal(model.rows[10].holiday,'Narodowe Święto Niepodległości');
  assert.equal(model.rows[3].start,'10:00');assert.equal(model.rows[15].start,'11:00');
  assert.ok(!JSON.stringify(model).includes('Private medical detail'));
 }
 for(const status of ['OCZEKUJE','ODRZUCONY']){
  const row=attendance.build({...input,requests:[{...sick,status}],sick:()=>true}).rows[4];
  assert.equal(row.note,'');assert.equal(row.start,'08:00');
 }
 for(const request of [{...sick,employeeId:'other'},{...sick,redacted:true}]){
  assert.ok(attendance.build({...input,requests:[request],sick:()=>true}).rows.every(r=>!r.note.includes('L4')));
 }
 const shared=attendance.build({...input,requests:[sick],sick:()=>false});
 assert.ok(shared.rows.every(r=>!r.note.includes('L4')&&!r.note.includes('chorobowe')));
});

test('approved attendance marker labels L4 for gabinet without requiring private notes or exposing it without authorization',()=>{
 const request={employeeId:'jw',dateFrom:'2026-11-05',dateTo:'2026-11-08',status:'ZATWIERDZONY',
  type:'ZAJĘTOŚĆ',redacted:true,attendanceSickLeave:true};
 const shared=attendance.build({...input,requests:[request],sick:r=>r.attendanceSickLeave===true});
 for(const row of shared.rows.slice(4,8)){assert.equal(row.note,'L4 - chorobowe');assert.equal(row.start,'');assert.equal(row.end,'');}
 assert.equal(shared.rows[6].shaded,true);
 assert.ok(attendance.build({...input,requests:[request],sick:()=>false}).rows.every(r=>!r.note.includes('L4')));
 for(const status of ['OCZEKUJE','ODRZUCONY'])assert.equal(attendance.build({...input,requests:[{...request,status}],sick:()=>true}).rows[4].start,'08:00');
});

test('public module never infers schedule from a name and validates privately supplied hours',()=>{
 const model=attendance.build({...input,employee:{id:'staff',name:'Osoba Testowa'}});
 assert.equal(model.scheduled,false);assert.ok(model.rows.every(row=>!row.start&&!row.end));
 assert.deepEqual(attendance.normalizeSchedule({1:['17:00','08:00'],2:['99:00','10:00'],3:['09:00','12:00']}),{3:['09:00','12:00']});
 const source=fs.readFileSync('vacation-attendance.js','utf8');
 assert.doesNotMatch(source,/jwSchedule|firstName===/i);
 assert.ok(!fs.readFileSync('app.js','utf8').includes('const sampleRecords'));
});
