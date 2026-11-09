export const roundMoney = n => Math.round((n + Number.EPSILON) * 100) / 100;
export function earnedValue({bac,pv,ev,ac}) {
  const cv=ev-ac, sv=ev-pv, cpi=ac>0?ev/ac:null, spi=pv>0?ev/pv:null;
  const eac=cpi!==null&&cpi>0?bac/cpi:null;
  return {bac,pv,ev,ac,cv,sv,cpi,spi,eac,etc:eac===null?null:eac-ac,vac:eac===null?null:bac-eac,cvPercent:ev>0?cv/ev:null,svPercent:pv>0?sv/pv:null,tcpi:bac-ac>0?(bac-ev)/(bac-ac):null,tc:ev>0?1+(bac-ev)/ev:null,tcPlan:pv>0?1+(bac-ev)/pv:null,progress:bac>0?ev/bac:null};
}
export function buildSeries(weeks, advances=[], costs=[]) {
  return weeks.map(w=>({...w,ev:w.ev+advances.filter(a=>a.week<=w.id).reduce((s,a)=>s+a.amount,0),ac:w.ac+costs.filter(c=>c.week<=w.id).reduce((s,c)=>s+c.amount,0)}));
}
export function earnedFromQuantity(quantity,baseQuantity,amount) {
  if(!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(baseQuantity)||baseQuantity<=0)throw new Error('La cantidad debe ser mayor que cero.');
  return quantity/baseQuantity*amount;
}
export function cashRollforward(months,opening=0) {
  let balance=opening;
  return months.map(m=>{const start=balance;balance+=m.income-m.expense;return {...m,opening:start,net:m.income-m.expense,closing:balance};});
}
export function linearPlanned(amount,start,end,cutoff) {
  const a=Date.parse(start),b=Date.parse(end),c=Date.parse(cutoff),day=86400000;
  if(![a,b,c,amount].every(Number.isFinite)||b<a||amount<0)throw new Error('Revisa el importe y las fechas.');
  return amount*Math.max(0,Math.min(1,((c-a)/day+1)/((b-a)/day+1)));
}
export function validateWorkspace(input,conceptIds) {
  if(!input||input.version!==1||!Number.isFinite(input.bac)||input.bac<=0||!Array.isArray(input.advances)||!Array.isArray(input.costs)||!Array.isArray(input.notes)||!Array.isArray(input.snapshots)||!Array.isArray(input.cashEntries)||!input.decisions||typeof input.decisions!=='object'||!input.schedule||typeof input.schedule!=='object')throw new Error('El archivo no es una sesión válida de este prototipo.');
  for(const r of [...input.advances,...input.costs])if(typeof r.id!=='string'||typeof r.label!=='string'||!Number.isFinite(r.amount)||r.amount<=0||!Number.isInteger(r.week)||r.week<1||r.week>16)throw new Error('Hay movimientos con datos no válidos.');
  for(const a of input.advances)if(!conceptIds.includes(a.conceptId)||!Number.isFinite(a.quantity)||a.quantity<=0)throw new Error('Hay avances con conceptos o cantidades no válidos.');
  for(const n of input.notes)if(typeof n.id!=='string'||typeof n.text!=='string'||typeof n.section!=='string'||!['Pendiente','Acordado','Descartado'].includes(n.status))throw new Error('Hay observaciones no válidas.');
  for(const e of input.cashEntries)if(!Number.isFinite(e.amount)||e.amount<=0||typeof e.label!=='string'||!['income','expense'].includes(e.type))throw new Error('Hay movimientos de caja no válidos.');
  for(const [id,s] of Object.entries(input.schedule))if(!conceptIds.includes(id)||!s||typeof s.start!=='string'||typeof s.end!=='string'||!Number.isFinite(Date.parse(s.start))||!Number.isFinite(Date.parse(s.end))||s.end<s.start)throw new Error('Hay fechas de programa no válidas.');
  for(const d of Object.values(input.decisions))if(!['Pendiente','Aclarado','Cambiar'].includes(d))throw new Error('Hay decisiones no válidas.');
  for(const s of input.snapshots)if(!s||typeof s.id!=='string'||!Number.isInteger(s.week)||s.week<1||s.week>16||!s.metrics||!['bac','pv','ac','ev'].every(k=>Number.isFinite(s.metrics[k]))||typeof s.created!=='string')throw new Error('Hay cortes guardados no válidos.');
  return input;
}
