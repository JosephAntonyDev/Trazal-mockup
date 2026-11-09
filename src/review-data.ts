import source from './source-data.json';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const money = (value: number) => currency.format(value);
const shortDate = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const conceptEarned = source.concepts.reduce((total, concept) => total + concept.earned, 0);
const [cashFile, progressFile, curveFile, programFile] = source.files.map(file => file.name);

export const questions = [
 {id:'budget',title:'¿Cuál es el presupuesto de referencia?',detail:`La curva usa un BAC de ${money(source.bac)}. El catálogo suma ${money(source.sourceTotals.budget)} y la distribución diaria suma ${money(source.sourceTotals.schedule)}. Confirmar alcance, IVA y redondeo antes de elegir una base.`,source:`${curveFile} · Hoja1!B12. ${programFile} · G24:G141, DJ146`,priority:'Alta'},
 {id:'calendar',title:'Confirmar el calendario y la fecha de corte',detail:`El flujo corresponde a ${source.cashYear} y la curva a ${source.weeks[0].date.slice(0, 4)}. El programa comienza el ${shortDate.format(new Date(source.project.start))} y el avance el ${shortDate.format(new Date(source.project.realHeaderStart))}. Confirmar qué calendario y fecha de corte usar.`,source:'FLUJO DE EFECTIVO OPERACION!F2:F3. Programa!I7:I9, I16. Real!I7:I9. Curva!Hoja2!A25:A40',priority:'Alta'},
 {id:'week9',title:'Revisar los vínculos de la semana 9',detail:'El PV de la semana 9 apunta al flujo de efectivo en vez del programa. El AC toma una columna anterior y disminuye respecto de la semana 8. La curva conserva estos valores para mostrar la diferencia.',source:`${curveFile} · Hoja2!D33:E33`,priority:'Alta'},
 {id:'accumulated',title:'Evitar sumar acumulados como si fueran importes del periodo',detail:`El total ejecutado es ${money(source.sourceTotals.earned)}. Sumar los acumulados de cada periodo produciría ${money(source.sourceTotals.sumAccumulatedIncorrect)}. El mockup usa el acumulado de cada corte.`,source:`${progressFile} · DB145:DB146`,priority:'Alta'},
 {id:'mixedTotals',title:'Separar porcentajes e importes al sumar el avance',detail:`La fila 145 mezcla importes y fracciones de avance. Los importes suman ${money(conceptEarned)} y el total con fracciones es ${money(source.sourceTotals.earned)}. La diferencia de ${money(source.sourceTotals.earned - conceptEarned)} requiere revisión.`,source:`${progressFile} · I145 = SUM(I23:I143), DB145. Filas de importe DB24:DB141`,priority:'Alta'},
 {id:'earned',title:'¿El avance se captura en cantidades o porcentajes?',detail:'El libro de avance multiplica el importe del concepto por una fracción de avance. La maqueta permite capturar cantidades y valuarlas proporcionalmente al importe. El precio unitario mostrado se deduce de importe ÷ cantidad.',source:`${progressFile} · I35 = $G$35*I34. Programa!D34, G35`,priority:'Media'},
 {id:'cost',title:'Definir costo incurrido, pago y flujo de caja',detail:'El AC de la curva toma el acumulado de costos directos e indirectos del flujo. Confirmar si incluye compromisos, pagos, IVA y anticipos. Los costos de simulación modifican AC. Los movimientos de caja se prueban aparte para no mezclar periodos.',source:`${curveFile} · Hoja2!E36. FLUJO DE EFECTIVO OPERACION · fila 262`,priority:'Alta'},
 {id:'forecast',title:'Validar proyección y plazo',detail:'El modelo reproduce EAC=BAC/CPI y CV%=CV/EV. Q12 y R12 usan una constante 1 en las fórmulas de plazo. El significado de esta constante y su unidad requieren confirmación.',source:`${curveFile} · Hoja1!H12, M12:R12`,priority:'Media'},
 {id:'scope',title:'Acordar reportes y alcance de la primera versión',detail:'Definir con el ingeniero qué pertenece al control de obra y qué seguirá en contabilidad. Confirmar formato de reporte, respaldos y Windows como plataforma.',source:`${cashFile} · 7 hojas`,priority:'Media'},
];
export const formulaInfo: Record<string,{label:string;formula:string;note:string;cell:string}> = {
 cv:{label:'Variación de costo',formula:'CV = EV − AC',note:'Negativo: el costo supera el valor del trabajo ejecutado.',cell:'G12'},
 cvPercent:{label:'Variación de costo (%)',formula:'CV% = CV ÷ EV',note:'Se conserva el denominador EV que usa el archivo del ingeniero.',cell:'H12'},
 cpi:{label:'Desempeño de costo',formula:'CPI = EV ÷ AC',note:'Menor que 1: se gasta más por cada peso de valor ejecutado.',cell:'I12'},
 sv:{label:'Variación de programa',formula:'SV = EV − PV',note:'Se expresa en pesos de valor ganado, no en días de retraso.',cell:'J12'},
 svPercent:{label:'Variación de programa (%)',formula:'SV% = SV ÷ PV',note:'Compara trabajo ejecutado con el valor planeado.',cell:'K12'},
 spi:{label:'Desempeño de programa',formula:'SPI = EV ÷ PV',note:'Mayor que 1: más valor ejecutado que el previsto al corte.',cell:'L12'},
 eac:{label:'Costo estimado al terminar',formula:'EAC = BAC ÷ CPI',note:'Supone que el desempeño de costo observado se mantiene. No es un presupuesto autorizado.',cell:'M12'},
 etc:{label:'Costo pendiente estimado',formula:'ETC = EAC − AC',note:'Estimación de costo por ejecutar bajo el supuesto de EAC.',cell:'N12'},
 vac:{label:'Diferencia al terminar',formula:'VAC = BAC − EAC',note:'Negativo: proyección por encima del presupuesto de referencia.',cell:'O12'},
 tcpi:{label:'Desempeño necesario',formula:'TCPI = (BAC − EV) ÷ (BAC − AC)',note:'No se calcula si el presupuesto restante para costo es cero o negativo.',cell:'P12'},
 tc:{label:'Plazo según ejecutado · por validar',formula:'Tc = 1 + (BAC − EV) ÷ EV',note:'Transcripción de Q12. La constante 1 y la unidad temporal requieren aclaración; no representa una fecha confiable.',cell:'Q12'},
 tcPlan:{label:'Plazo según programa · por validar',formula:'Tc = 1 + (BAC − EV) ÷ PV',note:'Transcripción de R12. Se conserva para la conversación, sin convertirla a una fecha.',cell:'R12'},
};
