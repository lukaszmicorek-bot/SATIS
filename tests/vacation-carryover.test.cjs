const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source=fs.readFileSync('app.js','utf8');
function extract(name) {
  const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);
  const rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);
}
function setup(employees,requests=[]) {
  const ctx=vm.createContext({vacationEmployees:employees,vacationRequests:requests,normalize:s=>String(s||'').toLowerCase()});
  for(const name of ['normalizeVacationEmployeeUnit','vacationEmployeeUsesHours','vacationIsSickLeave','vacationUsesAnnualAllowance',
    'vacationAnnualRequestAmount','allocateVacationRequestFromPools','calculateVacationAnnualBalance','vacationAnnualBalance','vacationEmployeeUsagePercent'])vm.runInContext(extract(name),ctx);
  return ctx;
}
const employee=(year,allowance=26,unit='DAYS',name='Pracownik Test')=>({id:`e${year}`,year,allowance,unit,name});
const request=(year,days,status='ZATWIERDZONY',extra={})=>({id:Math.random().toString(),employeeId:`e${year}`,year,days,hours:days*8,status,type:'WYPOCZYNKOWY',...extra});
test('unused days carry forward across years and are spent before the current annual allowance',()=>{
  const employees=[employee(2025),employee(2026),employee(2027)];
  const ctx=setup(employees,[request(2025,20),request(2026,4),request(2027,10)]);
  const a=ctx.vacationAnnualBalance(employees[1]);
  assert.equal(a.carryover,6);assert.equal(a.remaining,28);assert.equal(a.carryoverUsed,4);
  assert.equal(a.carryoverRemaining,2);assert.equal(a.currentRemaining,26);assert.equal(a.currentUsed,0);
  const b=ctx.vacationAnnualBalance(employees[2]);
  assert.equal(b.carryover,28);assert.equal(b.remaining,44);assert.equal(b.currentRemaining,26);
  assert.equal(ctx.vacationEmployeeUsagePercent(employees[1]),0);
  ctx.vacationRequests.push(request(2026,5));
  assert.equal(ctx.vacationAnnualBalance(employees[1]).currentUsed,3);
  assert.equal(ctx.vacationAnnualBalance(employees[2]).carryover,23);
  assert.equal(ctx.vacationAnnualBalance(employees[1]).remaining,23,'repeated calculation never adds carryover twice');
});
test('fractional hours carry forward and pending requests remain separate from approved use',()=>{
  const employees=[employee(2025,40,'HOURS'),employee(2026,40,'HOURS')];
  const ctx=setup(employees,[request(2025,2,'ZATWIERDZONY',{hours:8.5}),request(2026,2,'ZATWIERDZONY',{hours:12.5}),request(2026,1,'OCZEKUJE',{hours:4})]);
  const a=ctx.vacationAnnualBalance(employees[1]);
  assert.equal(a.carryover,31.5);assert.equal(a.remaining,59);assert.equal(a.carryoverRemaining,19);
  assert.equal(a.currentRemaining,40);assert.equal(a.pending,4);assert.equal(a.available,55);
});
test('L4, weekend compensation, overtime and rejected requests never consume annual carryover',()=>{
  const employees=[employee(2025),employee(2026)];
  const ignored=[request(2025,5,'ODRZUCONY'),request(2025,4,'OCZEKUJE'),request(2025,2,'ZATWIERDZONY',{notes:'L4'}),
    ...['ZA SOBOTĘ','ZA WEEKEND','NADGODZINY','WCZEŚNIEJSZE WYJŚCIE','INNY'].map(type=>request(2025,3,'ZATWIERDZONY',{type}))];
  const ctx=setup(employees,ignored);const b=ctx.vacationAnnualBalance(employees[1]);
  assert.equal(b.carryover,26);assert.equal(b.remaining,52);
  ctx.vacationRequests.push(request(2026,28,'ZATWIERDZONY',{type:'NA ŻĄDANIE'}));
  const used=ctx.vacationAnnualBalance(employees[1]);assert.equal(used.currentUsed,2);assert.equal(used.remaining,24);
});
test('missing years do not create allowances; name normalization preserves different people; mixed units use eight hours per day',()=>{
  const employees=[employee(2025,2,'DAYS',' Test   Osoba '),employee(2027,40,'HOURS','test osoba'),
    {...employee(2026),id:'other',name:'Inna Osoba'}];
  const ctx=setup(employees,[request(2025,1)]);
  const b=ctx.vacationAnnualBalance(employees[1]);assert.equal(b.carryover,8);assert.equal(b.remaining,48);
  assert.equal(ctx.vacationAnnualBalance(employees[2]).carryover,0);
  ctx.vacationRequests.push(request(2025,50));assert.equal(ctx.vacationAnnualBalance(employees[1]).carryover,0);
});
test('duplicate yearly identity warns instead of crediting someone else\'s pool',()=>{
  const employees=[employee(2025),{...employee(2025),id:'duplicate'},employee(2026)];
  const b=setup(employees).vacationAnnualBalance(employees[2]);
  assert.equal(b.carryoverIssue,true);assert.equal(b.carryover,0);assert.equal(b.remaining,26);
});
test('redacted balances use only trusted aggregate fields and never infer annual leave from hidden requests',()=>{
  const ctx=setup([employee(2025),employee(2026)],[request(2025,5)]);
  const e={...employee(2026),redacted:true,remaining:31};
  assert.equal(ctx.vacationAnnualBalance(e).ready,false);assert.equal(ctx.vacationAnnualBalance(e).remaining,31);
  e.annualBalance={ready:true,carryover:6,carryoverUsed:1,carryoverRemaining:5,remaining:31};
  const b=ctx.vacationAnnualBalance(e);assert.equal(b.ready,true);assert.equal(b.carryover,6);assert.equal(b.remaining,31);
  assert.equal(b.used,undefined);assert.equal(b.allowance,undefined);
  e.annualBalance.carryover='bad';assert.equal(ctx.vacationAnnualBalance(e).ready,false);
});

test('working-day calculation excludes holidays and weekends from daily and hourly deductions, even for legacy entries',()=>{
  const ctx=setup([]);
  ctx.parseIsoDate=value=>new Date(`${value}T12:00:00`);
  ctx.isoDateFromParts=(year,month,day)=>`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  ctx.addDaysToIsoDate=(value,days)=>{const date=ctx.parseIsoDate(value);date.setDate(date.getDate()+days);return ctx.isoDateFromParts(date.getFullYear(),date.getMonth()+1,date.getDate());};
  for(const name of ['easterSundayIso','polishPublicHolidays','vacationWorkingDays'])vm.runInContext(extract(name),ctx);
  const legacy=request(2025,7,'ZATWIERDZONY',{dateFrom:'2025-12-23',dateTo:'2025-12-29',hours:40});
  assert.equal(ctx.vacationAnnualRequestAmount(legacy,employee(2025)),2);
  assert.equal(ctx.vacationAnnualRequestAmount(legacy,employee(2025,40,'HOURS')),16);
  for(const unit of ['DAYS','HOURS']){
    assert.equal(ctx.vacationAnnualRequestAmount({...legacy,dateFrom:'2025-12-24',dateTo:'2025-12-28'},employee(2025,40,unit)),0);
    for(const type of ['ZA SOBOTĘ','ZA WEEKEND','INNY','NADGODZINY','WCZEŚNIEJSZE WYJŚCIE'])
      assert.equal(ctx.vacationAnnualRequestAmount({...legacy,type},employee(2025,40,unit)),0);
  }
});
test('allocations identify the original overdue year, split across pools and project pending requests without spending them',()=>{
  const employees=[employee(2025,6),employee(2026,10),employee(2027,26)];
  const first=request(2026,4,'ZATWIERDZONY',{id:'first'});
  const later=request(2027,5,'ZATWIERDZONY',{id:'later'});
  const pending=request(2027,2,'OCZEKUJE',{id:'pending'});
  const rejected=request(2027,2,'ODRZUCONY',{id:'rejected'});
  const ctx=setup(employees,[pending,rejected,later,first]);
  const b=ctx.vacationAnnualBalance(employees[2]);
  assert.deepEqual(JSON.parse(JSON.stringify(b.allocations.later)),[{year:2025,amount:2},{year:2026,amount:3}]);
  assert.deepEqual(JSON.parse(JSON.stringify(b.allocations.pending)),[{year:2026,amount:2}]);
  assert.equal(b.allocations.rejected,undefined);assert.equal(b.remaining,33);
  assert.equal(ctx.vacationAnnualBalance(employees[2]).remaining,33);
});
test('source-year badges show only authorized annual leave; pending badges are explicitly provisional',()=>{
  const ctx=setup([]);let authorized=true;
  ctx.vacationCanViewBalance=()=>authorized;ctx.formatVacationAmount=String;
  ctx.document={createElement:()=>({dataset:{}})};
  vm.runInContext(extract('appendVacationCarryoverBadges'),ctx);
  const cell={children:[],append(node){this.children.push(node);}};
  const r=request(2027,2,'ZATWIERDZONY',{id:'r'}), e=employee(2027);
  const balance={allocations:{r:[{year:2025,amount:1},{year:2026,amount:1}]}};
  ctx.appendVacationCarryoverBadges(cell,r,e,balance);
  assert.deepEqual(cell.children.map(n=>n.textContent),['Zaległy 2025','Zaległy 2026']);
  assert.match(cell.children[0].title,/Rozliczono: 1 dzień z puli 2025/);
  cell.children=[];ctx.appendVacationCarryoverBadges(cell,{...r,status:'OCZEKUJE'},e,balance);
  assert.equal(cell.children[0].dataset.pending,'true');assert.match(cell.children[0].title,/Planowane/);
  for(const change of [{status:'ODRZUCONY'},{redacted:true},{type:'INNY'}]){
    cell.children=[];ctx.appendVacationCarryoverBadges(cell,{...r,...change},e,balance);assert.equal(cell.children.length,0);
  }
  authorized=false;ctx.appendVacationCarryoverBadges(cell,r,e,balance);assert.equal(cell.children.length,0);
});
