# Plan por etapas — Registro de guardias en feriados

Contexto completo en `CLAUDE.md`. Preguntas pendientes en `PREGUNTAS_ABIERTAS.md`.
Cada etapa se entrega funcionando y con demo para RRHH antes de pasar a la siguiente.

## Etapa 0 — Base del proyecto

**Requiere:** repositorio en el GitHub de IT y dos proyectos de Firebase nuevos (dev y prod).

- Crear el repo con la estructura de `CLAUDE.md` §11 y copiar `CLAUDE.md`, `PLAN.md` y
  `PREGUNTAS_ABIERTAS.md`.
- Vite + React + TypeScript + Tailwind + react-icons en `web/`, Functions en TypeScript en
  `functions/`.
- Firebase Emulator Suite configurado (Auth, Firestore, Functions, Hosting).
- Login con Google restringido a `@tbo.group` y `@gobetween.lsp.com` (blocking function + reglas).
- Custom claim `hr_admin` y un script para asignar el primer admin.
- CI básico: lint, typecheck y tests en cada PR.

**Listo cuando:** alguien de los dos dominios puede loguearse en dev y alguien de afuera no.

## Etapa 1 — Datos maestros y panel de RRHH (base)

- ABM de países (código, nombre, nombre en inglés, zona horaria, fuente de feriados). Arrancar con
  AR, PE, VN y UA.
- ABM de personas (email, nombre, país, líder, área) con importación desde el Excel de RRHH
  (CSV/Sheet).
- Calendario de feriados por país y año:
  - Importar desde Nager.Date (callable function) como borrador, solo feriados nacionales.
    Verificar cobertura de AR, PE, VN y UA; si falta alguno, proveedor alternativo.
  - Revisar, editar, cancelar, confirmar; agregar días propios de la empresa.
  - Reimportación sin pisar ediciones de RRHH.
- Ajustes de campaña (`settings/campaign`): plazos, modo de aprobación, remitente, firma.
- Reglas de Firestore y tests de reglas para países, personas, feriados y ajustes.

**Listo cuando:** RRHH puede dejar cargado el año completo de feriados de todos los países y la lista
de personas con su país y líder.

## Etapa 2 — Formulario autogestionado (hilo 2)

- Vista de la persona: sus próximos feriados y, con la campaña abierta, el botón "Voy a trabajar"
  para cargar horario desde/hasta y nota. Solo carga quien trabaja; no hay opción "No trabajo".
  Puede editar o borrar su registro hasta el cierre.
- Link directo `/cargar/:holidayId` para usar desde el mail.
- Vista del líder (`/equipo`): quién de su equipo cargó por feriado y, según `approvalMode`,
  aprobar o rechazar con un click.
- Campaña por feriado (`campaignStatus`): RRHH la abre y cierra a mano en esta etapa.
- Panel de RRHH: seguimiento por feriado (quién cargó, por país y área, aprobaciones pendientes);
  carga y edición en nombre de cualquiera.
- Tests de reglas para `workers` (cada persona solo el suyo, el líder solo aprueba, RRHH todo).

**Listo cuando:** se puede correr un feriado real de punta a punta sin el Sheet, aunque los mails
todavía los mande RRHH a mano.

## Etapa 3 — Vista para tbonet (hilo 3)

- Vista pública `/feriados`: próximos feriados agrupados por país, con quién trabaja y en qué
  horario, filtrable por área.
- Vista de un feriado `/feriados/:holidayId` (destino del botón "Click here" del mail).
- Visible para cualquier persona logueada de la empresa.
- Integración con tbonet (PHP) por **link/botón**: coordinar con el equipo de diseño dónde va.

**Listo cuando:** desde tbonet se llega a la lista de quién trabaja el próximo feriado.

## Etapa 4 — Mails automáticos (hilo 4)

- IT habilita la service account con delegación de dominio y `gmail.send` para la cuenta de
  development (si no, SMTP relay de Workspace).
- Plantillas HTML: invitación a las personas del país, recordatorio, pedido de aprobación al líder,
  y anuncio masivo replicando "PUBLIC HOLIDAYS SCHEDULE" (asunto "Public holidays DD/MM in <país>",
  firma de Marti).
- Función programada diaria que, por cada feriado confirmado y en la zona horaria del país:
  1. Abre la campaña **10 días** antes y avisa a todas las personas de ese país.
  2. **5 días** antes, recordatorio a las personas del país que no cargaron nada (texto opcional,
     "si vas a trabajar...") y resumen a cada líder de quién de su equipo cargó.
  3. **3 días** antes cierra la campaña y manda el anuncio a toda la empresa con el link a la vista.
- Botones en el panel para reenviar o enviar a mano cualquier mail.
- `mailLog` visible para RRHH; modo `DRY_RUN` fuera de prod.

**Listo cuando:** un feriado confirmado pasa por todo el ciclo sin intervención de RRHH.

## Etapa 5 — Puesta en producción y mejoras (opcional)

- Piloto con Perú en paralelo al proceso actual, luego todos los países.
- Sincronización de personas y líderes desde el Directory API de Workspace.
- Exportar a Sheet/CSV para RRHH.

## Correspondencia con los hilos del proyecto

| Hilo | Etapas |
|---|---|
| 1. Arquitectura y CLAUDE.md | Este documento |
| 2. Formulario | Etapas 0, 1 y 2 |
| 3. Vista para tbonet y panel de RRHH | Etapa 3 (el panel base ya sale en la etapa 1) |
| 4. Mails automáticos | Etapa 4 |
