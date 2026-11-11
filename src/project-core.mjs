import {roundMoney, linearPlanned} from './core.mjs';

const fail = message => { throw new Error(message); };
const finite = (n, min = 0) => typeof n === 'number' && Number.isFinite(n) && n >= min;
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
const text = value => typeof value === 'string' && value.trim().length > 0;

/** @param {any} concept */
export function conceptTotal(concept) {
  const direct = concept.quantity * concept.price;
  // Quoted prices already include all additions; build-up prices apply each rate to direct cost.
  const factor = concept.pricing === 'build' ? 1 + (concept.indirect + concept.profit + concept.charges) / 100 : 1;
  return roundMoney(direct * factor);
}

/** @param {any} project */
export function budgetTotals(project) {
  const subtotal = roundMoney(project.concepts.reduce((sum, c) => sum + conceptTotal(c), 0));
  const tax = roundMoney(subtotal * project.iva / 100);
  return {subtotal, tax, total: roundMoney(subtotal + tax)};
}

/** @param {any} project @param {any} concept */
export function validateConcept(project, concept) {
  if (!text(concept.id) || !text(concept.code) || !text(concept.description) || !text(concept.unit)) fail('Completa clave, descripción y unidad.');
  if (!finite(concept.quantity, 0.000001) || !finite(concept.price, 0.000001)) fail('Cantidad y precio deben ser mayores que cero.');
  if (!['quoted','build'].includes(concept.pricing) || ![concept.indirect,concept.profit,concept.charges].every(n => finite(n) && n <= 100)) fail('Revisa los porcentajes de composición del precio.');
  if (!validDate(concept.start) || !validDate(concept.end) || concept.end < concept.start || concept.start < project.start || concept.end > project.end) fail('Las fechas del concepto deben estar dentro del plazo de la obra.');
  if (project.concepts.some(c => c.id !== concept.id && c.code.toLowerCase() === concept.code.toLowerCase())) fail('Esta clave ya existe en la obra. Usa una clave única.');
  if (!Number.isFinite(conceptTotal(concept)) || conceptTotal(concept) <= 0) fail('El importe del concepto debe ser mayor que cero.');
  if (concept.daily) {
    if (!Array.isArray(concept.daily) || !concept.daily.length) fail('Agrega la distribución diaria.');
    const dates = new Set();
    for (const d of concept.daily) { if (!validDate(d.date) || d.date < concept.start || d.date > concept.end || !finite(d.quantity) || dates.has(d.date)) fail('Revisa fechas y cantidades del programa diario; no repitas fechas.'); dates.add(d.date); }
    if (Math.abs(concept.daily.reduce((s,d)=>s+d.quantity,0) - concept.quantity) > 0.000001) fail('La cantidad programada debe coincidir con la cantidad del catálogo.');
  }
  return concept;
}

/** @param {any} project @param {any} concept */
export function saveConcept(project, concept) {
  if (project.baseline) fail('El presupuesto y el programa aprobados están bloqueados.');
  validateConcept(project, concept);
  return {...project, concepts: [...project.concepts.filter(c => c.id !== concept.id), concept]};
}

/** @param {any} project */
export function freezeProject(project) {
  if (project.baseline) fail('Esta obra ya tiene un programa aprobado.');
  if (!project.concepts.length) fail('Agrega al menos un concepto antes de fijar el programa.');
  if (project.concepts.some(c=>!c.daily)) fail('Revisa y guarda la distribución diaria de cada concepto.');
  project.concepts.forEach(c => validateConcept(project,c));
  return {...project, baseline: {approvedAt: new Date().toISOString(), subtotal: budgetTotals(project).subtotal}};
}

/** @param {any} project */
export function progressAt(project, conceptId, cutoff) {
  return project.progress.filter(r => r.conceptId === conceptId && r.end <= cutoff).sort((a,b) => b.end.localeCompare(a.end))[0]?.percent ?? 0;
}

/** @param {any} project @param {any} entry */
export function recordProgress(project, entry) {
  if (!project.baseline) fail('Primero fija el programa de obra.');
  const concept = project.concepts.find(c => c.id === entry.conceptId);
  if (!concept) fail('Selecciona un concepto de esta obra.');
  if (!validDate(entry.start) || !validDate(entry.end) || entry.start > entry.end || entry.start < project.start) fail('Revisa el periodo del avance.');
  const prior = project.progress.filter(r => r.conceptId === concept.id).sort((a,b) => b.end.localeCompare(a.end))[0];
  if (prior?.percent === 100) fail('Este concepto ya llegó al 100 %. No admite más avance.');
  if (prior && entry.start <= prior.end) fail('El nuevo periodo debe empezar después del último avance registrado.');
  if (!finite(entry.percent, 0.000001) || entry.percent > 100 || entry.percent <= (prior?.percent ?? 0)) fail('El acumulado debe aumentar respecto al anterior y no puede superar el 100 %.');
  return {...project, progress: [...project.progress, entry]};
}

/** @param {any} project @param {any} entry */
export function recordExpense(project, entry) {
  if (!project.baseline) fail('Primero fija el programa de obra.');
  if (!validDate(entry.date) || entry.date < project.start || !text(entry.label) || !finite(entry.amount,0.01) || !finite(entry.iva) || entry.iva > 100 || (entry.conceptId && !project.concepts.some(c => c.id === entry.conceptId))) fail('Revisa la fecha, el concepto, el importe y el IVA del gasto.');
  if (!finite(entry.quantity) || typeof entry.unit !== 'string' || !text(entry.category)) fail('Revisa la cantidad, unidad y categoría del gasto.');
  return {...project, expenses: [...project.expenses, entry]};
}

/** @param {any} project */
export function projectMetrics(project, cutoff) {
  const {subtotal: bac} = budgetTotals(project);
  const pv = roundMoney(project.concepts.reduce((sum,c) => sum + (c.daily ? conceptTotal(c) * c.daily.filter(d=>d.date<=cutoff).reduce((s,d)=>s+d.quantity,0) / c.quantity : linearPlanned(conceptTotal(c), c.start, c.end, cutoff)),0));
  const ev = roundMoney(project.concepts.reduce((sum,c) => sum + roundMoney(conceptTotal(c) * progressAt(project,c.id,cutoff) / 100),0));
  const ac = roundMoney(project.expenses.filter(e => e.date <= cutoff).reduce((sum,e) => sum + e.amount,0));
  return {bac,pv,ev,ac,progress: bac > 0 ? ev / bac * 100 : 0, cv: roundMoney(ev-ac),sv:roundMoney(ev-pv),cpi:ac>0?ev/ac:null,spi:pv>0?ev/pv:null};
}

export function distributeDaily(quantity, start, end) {
  if (!validDate(start) || !validDate(end) || end < start) fail('Revisa las fechas del programa.');
  const count = (Date.parse(end)-Date.parse(start))/86400000+1;
  if (count>3660) fail('La distribución de esta maqueta admite hasta 10 años por concepto.');
  const each = Math.floor(quantity/count*1e6)/1e6;
  return Array.from({length:count},(_,i)=>({date:new Date(Date.parse(start)+i*86400000).toISOString().slice(0,10),quantity:i===count-1?Number((quantity-each*(count-1)).toFixed(6)):each}));
}

/** @param {any} project */
export function projectSeries(project, cutoff) {
  const finish = [project.end,cutoff].sort().at(-1);
  const first = Date.parse(project.start), last = Date.parse(finish);
  const dates = new Set([project.start, project.end, cutoff, ...project.concepts.flatMap(c=>(c.daily||[]).map(d=>d.date)), ...project.progress.map(r=>r.end), ...project.expenses.map(e=>e.date)]);
  for (let i=0;i<=24;i++) dates.add(new Date(first + Math.round((last-first)/86400000*i/24)*86400000).toISOString().slice(0,10));
  return [...dates].filter(d=>d>=project.start && d<=finish).sort().map(date => ({date,...projectMetrics(project,date)}));
}

/** @param {any} project */
export function parseCatalog(project, input, makeId) {
  const lines = input.trim().split(/\r?\n/).filter(l=>l.trim());
  if (!lines.length) fail('Pega las filas del catálogo.');
  let next = project;
  for (const [index,line] of lines.entries()) {
    const cells = line.split('\t').map(v=>v.trim());
    if (index === 0 && /^(clave|c[oó]digo)$/i.test(cells[0])) continue;
    if (cells.length !== 5) fail(`Fila ${index+1}: se necesitan 5 columnas separadas por tabulaciones.`);
    const [code,description,unit,quantity,price] = cells;
    if (![quantity,price].every(v=>/^\d+(\.\d+)?$/.test(v))) fail(`Fila ${index+1}: usa números sin símbolo de moneda ni separadores de miles, con punto decimal.`);
    next = saveConcept(next, {id:makeId(),code,description,unit,quantity:Number(quantity),price:Number(price),pricing:'quoted',indirect:0,profit:0,charges:0,start:project.start,end:project.end});
  }
  if (next.concepts.length === project.concepts.length) fail('El catálogo no contiene conceptos.');
  return next;
}

/** @param {any} input */
export function validateProjects(input) {
  if (!input || input.version !== 2 || !Array.isArray(input.projects)) fail('Este archivo no es un respaldo de obras de Trazal.');
  const ids = new Set();
  for (const p of input.projects) {
    if (!text(p.id) || ids.has(p.id) || !text(p.name) || !text(p.type) || typeof p.dimensions !== 'string' || !validDate(p.start) || !validDate(p.end) || p.end < p.start || !finite(p.iva) || p.iva>100 || !Array.isArray(p.concepts) || !Array.isArray(p.progress) || !Array.isArray(p.expenses) || !Array.isArray(p.notes) || !p.notes.every(n=>typeof n==='string')) fail('El respaldo contiene una obra no válida.');
    ids.add(p.id);
    const conceptIds = new Set();
    for (const c of p.concepts) { if(conceptIds.has(c.id)) fail('Hay conceptos repetidos.'); conceptIds.add(c.id); validateConcept(p,c); }
    if (p.baseline && (!p.concepts.length || p.concepts.some(c=>!c.daily) || !Number.isFinite(Date.parse(p.baseline.approvedAt)) || p.baseline.subtotal !== budgetTotals(p).subtotal)) fail('La línea base del respaldo no coincide con el presupuesto.');
    let replay = {...p,progress:[],expenses:[]};
    const entryIds = new Set();
    for (const r of [...p.progress,...p.expenses]) {if(!text(r.id)||entryIds.has(r.id)) fail('Hay movimientos repetidos o sin identificador.');entryIds.add(r.id);}
    for (const r of p.progress) replay = recordProgress(replay,r);
    for (const e of p.expenses) replay = recordExpense(replay,e);
  }
  return input;
}
