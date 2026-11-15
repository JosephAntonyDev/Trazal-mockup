import writeExcel,{type Sheet,type SheetData} from 'write-excel-file/universal';
import type {Project} from './Works';
import {budgetTotals,conceptTotal,projectMetrics,projectSeries} from './project-core.mjs';
export async function exportExcelReport(project:Project,cutoff:string){
 const totals=budgetTotals(project),metrics=projectMetrics(project,cutoff);
 const sheet=(name:string,data:SheetData):Sheet<Blob>=>({sheet:name,data,dateFormat:'dd/mm/yyyy',columns:Array.from({length:Math.max(...data.map(r=>r.length))},(_,i)=>({width:i===1?55:24})),stickyRowsCount:1});
 const date=(s:string)=>s?new Date(s+'T12:00:00'):null;
 const sheets=[
 sheet('Resumen',[['Obra',project.name],['Corte',date(cutoff)],['Subtotal',totals.subtotal],['IVA',totals.tax??'Pendiente'],['Total',totals.total??'Pendiente'],['Programa',metrics.pv],['Ejecutado',metrics.ev],['Gastos',metrics.ac],['SPI',project.baseline?metrics.spi:null],['CPI orientativo',project.baseline?metrics.cpi:null]]),
 sheet('Presupuesto',[['Clave','Descripción','Unidad','Cantidad','PU sin IVA','Importe'],...project.concepts.map(c=>[c.code,c.description,c.unit,c.quantity,conceptTotal(c)/c.quantity,conceptTotal(c)])]),
 sheet('Programa diario',[['Clave','Concepto','Fecha','Cantidad','Unidad'],...project.concepts.flatMap(c=>(c.daily||[]).map(d=>[c.code,c.description,date(d.date),d.quantity,c.unit]))]),
 sheet('Avances al corte',[['Concepto','Desde','Hasta','Acumulado %'],...project.progress.filter(r=>r.end<=cutoff).map(r=>[project.concepts.find(c=>c.id===r.conceptId)?.description||'',date(r.start),date(r.end),r.percent])]),
 sheet('Gastos al corte',[['Fecha','Descripción','Categoría','Sin IVA','IVA %','Total'],...project.expenses.filter(e=>e.date<=cutoff).map(e=>[date(e.date),e.label,e.category,e.amount,e.iva,e.amount+Math.round(e.amount*e.iva)/100])]),
 sheet('Curva S',[['Fecha','Programa','Ejecutado','Gastos'],...projectSeries(project,cutoff).map(p=>[date(p.date),p.pv,p.date<=cutoff?p.ev:null,p.date<=cutoff?p.ac:null])]),
 sheet('Inventario e insumos',[['Nombre','Tipo','Unidad','Cantidad de referencia','Precio sin IVA','Especificaciones'],...(project.resources||[]).map(r=>[r.name,r.kind,r.unit,r.quantity,r.price,r.notes])]),
 sheet('Efectivo al corte',[['Fecha','Descripción','Tipo','Importe'],...(project.cash||[]).filter(e=>e.date<=cutoff).map(e=>[date(e.date),e.label,e.kind==='income'?'Entrada':'Pago',e.amount])])];
 const blob=await writeExcel(sheets).toBlob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Trazal-reporte.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
