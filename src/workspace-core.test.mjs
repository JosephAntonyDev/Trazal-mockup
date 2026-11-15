import test from 'node:test';
import assert from 'node:assert/strict';
import {saveResource,saveCash,cashTotals,safeCsv} from './workspace-core.mjs';
import {validateProjects,recordExpense,recordProgress,projectMetrics,projectSeries,freezeProject,distributeDaily} from './project-core.mjs';
const draft=()=>({id:'p1',name:'Obra',type:'Urbanización',dimensions:'',start:'',end:'',iva:null,concepts:[],progress:[],expenses:[],notes:[]});
const resource={id:'r1',name:'Varilla de 3/8',kind:'Material',unit:'kg',quantity:20,price:24,notes:'Solo obra A',imageId:'varillas'};
test('insumos conservan precio por obra y no generan presupuesto ni gasto',()=>{
 const a=saveResource(draft(),resource),b=saveResource({...draft(),id:'p2'},{...resource,price:30});
 assert.equal(a.resources[0].price,24);assert.equal(b.resources[0].price,30);
 assert.equal(projectMetrics(a,'2026-11-15').ac,0);assert.equal(a.concepts.length,0);
 assert.equal(saveResource(a,{...resource,price:0}).resources.length,1);
 assert.equal(validateProjects({version:2,projects:[a]}).projects[0].resources[0].imageId,'varillas');
});
test('insumos opcionales y respaldos anteriores; negativos y duplicados rechazados',()=>{
 assert.doesNotThrow(()=>validateProjects({version:2,projects:[draft()]}));
 assert.equal(saveResource(draft(),{...resource,quantity:null,price:null}).resources[0].price,null);
 for(const invalid of [{price:-1},{quantity:NaN},{kind:'inventado'},{name:' '}])assert.throws(()=>saveResource(draft(),{...resource,...invalid}));
 assert.throws(()=>validateProjects({version:2,projects:[{...draft(),resources:[resource,resource]}]}));
});
test('efectivo respeta el corte y no duplica compras o cambia AC',()=>{
 let p=saveCash(draft(),{id:'cash1',date:'2026-11-10',label:'Anticipo',kind:'income',amount:1000});
 p=saveCash(p,{id:'cash2',date:'2026-11-12',label:'Pago',kind:'payment',amount:300});
 assert.deepEqual(cashTotals(p,'2026-11-11'),{income:1000,payments:0,balance:1000});
 assert.deepEqual(cashTotals(p,'2026-11-15'),{income:1000,payments:300,balance:700});
 assert.equal(projectMetrics(p,'2026-11-15').ac,0);
 assert.throws(()=>saveCash(p,{id:'bad',date:'2026-02-30',label:'Pago',kind:'payment',amount:1}));
 assert.throws(()=>saveCash(p,{id:'bad',date:'2026-11-15',label:'Pago',kind:'payment',amount:-1}));
 assert.doesNotThrow(()=>validateProjects(JSON.parse(JSON.stringify({version:2,projects:[p]}))));
});
test('editar gasto conserva un solo registro y recalcula el corte',()=>{
 const e={id:'e1',conceptId:'',date:'2026-11-10',label:'Topografía',quantity:0,unit:'',category:'Servicios',amount:100,iva:0};
 const original=recordExpense(draft(),e),edited=recordExpense(original,{...e,amount:150});
 assert.equal(original.expenses[0].amount,100);assert.equal(edited.expenses.length,1);assert.equal(projectMetrics(edited,'2026-11-15').ac,150);
});
test('CSV neutraliza fórmulas y escapa descripciones',()=>{
 assert.equal(safeCsv([['=1+1','Texto "citado"',12.5]]),'\uFEFF"\'=1+1","Texto ""citado""","12.5"');
});
test('serie registra gasto anterior al programa y no falla con obra vacía',()=>{
 assert.deepEqual(projectSeries(draft(),'2026-11-15'),[]);
 const p={...draft(),start:'2026-11-10',end:'2026-11-20',expenses:[{id:'e1',conceptId:'',date:'2026-11-05',label:'Compra anticipada',amount:200,iva:0,quantity:0,unit:'',category:'Materiales'}]};
 assert.equal(projectSeries(p,'2026-11-15')[0].date,'2026-11-05');
 assert.equal(projectSeries(p,'2026-11-15')[0].ac,200);
});
test('avance futuro se rechaza sin alterar programa ni capturas',()=>{
 const c={id:'c1',code:'BAN-01',description:'Construcción de banqueta',unit:'m²',quantity:100,price:10,pricing:'quoted',indirect:0,profit:0,charges:0,start:'2026-01-01',end:'2026-01-02',daily:distributeDaily(100,'2026-01-01','2026-01-02')};
 const p=freezeProject({...draft(),start:c.start,end:c.end,iva:0,concepts:[c]});
 assert.throws(()=>recordProgress(p,{id:'future',conceptId:c.id,start:'2099-01-01',end:'2099-01-02',percent:30}),/futura/);
 assert.equal(p.progress.length,0);assert.equal(p.baseline.subtotal,1000);
});
