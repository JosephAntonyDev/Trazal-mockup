const validDate=value=>typeof value==='string'&&/^\d{4}-\d\d-\d\d$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const text=value=>typeof value==='string'&&!!value.trim();
const optionalNumber=value=>value===null||typeof value==='number'&&Number.isFinite(value)&&value>=0;
export function validateResources(resources=[]) {
  if(!Array.isArray(resources)||resources.length>2000)throw new Error('Revisa la lista de insumos.');
  const ids=new Set();
  for(const r of resources){
    if(!text(r.id)||ids.has(r.id)||!text(r.name)||r.name.length>180||!['Material','Servicio / trabajo','Equipo'].includes(r.kind)||typeof r.unit!=='string'||r.unit.length>30||!optionalNumber(r.quantity)||!optionalNumber(r.price)||typeof r.notes!=='string'||r.notes.length>500||r.imageId!==undefined&&typeof r.imageId!=='string')throw new Error('Revisa nombre, tipo, cantidad y precio del insumo.');
    ids.add(r.id);
  }
  return resources;
}
export function saveResource(project,resource){
  const resources=[...(project.resources||[]).filter(r=>r.id!==resource.id),resource];validateResources(resources);
  return {...project,resources};
}
export function validateCash(entries=[]){
  if(!Array.isArray(entries)||entries.length>10000)throw new Error('Revisa los movimientos de efectivo.');
  const ids=new Set();for(const e of entries){if(!text(e.id)||ids.has(e.id)||!validDate(e.date)||!text(e.label)||e.label.length>300||!['income','payment'].includes(e.kind)||typeof e.amount!=='number'||!Number.isFinite(e.amount)||e.amount<=0)throw new Error('Revisa fecha, descripción e importe del movimiento.');ids.add(e.id);}return entries;
}
export function saveCash(project,entry){const cash=[...(project.cash||[]).filter(e=>e.id!==entry.id),entry];validateCash(cash);return {...project,cash};}
export function cashTotals(project,cutoff){const entries=(project.cash||[]).filter(e=>e.date<=cutoff);const sum=kind=>Math.round(entries.filter(e=>e.kind===kind).reduce((s,e)=>s+e.amount,0)*100)/100;const income=sum('income'),payments=sum('payment');return {income,payments,balance:Math.round((income-payments)*100)/100};}
export function safeCsv(rows){return '\uFEFF'+rows.map(row=>row.map(value=>{let s=String(value??'');if(typeof value==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
