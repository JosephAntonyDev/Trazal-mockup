# Trazal-mockup

Prototipo local e interactivo en React, TypeScript y Vite para revisar con el ingeniero la futura aplicación de escritorio de control de obra. Usa la identidad amarilla Linde de Trazal y un caso de obra ficticio.

## Plan de la aplicación de escritorio

El primer usuario necesita Windows 7. La app de escritorio ya se desarrolla por separado en C# + WPF + .NET Framework 4.8 y SQLite; falta validarla en Windows 7 SP1 real. El [plan inicial](docs/plan-app-escritorio.md) conserva la evaluación anterior. Este repositorio sigue siendo el mockup React para revisar la experiencia; no incluye login, registro ni Firebase.

## Actualización de la reunión del 10 de noviembre

La entrada ahora es **Mis obras**. Permite crear obras independientes, capturar o pegar catálogos de Excel, componer precios, configurar IVA, programar cantidades diarias y fijar la línea base antes de registrar avances y gastos. Incluye avance acumulado por porcentaje o cantidad, bloqueo al 100 %, compras con fecha y cantidades, CPI/SPI, observaciones, reporte y respaldo de obras.

El flujo nuevo utiliza `trazal-projects-v2`. **Respaldar obras** exporta todo; **Recuperar respaldo** agrega copias sin sustituir obras existentes. El caso anterior se conserva en su propia tarjeta y mantiene sus sesiones independientes. Los respaldos antiguos se abren dentro de ese caso, desde su selector de obra.

Consulta [las reglas, el ejercicio de demostración y la propuesta para Flutter](docs/reunion-2026-11-10.md). El PDF de la reunión anterior describe el caso anterior; no cubre todavía este nuevo recorrido.

La importación por pegado recibe cinco columnas: clave, descripción, unidad, cantidad y precio integrado sin IVA. **Importar XLSX** permite seleccionar hoja, rango y columnas, revisar filas válidas/inválidas y confirmar la selección antes de agregarla al presupuesto. Incluye precio en la fila siguiente. Lee valores guardados; no recalcula fórmulas ni importa el programa original. Límite para la demostración: 5 MB, 50 hojas, 10000 filas por hoja y 100 columnas. Para XLS antiguo, guardar una copia XLSX o pegar el catálogo; el escritorio sí dispone de lector XLS. Las estimaciones para cobro y correcciones formales siguen pendientes de acordar.

## Buscar obras y conservar sus precios

El inicio permite buscar por nombre, tipo, alcance, clave o descripción de conceptos, sin distinguir acentos ni mayúsculas. Se combinan filtros de tipo, estado del programa y periodo contractual (coincidencia de al menos un día). En Fechas, usa **Aplicar periodo**. Ordena por nombre, término o mayor presupuesto, y limpia los filtros para recuperar toda la lista. El caso de referencia aparece separado de los resultados.

Cada obra conserva sus precios. Las fichas visuales solo comparten nombre, fotografía y unidad sugerida; no hay una tarifa global. Actualizar un precio en una obra no cambia otras. El presupuesto aprobado sigue fijo y cada compra posterior registra su importe y fecha por separado.

## Catálogo visual y recordatorios

**Inventario e insumos** tiene fichas independientes del catálogo de trabajos. Incluye fotos de referencia para cemento, arena, grava, tubo de cobre, concreto, blocks, varillas y excavación. Permite agregar otros insumos, buscar por nombre, filtrar materiales/servicios/equipo y editar nombre, unidad, cantidad, precio y especificaciones por obra. Cantidad y precio pueden quedar pendientes; cero y pendiente se conservan como valores diferentes.

**Registrar compra** prepara el formulario con la descripción, unidad, cantidad y un importe sugerido (cantidad × precio) cuando ambos existen. Se revisan fecha, importe y categoría antes de guardar el gasto; el IVA sigue siendo opcional. No actualiza el presupuesto fijo ni genera avance. Las cantidades de la ficha son de referencia; no hay entradas/salidas ni cálculo de existencias de almacén. Excavación es un servicio/trabajo.

El presupuesto conserva **Nuevo concepto** para los trabajos medibles: «Construcción de banqueta de concreto» es diferente a comprar cemento. El costo directo permite añadir utilidad; el precio integrado evita sumarla dos veces. No hay conversiones automáticas entre unidades.

El resumen incluye un recordatorio editable de plazo. Las penalizaciones son externas y no afectan cálculos. Las fotos se sirven localmente y se incluyen también en el HTML autónomo; sus [créditos y licencias](public/materials/CREDITS.md) aparecen en las fichas.

## Recorrido actualizado del mockup

En **Mis obras**, pulsa **Cargar obra de ejemplo** para revisar una obra ficticia completa sin capturarla desde cero. Las obras previas se conservan. Puedes crear otras, filtrar la lista y editar título, tipo y alcance dentro de cada obra. Guardar se deshabilita hasta completar los obligatorios o cambiar un formulario de edición.

- **Catálogo y presupuesto:** capturar trabajos, pegar catálogo o importar XLSX con revisión; precios e IVA propios de la obra.
- **Programa de obra:** fechas, distribución diaria revisable y fijación de línea base. Se conserva al capturar avance/gasto.
- **Avance real:** acumulados por cantidad o porcentaje, límite del 100 % y rechazo de fechas futuras.
- **Inventario e insumos:** fichas y compra con precio libre por obra, sin control físico de almacén.
- **Gastos y compras:** categorías, calendario, IVA opcional y edición de registros sin duplicarlos.
- **Curva S y desempeño:** vista propia, programa azul fijo, avance gris y gastos rojos escalonados; indicadores y tabla de valores. Las compras previas al programa se incluyen. El detalle se puede exportar como CSV.
- **Flujo de efectivo:** entradas y pagos separados de los gastos. Consulta el saldo al corte, edita movimientos y exporta CSV. Los pagos no se suman a AC; se evita contar la misma compra dos veces. El saldo empieza en cero.
- **Acuerdos y reporte:** presupuesto, programa, historial de avances, categorías, detalle de gastos y gráfica, con impresión/PDF y Excel de ocho hojas. La hoja Curva S contiene datos; la gráfica aparece en el PDF.
- **Respaldos:** vista previa de obras y conteos; exige confirmar antes de recuperar copias. Conserva insumos y efectivo, además del contenido anterior. No reemplaza las obras existentes.

Perfil con placeholders, temas claro/oscuro/sistema y selector de sección en móvil. Todo se guarda en el navegador y se puede respaldar en JSON; no hay cuenta, nube ni sincronización en este mockup. La futura web partirá de otro proyecto.

Verificación: `npm test` (31 casos), compilación TypeScript/Vite, pruebas en Chrome de formularios, XLSX, reportes, respaldos, persistencia y vista móvil. No usar este prototipo como control contable real.

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

## Formularios y perfil local

- Al crear una obra, solo título y tipo son obligatorios. Dimensiones e IVA son opcionales. Las fechas se definen después en el programa; el IVA vacío queda pendiente (distinto de 0 %).
- En Programa de obra se define el plazo y se ajustan las fechas de cada concepto. Cambiar las fechas de un concepto requiere revisar su distribución diaria. El programa no se fija sin fechas, IVA confirmado, precios y cantidades diarias completos.
- IVA pendiente se guarda como `null`, distinto de una tasa confirmada de 0 %. El total con IVA se muestra «Por definir» hasta configurarlo; los respaldos anteriores siguen siendo válidos.
- Los campos obligatorios llevan asterisco. Crear requiere campos válidos; editar requiere además un cambio respecto al valor inicial. Revertir el cambio deshabilita Guardar. Esta regla también se aplica a los formularios de la demo de referencia.
- El avatar abre una página completa de perfil local (nombre, apellido, correo, teléfono y empresa), con regreso a la obra o al inicio. El saludo usa el nombre guardado. No hay autenticación ni conexión con Firebase en el mockup; se revisará para Flutter. El perfil se almacena aparte del respaldo de obras.

- Las modales bloquean el desplazamiento del documento y cubren la pantalla completa. En pantallas de poca altura, se desplaza el contenido de la modal; al cerrarla se recupera la posición de la página.


## Apariencia

El selector de la cabecera ofrece **Claro**, **Oscuro** y **Sistema** en el inicio, las obras, la demo de referencia y el perfil. La elección se guarda en `trazal-theme-v1`, se comparte entre pestañas del mismo origen y no modifica las obras. Sistema es la opción inicial y sigue los cambios de apariencia del equipo. Sin almacenamiento disponible, el tema funciona durante la sesión.

`src/Theme.tsx` gestiona la preferencia; `src/theme.css` define la paleta oscura y los ajustes de contraste. Los estilos existentes usan colores claros de respaldo en sus variables. Las curvas conservan azul (programa), gris (avance) y rojo (gasto) con tonos más claros en oscuro. La paleta oscura se limita a pantalla para conservar la impresión clara. El HTML autónomo incluye ambos temas.
