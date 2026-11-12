import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetTotals,conceptTotal,distributeDaily,findProjects,freezeProject,parseCatalog,progressAt,projectMetrics,recordExpense,recordProgress,saveConcept,validateProjects} from './project-core.mjs';
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
test('El mismo material conserva precios distintos por obra y una compra posterior no revalúa la línea base',()=>{
  const a=freezeProject(saveConcept(draft(),{...c,materialId:'concreto',price:100}));
  const b=saveConcept({...draft(),id:'p2'},{...c,materialId:'concreto',price:250});
  const changed=saveConcept(b,{...b.concepts[0],price:300});
  const purchased=recordExpense(a,{...expense,amount:9000});
  const restored=validateProjects(JSON.parse(JSON.stringify({version:2,projects:[purchased,changed]}))).projects;
  assert.equal(restored[0].concepts[0].price,100);assert.equal(restored[1].concepts[0].price,300);
  assert.equal(restored[0].baseline.subtotal,10000);assert.equal(budgetTotals(restored[1]).subtotal,30000);
});
test('La búsqueda combina palabras sin acentos y encuentra nombre, alcance y conceptos',()=>{
  const a={...draft(),name:'Escuela José',dimensions:'250 m²',type:'Escuelas'};
  const b={...draft(),id:'p2',name:'Camino norte',type:'Caminos'};
  assert.deepEqual(findProjects([a,b],{query:'  JOSE escuela 250 '}).map(p=>p.id),['p1']);
  assert.equal(findProjects([a,b],{query:'CON-01 concreto'}).length,2);
  assert.equal(findProjects([a,b],{query:'inexistente'}).length,0);
});
test('Los filtros de estado, tipo y periodo se combinan y el rango es inclusivo',()=>{
  const a=freezeProject(draft());const b={...draft(),id:'p2',type:'Escuelas'};
  assert.deepEqual(findProjects([a,b],{status:'fixed',type:'Urbanización',from:'2026-11-10',to:'2026-11-15'}).map(p=>p.id),['p1']);
  assert.equal(findProjects([a,b],{status:'fixed',type:'Escuelas'}).length,0);
  assert.equal(findProjects([a,b],{from:'2026-11-11'}).length,0);
  assert.equal(findProjects([a,b],{to:'2026-11-01'}).length,2);
  assert.equal(findProjects([a,b],{from:'2026-12-01',to:'2026-11-01'}).length,0);
});
test('Ordenar por nombre, presupuesto o término no modifica las obras ni su orden original',()=>{
  const a={...draft(),name:'Zeta'};const b={...draft(),id:'p2',name:'Alameda',end:'2026-12-01',concepts:[{...c,price:200}]};
  const source=[a,b],copy=structuredClone(source);
  assert.deepEqual(findProjects(source,{sort:'name'}).map(p=>p.id),['p2','p1']);
  assert.deepEqual(findProjects(source,{sort:'budget'}).map(p=>p.id),['p2','p1']);
  assert.deepEqual(findProjects(source,{sort:'end'}).map(p=>p.id),['p1','p2']);
  assert.deepEqual(source,copy);
});
import {scheduleProject} from './project-core.mjs';

test('Crear con título y tipo permite fechas e IVA pendientes sin inventar un total',()=>{
  const p={...draft(),start:'',end:'',iva:null,concepts:[]};
  assert.deepEqual(validateProjects({version:2,projects:[p]}).projects[0],p);
  const next=saveConcept(p,{...c,start:'',end:'',daily:undefined});
  assert.deepEqual(budgetTotals(next),{subtotal:10000,tax:null,total:null});
  assert.equal(projectMetrics(next,'2026-11-11').pv,0);
  assert.throws(()=>freezeProject(next),/fechas/);
  assert.equal(findProjects([next],{to:'2026-12-31'}).length,0);
  assert.equal(findProjects([next],{query:'Banqueta'}).length,1);
  for(const fields of [{name:'  '},{type:''},{start:'2026-11-01',end:''},{iva:undefined}])assert.throws(()=>validateProjects({version:2,projects:[{...p,...fields}]}));
});

test('Definir el programa después conserva precios y exige confirmar IVA antes de aprobar',()=>{
  const pending={...draft(),start:'',end:'',iva:null,concepts:[{...c,start:'',end:'',daily:undefined}]};
  const scheduled=scheduleProject(pending,'2026-11-01','2026-11-10');
  assert.equal(scheduled.concepts[0].start,'2026-11-01');
  assert.equal(scheduled.concepts[0].price,c.price);
  assert.equal(pending.start,'');
  assert.throws(()=>freezeProject(scheduled),/IVA/);
  const ready=saveConcept({...scheduled,iva:0},{...scheduled.concepts[0],daily:distributeDaily(100,scheduled.start,scheduled.end)});
  assert.equal(budgetTotals(ready).total,10000);
  assert.ok(freezeProject(ready).baseline);
  assert.throws(()=>scheduleProject(ready,'2026-11-05','2026-11-10'),/fechas/);
  assert.throws(()=>scheduleProject(freezeProject(ready),'2026-11-01','2026-11-11'),/bloqueado/);
  assert.throws(()=>validateProjects({version:2,projects:[{...freezeProject(ready),iva:null}]}));
  assert.deepEqual(validateProjects(JSON.parse(JSON.stringify({version:2,projects:[pending, {...ready,id:'ready'}]}))).projects[0],JSON.parse(JSON.stringify(pending)));
});
