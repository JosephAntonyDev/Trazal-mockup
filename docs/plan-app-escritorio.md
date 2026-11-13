# Trazal · Plan para iniciar la aplicación de escritorio

Preparado el 12 de noviembre de 2026; actualizado el 13 de noviembre. Estado: propuesta para acordar con el equipo; todavía no se ha iniciado la aplicación de escritorio.

## 1. La decisión que cambia con Windows 7

La elección anterior fue **Flutter + Dart**, aprovechando la experiencia del equipo. React + TypeScript + Vite se utilizó para el mockup.

El primer usuario necesita Windows 7. Flutter actual documenta Windows 10 y 11 como plataformas Windows admitidas y Windows 8 y anteriores como no admitidas. No podemos prometer compatibilidad comercial con Windows 7 usando Flutter actual. Las versiones antiguas y los parches comunitarios implican mantener y probar un conjunto distinto de motor y dependencias. [Matriz oficial de Flutter](https://docs.flutter.dev/reference/supported-platforms).

| Condición del producto | Ruta propuesta | Consecuencia |
| --- | --- | --- |
| Windows 7 es obligatorio | C# + WPF + .NET Framework 4.8, con SQLite local | Aplicación Windows; validar instalador, bibliotecas y rendimiento en Windows 7 SP1 real. |
| Se puede utilizar un equipo con Windows admitido por Flutter | Mantener Flutter + Dart | Aprovecha la experiencia del equipo y facilita una aplicación móvil futura. |

**Recomendación bajo el requisito actual: evaluar primero C# + WPF + .NET Framework 4.8.** Es una propuesta de cambio respecto a Flutter, pendiente de que el equipo la acepte. No desarrollar dos interfaces en paralelo para el primer piloto.

Microsoft enumera .NET Framework 4.8 como instalable en Windows 7 SP1 de 32 y 64 bits. Esto no devuelve soporte a Windows 7 ni garantiza las bibliotecas de terceros. .NET Framework 4.8.1 no es el objetivo para Windows 7. [Requisitos oficiales](https://learn.microsoft.com/en-us/dotnet/framework/get-started/system-requirements).

Podemos recrear la identidad amarilla de Trazal, los temas y la distribución moderna con estilos WPF. Las pantallas, ayudas, flujos y ejemplos del mockup sirven de especificación; sus componentes React no se convierten automáticamente a WPF o Flutter.

## 2. Datos que necesitamos del equipo del ingeniero

Información provisional aportada por Joseph el 13 de noviembre: probablemente Windows de 64 bits y entre 4 y 8 GB de RAM. No se ha comprobado la ficha del equipo ni la presencia de Service Pack 1.

Para diseñar y medir rendimiento, tomar **4 GB de RAM como objetivo inicial**; 8 GB será margen adicional. Esto no constituye todavía un requisito mínimo validado. Empezar por evaluar la compilación x64, pero confirmar la arquitectura antes de elegir el instalador definitivo. Esta estimación de hardware no decide el cambio de Flutter a WPF.

Antes de fijar arquitectura del instalador y requisitos mínimos, registrar:

- Edición de Windows 7 y presencia de Service Pack 1.
- Sistema de 32 o 64 bits. Si es de 32 bits, un ejecutable x64 no servirá.
- Procesador, RAM, disco HDD/SSD, espacio libre y tarjeta/controlador gráfico.
- Resolución de pantalla y escala de texto. Probar al menos 1366 × 768 y escala de 100 % / 125 %.
- Versión de .NET Framework instalada y actualizaciones disponibles mediante su área de TI.
- Permisos para instalar y escribir en la carpeta del usuario.
- Versión de Excel, formatos que recibe y ejemplos autorizados de entregables.
- Disponibilidad de internet, restricciones de la empresa y forma actual de respaldar.

La aplicación se desarrollará en una computadora moderna. El Windows 7 será equipo de ejecución y prueba. Una máquina virtual legal ayuda a repetir pruebas, pero también se necesita una prueba en la computadora real por los controladores y el rendimiento.

## 3. Herramientas y descargas

### Ruta propuesta para Windows 7

| Elemento | Dónde se utiliza | Qué preparar |
| --- | --- | --- |
| Visual Studio 2022, con una edición cuya licencia aplique al equipo | Computadoras de desarrollo | Carga **Desarrollo de escritorio de .NET** y herramientas WPF. [Descargas anteriores oficiales](https://visualstudio.microsoft.com/vs/older-downloads/). |
| .NET Framework 4.8 Developer Pack | Computadoras de desarrollo | Referencias para compilar contra 4.8. [Descarga oficial](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net48). |
| .NET Framework 4.8 Runtime, instalador sin conexión | Equipo del ingeniero, si hace falta | El instalador de Trazal comprobará el requisito; la instalación del runtime puede necesitar administrador. [Misma página oficial, opción Runtime](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net48). |
| Git | Computadoras de desarrollo | Repositorio privado nuevo para el producto; cambios revisados y versiones identificables. |
| Proveedor SQLite para .NET Framework | Dependencia incluida en Trazal | Seleccionar y fijar una versión después de comprobar DLL nativa, arquitectura y runtime en Windows 7. No instalar un servidor de bases de datos. |
| Lector XLS/XLSX y generador PDF | Dependencias incluidas en Trazal | Verificar target .NET Framework, licencia comercial y funcionamiento en el equipo real antes de adoptarlos. |
| Inno Setup | Computadora que genera instaladores | Candidato para producir el EXE instalable; el fabricante incluye Windows 7 entre sus destinos. Revisar su licencia comercial vigente. [Información y descargas](https://jrsoftware.org/isinfo.php). |

Visual Studio 2022 permite seleccionar el framework de destino; compilar para él no sustituye las pruebas en el sistema objetivo. [Compatibilidad](https://learn.microsoft.com/en-us/visualstudio/releases/2022/compatibility), [selección del framework](https://learn.microsoft.com/en-us/visualstudio/ide/visual-studio-multi-targeting-overview?view=vs-2022).

Inventario observado en la computadora de Joseph: Flutter y Dart están en PATH, junto con Git, VS Code y dotnet; aparece Visual Studio Build Tools 2022. No apareció el directorio convencional del Targeting Pack de .NET Framework 4.8. Hay que comprobar los componentes en Visual Studio Installer; disponer de `dotnet` o Build Tools no demuestra que el entorno WPF 4.8 esté completo.

Las bibliotecas se agregan al proyecto como paquetes y se distribuyen con la aplicación. El ingeniero recibirá el instalador y sus prerrequisitos, sin instalar el entorno de programación.

### Si se confirma la ruta Flutter

Ya existe Flutter en esta computadora. Verificar la versión, fijar una versión estable del proyecto y completar **Visual Studio con Desarrollo de escritorio con C++** y el SDK que pida `flutter doctor -v`. VS Code y su extensión Flutter sirven para editar; Visual Studio aporta la cadena de compilación Windows. [Configuración oficial para Windows](https://docs.flutter.dev/platform-integration/windows/setup).

Comprobaciones de entorno al iniciar esa ruta:

```powershell
flutter --version
flutter doctor -v
flutter devices
```

Esto prepara Flutter para sus plataformas admitidas; no añade compatibilidad con Windows 7. La configuración para Android se haría cuando entre la captura móvil al alcance.

## 4. Primer hito: demostrar compatibilidad

Construir primero una aplicación mínima con el instalador y las dependencias que se pretenden vender. Debe:

1. Instalar, abrir y cerrar en el Windows 7 SP1 objetivo como usuario normal después de resolver los prerrequisitos.
2. Mostrar un formulario de obra y una tabla representativa con estilo Trazal claro/oscuro.
3. Crear una base local, guardar datos, cerrar y recuperarlos.
4. Leer un XLS y un XLSX de prueba sin ejecutar macros ni requerir automatización de Excel. NPOI es un candidato a evaluar para ambos formatos, sin Office instalado. [Proyecto oficial](https://github.com/nissl-lab/npoi).
5. Generar y abrir un PDF con texto, importes y una gráfica.
6. Crear un respaldo consistente y restaurarlo como copia.
7. Actualizar la aplicación de prueba conservando los datos.
8. Registrar memoria, tiempos y errores de dependencias en el equipo real.

**Criterio de salida:** instalador y dependencias aprobados en Windows 7 real. Hasta entonces, la compatibilidad es un objetivo de ingeniería, no una garantía comprobada.

## 5. Arquitectura de la primera versión

Para la ruta WPF, separar cuatro piezas: interfaz WPF/MVVM; reglas de negocio en C#; persistencia SQLite; importación/exportación. El módulo de cálculos no dependerá de controles de pantalla ni de Excel.

Una base local por obra, más un índice local para el buscador y preferencias del usuario, es la propuesta inicial. Las operaciones de captura se guardarán en transacciones. Incluir versión de esquema, migraciones, identificación de obra y un registro de cambios.

Entidades: Obra, Concepto, PrecioDeObra, ProgramaDiario, VersionDeLineaBase, MedicionAvance, Gasto, Recordatorio, Observacion y Perfil. Los precios pertenecen a su obra; el catálogo visual solo aporta referencias e imágenes.

La línea base aprobada conserva su versión. Las modificaciones autorizadas generan otra versión; corregir una medición requiere dejar registro del dato anterior, motivo, fecha y autor local. El alcance de correcciones y autorizaciones se acuerda con el ingeniero antes de implementarlo.

Usar decimales de precisión definida para cantidades, precios y porcentajes, y una regla explícita de redondeo monetario. No traducir sin revisión el comportamiento de punto flotante del JavaScript de la maqueta.

## 6. Orden de construcción del producto

| Hito | Entrega | Condición para continuar |
| --- | --- | --- |
| 0. Equipo y tecnología | Ficha del Windows 7 y decisión documentada Flutter/WPF | Destino, arquitectura y herramienta acordados. |
| 1. Compatibilidad | Instalador mínimo del apartado anterior | Funciona en el equipo real. |
| 2. Motor numérico | Presupuesto, IVA, PV, EV, AC, CPI y SPI con pruebas independientes | Coincide con ejemplos revisados por el ingeniero. |
| 3. Obras y datos | Buscador, creación, perfil local, SQLite, respaldo y restauración | Persiste al cerrar; recuperación y actualización sin pérdidas. |
| 4. Presupuesto e importación | Conceptos, materiales, precios por obra y lector de catálogo XLS/XLSX con revisión | Importación completa o rechazo explícito; sin mezclar obras. |
| 5. Programa | Fechas, cantidades diarias y aprobación de línea base | Distribuciones cuadran; el aprobado queda protegido. |
| 6. Operación | Avance acumulado, bloqueo al 100 %, gastos y gráficas al corte | Comprar no genera avance; nuevas capturas no cambian el plan. |
| 7. Reportes y piloto | PDF, exportación, recordatorios y paquete de instalación | El ingeniero completa un caso de inicio a fin. |
| 8. Venta | Licencia, activación, actualización, soporte y distribución | Reglas comerciales y funcionamiento sin internet comprobados. |

Primero se define el importador del catálogo que recibe el ingeniero. Leer un archivo no implica interpretar cualquier formato de Excel: habrá mapeo de columnas, vista previa, unidades, fechas, decimales y un informe de errores. El programa y las capturas históricas de los cuatro libros necesitan mapeos propios si se decide migrarlos. Se conserva el archivo de origen y no se ejecutan macros.

Los casos existentes del mockup son material de partida para pruebas, no una certificación de los Excel originales. Debemos contrastar las diferencias de fechas, bases y fórmulas identificadas anteriormente.

## 7. Reglas y validaciones que se conservan

- Crear obra: título y tipo obligatorios; dimensiones e IVA opcionales; fechas posteriores en Programa. Distinguir IVA pendiente de IVA confirmado de 0 %.
- Conceptos con clave, descripción, unidad, cantidad y precio propios de la obra. Confirmar la base de indirectos, utilidad, otros cargos e impuestos antes de producción.
- Suma del programa diario igual a la cantidad del concepto; línea base aprobada fija.
- Avance acumulado por porcentaje o cantidad, sin exceder 100 %. La política de corrección será explícita y auditable.
- Gasto por fecha, material/concepto e importe. Acordar si el rojo significa costo, compra, consumo o pago; son hechos diferentes.
- PV, EV y AC sobre bases comparables; denominadores cero sin índices inventados.
- Temas claro/oscuro/sistema, letras legibles, ayudas contextuales, asteriscos y Guardar condicionado a validez/cambios.
- Penalizaciones: recordatorio. Inventario actual: catálogo visual para presupuestar. Estimaciones oficiales de cobro, almacén, sincronización multiusuario y captura móvil requieren otra definición de alcance.

Caso inicial de aceptación: concepto de 100 unidades a $100 sin IVA; presupuesto $10,000 e IVA ilustrativo de 16 %; programa de 10 unidades diarias durante 10 días. Al día 4, avance acumulado 50 % y gasto sin IVA $6,000: PV $4,000, EV $5,000, AC $6,000, SPI 1.25 y CPI 0.8333. La tasa se usa solo en este ejemplo de prueba.

## 8. Optimización para un equipo antiguo

- Abrir los datos de la obra activa y consultar por páginas; no cargar todas las obras completas al iniciar.
- Virtualizar filas/columnas y consultar solo lo necesario. La virtualización visual de WPF no sustituye la paginación de datos. [Guía de Microsoft](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/advanced/optimizing-performance-controls?view=netframeworkdesktop-4.8).
- Importación, respaldos y cálculos pesados fuera del hilo de interfaz, con progreso y cancelación donde sea seguro.
- Índices por obra, concepto y fecha; escrituras agrupadas y recálculo del corte afectado.
- Evitar una matriz de controles concepto × cada día de toda la obra. Mostrar periodos manejables y conservar el detalle en la base.
- Gráficas con agregación para dibujar, manteniendo todos los datos originales para calcular y exportar.
- Imágenes locales pequeñas, sin efectos de desenfoque continuos y con animación discreta. Verificar controladores y representación por software si la GPU falla.
- Medir compilaciones Release, no la sesión del depurador.

Objetivos iniciales de prueba, sujetos a la ficha del equipo: apertura en hasta 5 segundos, búsqueda/captura común perceptiblemente inmediata y hasta unos 300 MB de memoria con una obra de referencia. Probar primero en un entorno de 4 GB de RAM y repetir en el equipo real; 8 GB no debe ser una condición para el flujo básico que estamos diseñando. Medir con 5,000 conceptos y una prueba mayor; acordar límites después. No son requisitos mínimos ni cifras garantizadas todavía.

## 9. Archivos y respaldos

Los trabajos permanecerán en el equipo del cliente. Guardar automáticamente cada operación confirmada y ofrecer exportación, copia manual y restauración verificable. Proponer un paquete `.trazal` con datos, versión de formato y metadatos; la extensión no significa cifrado.

El respaldo se genera como instantánea consistente de SQLite y se valida antes de ofrecerlo como terminado. La API de backup permite obtener una copia consistente de una base en uso. [Documentación SQLite](https://sqlite.org/backup.html).

Para Drive o SharePoint, exportar primero un respaldo cerrado y transferir ese archivo mediante un mecanismo disponible para el cliente. No depender del cliente de sincronización en Windows 7 ni ubicar la base activa en una carpeta sincronizada compartida. La sincronización entre varios usuarios sería una funcionalidad diferente, con resolución de conflictos y permisos.

## 10. Perfil, cuenta y licencia

Comenzar el piloto con perfil local y operación sin internet. Identidad del usuario, autorización de acceso y licencia comercial son responsabilidades distintas.

La integración Firebase propuesta anteriormente necesita revisión: su guía Flutter advierte que Firebase en Windows está orientado a desarrollo local, no a producción. No dar por resuelto `firebase_auth` para el producto Windows. Si se conserva Firebase como proveedor de identidad, evaluar una integración soportada por API/servicio propio y validar transporte, almacenamiento de tokens y cierre de sesión. [Guía oficial](https://firebase.google.com/docs/flutter/setup).

Antes de vender, definir licencia por usuario/equipo, traslado de máquina, uso sin internet y acceso a actualizaciones. Una licencia firmada puede verificarse localmente; la clave privada permanecerá fuera del instalador. Si la venta es perpetua, distinguir derecho de uso de esa versión y mantenimiento. Las actualizaciones requieren firma, verificación, copia previa y recuperación si la migración falla.

La interfaz del Windows 7 será nativa. Evitar basar el producto en WebView2 moderno, que no incluye Windows 7 entre sus sistemas admitidos. [Plataformas WebView2](https://learn.microsoft.com/en-us/microsoft-edge/webview2).

## 11. Preparación para empezar

1. Obtener la ficha del equipo del ingeniero y tres ejemplos autorizados: catálogo recibido, programa entregado y reporte esperado.
2. Acordar con los colegas el cambio de tecnología que exige Windows 7 o confirmar otro equipo compatible con Flutter.
3. Completar el entorno de la ruta elegida y fijar versiones de herramientas/dependencias.
4. Crear un repositorio privado del producto, independiente del mockup público. Mantener los Excel del cliente y sus datos fuera de repositorios públicos.
5. Construir y probar el instalador mínimo; registrar los resultados y solo entonces iniciar el motor y los módulos.

No se han descargado ni instalado herramientas mediante este plan. La información de compatibilidad procede de la documentación enlazada; la aplicación y sus dependencias todavía requieren validación en Windows 7 real.
