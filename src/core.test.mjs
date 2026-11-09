import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {earnedValue,buildSeries,earnedFromQuantity,cashRollforward,linearPlanned,validateWorkspace} from './core.mjs';
const source=JSON.parse(fs.readFileSync(new URL('./source-data.json',import.meta.url),'utf8'));
test('Corte 12 coincide con los valores de referencia del caso ficticio',()=>{
 const m=earnedValue({bac:source.bac,...source.weeks[11]});
 for(const [key,reference] of Object.entries(source.sourceMetrics))assert.ok(Math.abs(m[key]-reference.value)<1e-7,`${key}: ${m[key]} / ${reference.value}`);
});
test('Las simulaciones afectan su corte y los siguientes, nunca los anteriores',()=>{
 const out=buildSeries(source.weeks,[{week:12,amount:100}],[{week:13,amount:80}]);
 assert.equal(out[10].ev,source.weeks[10].ev);assert.equal(out[11].ev,source.weeks[11].ev+100);assert.equal(out[11].ac,source.weeks[11].ac);assert.equal(out[12].ac,source.weeks[12].ac+80);
});
test('Denominadores nulos no producen infinito ni falso cero',()=>{
 const z=earnedValue({bac:100,pv:0,ev:0,ac:0});assert.equal(z.cpi,null);assert.equal(z.spi,null);assert.equal(z.eac,null);assert.equal(z.cvPercent,null);
 assert.equal(earnedValue({bac:100,pv:50,ev:30,ac:100}).tcpi,null);
});
test('Cuantificación y distribución inclusiva conservan el importe',()=>{
 assert.equal(earnedFromQuantity(25,100,1000),250);assert.throws(()=>earnedFromQuantity(-2,10,100));
 assert.equal(linearPlanned(1000,'2026-07-01','2026-07-10','2026-07-05'),500);
 assert.equal(linearPlanned(1000,'2026-07-01','2026-07-10','2026-08-01'),1000);
});
test('Caja y presupuesto concilian sin sumar subtotales dos veces',()=>{
 const cash=cashRollforward(source.cash);assert.ok(Math.abs(cash.at(-1).closing-source.profit.operatingProfit)<0.01);
 assert.ok(Math.abs(source.concepts.reduce((s,c)=>s+c.amount,0)-source.sourceTotals.budget)<0.01);
 const moneyOnly=source.concepts.reduce((s,c)=>s+c.earned,0);
 const fractions=source.concepts.reduce((s,c)=>s+c.progress,0);
 assert.ok(Math.abs(moneyOnly+fractions-source.sourceTotals.earned)<0.005,'El caso de prueba incluye un total que mezcla importes y fracciones');
});
test('Respaldo inválido no sustituye la sesión',()=>{assert.throws(()=>validateWorkspace({},[]));});
