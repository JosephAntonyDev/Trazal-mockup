# Contribuir a Trazal

Empieza por el [plan del equipo y criterios de aceptación](https://github.com/JosephAntonyDev/Trazal-API-TS/blob/main/docs/TRABAJO-EN-EQUIPO.md) y el README de este repositorio. La guía central distingue lo implementado, lo simulado y lo pendiente de prueba real.

## Primera contribución

1. Instala las herramientas del README (Node 24 para API/mockup; Windows y Build Tools/.NET Framework 4.8 para escritorio).
2. Ejecuta las comprobaciones antes de modificar código:

   ```powershell
   npm ci
   npm test
   npm run build
   ```

3. Toma una tarea acotada del plan, anota responsable y criterio de aceptación en un issue; crea una rama `fix/descripcion` o `feat/descripcion` desde `main` actualizado.
4. Repite las comprobaciones pertinentes, revisa `git diff` y abre un PR con evidencia. La plantilla solicita impacto en datos, otros repositorios y validación visual cuando corresponda.
5. Solicita revisión de otro integrante antes de fusionar. Las reglas remotas de protección de ramas todavía deben configurarse; este documento y el workflow no las habilitan por sí solos.

## Comprobaciones automáticas

`.github/workflows/validate.yml` comprueba cada PR, push a `main` o ejecución manual. Usa los mismos comandos anteriores, sin autenticación real, migraciones ni despliegues. Tiene permisos de lectura y cancela ejecuciones anteriores de la misma rama. La compilación en GitHub requiere que Actions esté habilitado; revisar su primer resultado antes de exigirlo como control obligatorio.

El workflow no publica paquetes ni configura credenciales. Las pruebas automáticas no certifican Windows 7, Google real o sincronización real en Neon. Referencias de las acciones: [checkout](https://github.com/actions/checkout) y [setup-node](https://github.com/actions/setup-node).

## Reglas compartidas

- Cálculos y datos: conservar decimales, IVA pendiente frente a cero, línea base aprobada y avances acumulados. No alterar silenciosamente obras existentes.
- API: dominio y casos de uso sin dependencias de HTTP/Firebase/PostgreSQL; adaptadores en sus módulos. Nunca aceptar el propietario del documento como identidad autenticada.
- Escritorio: primero SQLite; los fallos de red no impiden trabajar localmente. Probar cambios de cuenta sin mezclar datos.
- Mockup: datos ficticios y acceso de demostración, sin Firebase ni backend real. Una vista de muestra no demuestra paridad con escritorio.
- No incluir JSON OAuth, `authsettings.json`, `.dev.vars`, tokens, bases SQLite, respaldos ni Excel del cliente en Git o en issues. Usar datos ficticios para reproducir errores.
- Un push a `main` de API puede desplegar en Cloudflare; en mockup puede desplegar en Vercel. No actualiza el EXE ni aplica migraciones. Producción no es la base de pruebas.
