import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetTotals,conceptTotal,distributeDaily,freezeProject,parseCatalog,progressAt,projectMetrics,recordExpense,recordProgress,saveConcept,validateProjects} from './project-core.mjs';
const c={id:'c1',code:'CON-01',description:'Concreto',unit:'m³',quantity:100,price:100,pricing:'quoted',indirect:10,profit:20,charges:5,start:'2026-11-01',end:'2026-11-10',daily:distributeDaily(100,'2026-11-01','2026-11-10')};
const draft=()=>({id:'p1',name:'Banqueta',type:'Urbanización',dimensions:'100 m',start:'2026-11-01',end:'2026-11-10',iva:16,concepts:[structuredClone(c)],progress:[],expenses:[],notes:[]});
const progress=(percent,start='2026-11-01',end='2026-11-03')=>({id:`r-${end}`,conceptId:'c1',start,end,percent});
const expense={id:'e1',conceptId:'c1',date:'2026-11-03',label:'Cemento',quantity:10,unit:'toneladas',category:'Materiales',amount:6000,iva:16};
test('El precio integrado no duplica utilidad; la composición usa costo directo y el IVA se suma una vez',()=>{
  assert.equal(conceptTotal(c),10000);
  assert.equal(conceptTotal({...c,pricing:'build'}),13500);
  assert.deepEqual(budgetTotals(draft()),{subtotal:10000,tax:1600,total:11600});
});
test('El programa diario conserva la cantidad y admite jornadas sin trabajo',()=>{
  const each=distributeDaily(1,'2026-11-01','2026-11-03');
  assert.ok(Math.abs(each.reduce((s,d)=>s+d.quantity,0)-1)<1e-10);
  const p=draft();p.concepts[0].daily=[{date:'2026-11-02',quantity:20},{date:'2026-11-06',quantity:80}];
  assert.equal(projectMetrics(p,'2026-11-01').pv,0);
  assert.equal(projectMetrics(p,'2026-11-03').pv,2000);
  assert.equal(projectMetrics(p,'2026-11-10').pv,10000);
});
test('No se aprueba un programa incompleto y el aprobado bloquea edición',()=>{
  const missing=draft();delete missing.concepts[0].daily;assert.throws(()=>freezeProject(missing),/distribución/);
  const invalid=draft();invalid.concepts[0].daily[0].quantity=0;assert.throws(()=>freezeProject(invalid),/coincidir/);
  const fixed=freezeProject(draft());assert.throws(()=>saveConcept(fixed,{...c,price:200}),/bloqueados/);
  assert.throws(()=>freezeProject(fixed),/ya tiene/);
});
test('30 a 45 por ciento son acumulados y no suman 75',()=>{
  let p=recordProgress(freezeProject(draft()),progress(30));
  p=recordProgress(p,progress(45,'2026-11-04','2026-11-05'));
  assert.equal(progressAt(p,'c1','2026-11-03'),30);
  assert.equal(projectMetrics(p,'2026-11-05').ev,4500);
  assert.equal(projectMetrics(p,'2026-11-02').ev,0);
});
test('100 por ciento bloquea nuevas capturas, retrocesos y periodos superpuestos se rechazan',()=>{
  const p=recordProgress(freezeProject(draft()),progress(30));
  assert.throws(()=>recordProgress(p,progress(101,'2026-11-04','2026-11-05')),/100/);
  assert.throws(()=>recordProgress(p,progress(29,'2026-11-04','2026-11-05')),/aumentar/);
  assert.throws(()=>recordProgress(p,progress(45,'2026-11-03','2026-11-05')),/después/);
  const complete=recordProgress(p,progress(100,'2026-11-04','2026-11-10'));
  assert.equal(projectMetrics(complete,'2026-11-10').ev,10000);
  assert.throws(()=>recordProgress(complete,progress(100,'2026-11-11','2026-11-11')),/ya llegó/);
});
test('Adelanto y sobrecosto coexisten; comprar no crea avance y no cambia PV',()=>{
  const baseline=freezeProject(draft());
  const purchase=recordExpense(baseline,expense);
  assert.equal(projectMetrics(purchase,'2026-11-03').ev,0);
  const p=recordProgress(purchase,progress(50));const m=projectMetrics(p,'2026-11-03');
  assert.equal(m.pv,3000);assert.equal(m.ev,5000);assert.equal(m.ac,6000);
  assert.ok(m.spi>1);assert.ok(m.cpi<1);
  assert.equal(projectMetrics(p,'2026-11-02').ac,0);
  assert.deepEqual(p.concepts,baseline.concepts);
  assert.deepEqual(p.baseline,baseline.baseline);
});
test('Un avance posterior al plazo se conserva sin extender el programa aprobado',()=>{
  const p=recordProgress(freezeProject(draft()),progress(100,'2026-11-01','2026-11-15'));
  assert.equal(p.end,'2026-11-10');assert.equal(projectMetrics(p,'2026-11-15').pv,10000);
  assert.equal(projectMetrics(p,'2026-11-10').ev,0);
});
test('Catálogo pegado valida todas las filas sin aplicar una importación parcial',()=>{
  const p={...draft(),concepts:[]};let id=0;
  const next=parseCatalog(p,'Clave\tDescripción\tUnidad\tCantidad\tPrecio\nEXC\tExcavación\tm³\t50\t180\nCON\tConcreto\tm³\t20\t2500',()=>String(++id));
  assert.equal(next.concepts.length,2);assert.equal(budgetTotals(next).subtotal,59000);assert.equal(p.concepts.length,0);
  assert.throws(()=>parseCatalog(p,'A\tUno\tm\t1\t100\nA\tDos\tm\t1\t100',()=>String(++id)),/clave/);
});
test('Respaldos y obras independientes conservan sus capturas',()=>{
  const a=recordExpense(recordProgress(freezeProject(draft()),progress(30)),expense);
  const b={...draft(),id:'p2',name:'Otra obra'};
  const restored=validateProjects(JSON.parse(JSON.stringify({version:2,projects:[a,b]})));
  assert.equal(projectMetrics(restored.projects[0],'2026-11-03').ac,6000);
  assert.equal(projectMetrics(restored.projects[1],'2026-11-03').ac,0);
  const tampered=structuredClone(restored);tampered.projects[0].progress[0].percent=120;
  assert.throws(()=>validateProjects(tampered),/100/);
  assert.throws(()=>recordProgress(b,progress(20)),/Primero/);
});
test('El borrador admite precios pendientes, pero no se puede aprobar hasta completarlos',()=>{
  const pending=saveConcept(draft(),{...c,materialId:'concreto',price:0});
  assert.equal(budgetTotals(pending).total,0);
  assert.equal(validateProjects({version:2,projects:[pending]}).projects[0].concepts[0].materialId,'concreto');
  assert.throws(()=>freezeProject(pending),/precios pendientes/);
  const priced=saveConcept(pending,{...pending.concepts[0],price:250});
  assert.equal(freezeProject(priced).baseline.subtotal,25000);
});
test('El recordatorio no afecta el presupuesto, el programa ni los indicadores',()=>{
  const p=freezeProject(draft());const withReminder={...p,reminder:{date:'2026-11-09',text:'Revisar cumplimiento con la dependencia'}};
  validateProjects({version:2,projects:[withReminder]});
  assert.deepEqual(projectMetrics(p,'2026-11-08'),projectMetrics(withReminder,'2026-11-08'));
  assert.deepEqual(p.baseline,withReminder.baseline);
  assert.throws(()=>validateProjects({version:2,projects:[{...p,reminder:{date:'mal',text:'Revisar'}}]}),/recordatorio/);
});
