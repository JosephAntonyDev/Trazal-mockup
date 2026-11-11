# Trazal-mockup

Prototipo local e interactivo en React, TypeScript y Vite para revisar con el ingeniero la futura aplicación de escritorio de control de obra. Usa la identidad amarilla Linde de Trazal y un caso de obra ficticio.

## Actualización de la reunión del 10 de noviembre

La entrada ahora es **Mis obras**. Permite crear obras independientes, capturar o pegar catálogos de Excel, componer precios, configurar IVA, programar cantidades diarias y fijar la línea base antes de registrar avances y gastos. Incluye avance acumulado por porcentaje o cantidad, bloqueo al 100 %, compras con fecha y cantidades, CPI/SPI, observaciones, reporte y respaldo de obras.

El flujo nuevo utiliza `trazal-projects-v2`. **Respaldar obras** exporta todo; **Recuperar respaldo** agrega copias sin sustituir obras existentes. El caso anterior se conserva en su propia tarjeta y mantiene sus sesiones independientes. Los respaldos antiguos se abren dentro de ese caso, desde su selector de obra.

Consulta [las reglas, el ejercicio de demostración y la propuesta para Flutter](docs/reunion-2026-11-10.md). El PDF de la reunión anterior describe el caso anterior; no cubre todavía este nuevo recorrido.

La importación por pegado recibe cinco columnas: clave, descripción, unidad, cantidad y precio integrado sin IVA. Todavía no se procesan archivos Excel arbitrarios. Las estimaciones para cobro, penalizaciones, inventario y correcciones formales requieren reglas y formatos del ingeniero.

## Llevarlo a la reunión

Ejecuta `npm run build` y abre **`dist/Trazal-demo.html`** en Chrome o Edge. El HTML reúne la aplicación, las fuentes, los logos y los datos ficticios. Puedes copiar ese archivo a otra computadora y abrirlo sin servidor.

Al terminar, usa **Exportar sesión** y **Revisión con el ingeniero → Exportar acuerdos**. El guardado automático depende del navegador, especialmente al abrir archivos locales. Puedes recuperar el respaldo JSON desde el selector de obra. La exportación CSV se abre en Excel y el reporte ofrece **Imprimir / PDF**.

La copia original de la reunión se conserva localmente en `Trazal-demo-reunion.zip`. El equipo que tenga el conjunto de datos de la reunión en `.analysis/source-data.reunion.json` puede abrirlo con `npm run dev -- --mode reunion`. Esa carpeta está excluida de Git.

## Desarrollo

Con Node compatible con Vite 8 (22.12+ o 24+) y npm:

```powershell
npm ci
npm run dev
```

Abre `http://127.0.0.1:5175`. Para verificar y generar la entrega:

```powershell
npm test
npm run build
```

## Recorrido del caso anterior (20–30 minutos)

1. **Resumen.** Elegir el corte 12 y revisar PV, EV, AC e indicadores en la curva.
2. **Archivos de origen:** revisar calendario, presupuesto base, vínculos externos y los totales que necesitan aclaración.
3. **Presupuesto:** buscar y filtrar los 30 conceptos; abrir su descripción, importe y referencia de celda. El P.U. es deducido, no un análisis de precios unitarios.
4. **Programa:** consultar la distribución mensual original y ensayar fechas. La comparación lineal propuesta se muestra separada del PV del archivo.
5. **Avance:** probar 1 m³ de concreto hidráulico; revisar la valuación y el incremento de EV desde el corte elegido. No permite sobrepasar la cantidad restante del catálogo.
6. **Costos:** agregar un costo de prueba y observar AC, CPI y EAC. Revisar la fórmula de cada indicador en **Curva S y desempeño**.
7. **Flujo:** revisar entradas, salidas y estado de resultados. El ejercicio de caja es independiente; el XLS indica 2023 y no se mezcló con los cortes de 2026.
8. **Cortes y reportes:** guardar una fotografía de los indicadores, volver a seleccionarla y preparar el PDF.
9. **Revisión:** anotar respuestas, marcar criterios y exportar acuerdos y sesión antes de cerrar.

## Qué funciona en el caso anterior

Diez vistas, filtros y búsquedas, detalle por concepto, 16 cortes, gráfico acumulado, cálculo de valor ganado, capturas simuladas de avance/costo, escenario de fechas y BAC, ejercicio de caja, borradores de reporte, notas, acuerdos, exportaciones CSV/JSON/Markdown y recuperación de sesión JSON. Todo se ejecuta en el navegador; no hay cuentas, telemetría ni API externa.

## Alcance y decisiones abiertas

El caso público usa datos ficticios precargados que siguen la estructura de cuatro libros. El recorrido de importación es demostrativo y las referencias de celda muestran cómo se relacionan el presupuesto, el avance, la curva y el flujo.

El caso incluye diferencias de fechas y presupuestos, referencias inconsistentes en la semana 9, suma de acumulados y mezcla de porcentajes con pesos. Las nueve preguntas del módulo de revisión documentan estos casos para validarlos con el ingeniero.

Las cantidades capturadas se valúan proporcionalmente al importe original. Se conserva precisión interna y se redondea al presentar; el ingeniero debe acordar la regla definitiva. Los avances iniciales por concepto corresponden al total del libro, no al corte seleccionado. Los nuevos registros son adiciones de simulación sobre esa referencia y se distinguen de los originales.

Quedan por definir para Flutter: edición y versionado completo de presupuesto/APU, importador real con mapeo y validación, calendarios y precedencias, rendimientos, estimaciones/anticipos/amortizaciones, impuestos, autorizaciones, archivos por obra, respaldo, licencias e instalador. La maqueta sirve para decidir su alcance.

## Organización

- `src/Works.tsx` y `src/works.css`: gestión de obras y flujo aprobado después de la reunión.
- `src/project-core.mjs` y `src/project-core.test.mjs`: presupuesto, programa diario, avance acumulado, gastos y validación de respaldos.

- `src/source-data.json` contiene el catálogo, la serie, el flujo y las referencias del caso ficticio.
- `src/core.mjs`: cálculos independientes de la interfaz.
- `src/core.test.mjs`: cotejo numérico de fórmulas y reglas de simulación.
- `src/review-data.ts`: criterios pendientes y fórmulas con celdas de origen.
- `src/App.tsx` y `src/styles.css`: recorrido, pantallas e identidad visual.
- `scripts/portable.mjs`: genera el HTML autónomo a partir de `dist`.
- `public/fonts`: fuentes y licencias OFL.
