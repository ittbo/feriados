# CLAUDE.md — Registro de guardias en feriados (TBO)

Este archivo es el contexto que necesita cualquier sesión de código que trabaje en este proyecto.
Leelo completo antes de tocar código. El plan por etapas está en `PLAN.md` y las preguntas
pendientes en `PREGUNTAS_ABIERTAS.md` (en esta misma carpeta, o en `docs/` dentro del repo).

## 1. Qué problema resolvemos

TBO trabaja con personas de varios países. Cuando hay un feriado en un país, RRHH necesita saber
quién de ese país va a trabajar ese día y comunicarlo a toda la empresa, porque alguien de otro país
puede necesitar a esa persona (por ejemplo, alguien de Perú que necesita a alguien de IT de Argentina).

**Proceso actual (manual):**

1. RRHH manda un mail a los líderes de cada área con un Google Sheet para completar.
2. Cada líder pregunta a su equipo quién trabaja el feriado.
3. El líder completa la información y reenvía el mail a RRHH.
4. RRHH manda un mail masivo a toda la empresa con una plantilla ("PUBLIC HOLIDAYS SCHEDULE"), por
   ejemplo: *"October 8th (Thursday) will be a public holiday in Peru. Check out the team members who
   will be working on this day on the tbonet: [Click here]"*. Sale desde la cuenta de development y
   lo firma Marti (RRHH).
5. El botón "Click here" lleva a **tbonet** (la intranet de la empresa, hecha en PHP por el equipo de
   diseño), donde se ve la lista de personas que trabajan.

**Objetivo:** que el proceso sea **autogestionado**. Cada persona se entera por mail y carga ella misma
si trabaja el feriado; RRHH solo administra feriados y revisa, y los mails salen solos.

Ojo: se trata de **feriados**, no de vacaciones. El nombre del proyecto en Claude dice "vacaciones"
por error.

## 2. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Plataforma | Web app **React + Firebase**, el stack que ya usa el equipo. **Proyectos de Firebase nuevos** (dev y prod), no se reusan los existentes. |
| Repositorio | En la organización de **GitHub de IT**. |
| UI | **Tailwind CSS** + **react-icons** (set Material Design, `react-icons/md`) para los íconos. Sin Material UI completo. |
| Integración con tbonet | **Solo link/botón** desde tbonet (PHP) y desde el mail a la vista pública de la app. Sin iframe. |
| Login | Google Sign-In con Firebase Auth, **restringido a `@tbo.group` y `@gobetween.lsp.com`**. |
| Feriados | **Por país**, administrados por RRHH en un panel de admin. **Solo feriados nacionales.** |
| Países | Principales: **Argentina (AR) y Perú (PE)**. También **Vietnam (VN), Ucrania (UA)** y otros (lista completa pendiente). |
| Carga de feriados | **Importación** desde Nager.Date + edición manual de RRHH. |
| Días propios de la empresa | Hoy no hay, pero si aparece alguno se carga a mano en el panel igual que un feriado. |
| Personas, país y líder | **Importación desde el Excel de RRHH** (lo tiene Marti) como CSV/Sheet. **Todas las personas tienen líder.** El Directory API de Workspace se puede habilitar, queda como sincronización opcional más adelante. |
| Quién carga | **Autogestionado y solo quien trabaja.** La persona que va a trabajar el feriado carga su día; quien no trabaja no hace nada (no existe la opción "No trabajo"). Quién aprueba (líder, RRHH o nadie) está **pendiente** (ver §5). |
| Datos por persona | **Horario (desde/hasta) y nota libre.** Que exista el registro ya significa que trabaja. |
| Plazos | Aviso **10 días** antes, recordatorio **5 días** antes, cierre y anuncio **3 días** antes (editables por RRHH). |
| Anuncio masivo | A **toda la empresa**, desde la **cuenta de development**, **firmado por Marti**. Asunto del estilo "Public holidays 27/10 in Peru". |
| Visibilidad | Quién trabaja un feriado es visible para **cualquier persona logueada** de la empresa. |
| Envío de mails | **Gmail API con service account y delegación de dominio** (`gmail.send`), impersonando la cuenta de development. IT lo puede habilitar. Si no, SMTP relay de Workspace. |
| Google Workspace add-on | **Descartado como solución principal** (ver §3). |

## 3. Por qué no un add-on de Google Workspace

El equipo ya hizo un add-on para cargar vacaciones, así que es una opción conocida, pero:

- La vista "quién trabaja el feriado" tiene que verse desde tbonet y desde el mail; un add-on no
  tiene una URL pública que se pueda linkear.
- La UI de los add-ons (Card Service) es muy limitada para un panel de admin con tablas y filtros.
- Con el modelo autogestionado, cada persona tiene que poder cargar desde el link del mail en un
  click.

Se puede sumar más adelante un add-on liviano que abra la web, reutilizando el mismo backend.

## 4. Roles

| Rol | Qué puede hacer |
|---|---|
| **Empleado** | Ver los feriados de su país; si va a trabajar, cargarlo (horario y nota) mientras la campaña está abierta, editarlo o borrarlo; ver la lista pública. |
| **Líder** | Lo mismo que un empleado, más ver las respuestas de su equipo y, si se elige ese modelo, aprobarlas o rechazarlas. |
| **Admin RRHH** | Administrar países, personas, líderes y feriados; importar feriados; abrir/cerrar campañas; ver seguimiento; editar o aprobar cualquier respuesta; disparar o reenviar mails. |

"Líder" no hace falta guardarlo como rol: una persona es líder si alguien la tiene como `leaderEmail`.
`hr_admin` se guarda como **custom claim** de Firebase Auth, asignado por script o Cloud Function.
Nunca se confía en un rol que venga del cliente.

## 5. Flujo automatizado

```
RRHH importa feriados del año por país ─► revisa / edita / agrega días ─► confirma
                                                                          │
10 días antes (en la zona horaria del país)                               ▼
Función programada ─► abre la campaña ─► mail a TODAS las personas de ese país
                                         ("Si vas a trabajar el feriado, cargalo acá")
                                                                          │
Solo quien trabaja carga su día en la web (horario + nota)                │
                                                                          ▼
[pendiente] El líder (o RRHH) aprueba lo cargado                          │
                                                                          ▼
5 días antes ─► recordatorio a las personas del país que todavía no       │
               cargaron nada ("si trabajás, cargalo") + resumen a cada    │
               líder de quién de su equipo cargó                          │
                                                                          ▼
3 días antes ─► cierra la campaña ─► mail masivo a toda la empresa
                desde development, firmado por Marti, con link a la vista
                                                                          ▼
Vista pública (link en tbonet): quién trabaja cada feriado, separado por país
```

**Solo cargan quienes trabajan.** Quien no trabaja no tiene que hacer nada. Como no hay forma de
saber quién "falta", el recordatorio va a todas las personas del país que no cargaron un registro, con
el mismo texto opcional ("si vas a trabajar..."), y cada líder recibe un resumen de quién de su
equipo cargó, para avisar si falta alguien.

**Aprobación (pendiente de RRHH).** Propuesta: **la persona carga y el líder aprueba con un click**;
RRHH ve todo y puede corregir. Lo resolvemos con un ajuste `settings/campaign.approvalMode`:

- `"leader"` (por defecto): la respuesta "Trabajo" queda `pending` hasta que el líder la aprueba.
- `"hr"`: aprueba RRHH.
- `"none"`: queda aprobada al cargarla; el líder solo recibe un aviso.

Al cierre, un registro `pending` se publica igual (marcada como "sin aprobar" para RRHH), para que
nadie quede afuera del anuncio porque su líder no entró.

RRHH puede intervenir en cualquier paso: extender el plazo, cargar por alguien, reenviar mails o
mandar el anuncio a mano.

## 6. Modelo de datos (Firestore)

Fechas de feriado como string `YYYY-MM-DD` (fecha local del país, sin hora). Horarios como `HH:mm` en
la hora local del país. Timestamps de auditoría como `Timestamp` de Firestore.

```
countries/{countryCode}                 // ISO 3166-1 alpha-2: "AR", "PE", "VN", "UA"
  name: string                          // "Perú"
  nameEn: string                        // "Peru" (para el mail)
  timezone: string                      // "America/Lima"
  active: boolean
  holidaySource: "nager" | "google_calendar" | "manual"

settings/campaign                       // editable por RRHH
  notifyDaysBefore: number              // 10
  reminderDaysBefore: number            // 5
  closeDaysBefore: number               // 3 (cierre + anuncio masivo)
  approvalMode: "leader" | "hr" | "none"
  senderEmail: string                   // cuenta de development
  signature: string                     // "Marti."
  announcementTo: string                // lista/grupo de toda la empresa

people/{email}                          // email en minúsculas
  email: string
  displayName: string
  countryCode: string                   // -> countries
  leaderEmail: string                   // -> people (todas las personas tienen líder)
  area: string | null
  active: boolean
  source: "manual" | "sheet_import"

holidays/{holidayId}                    // `${countryCode}_${date}` (ej. "PE_2026-10-08")
  countryCode: string
  date: string                          // "2026-10-08"
  name: string                          // nombre local
  nameEn: string | null                 // para el mail en inglés
  origin: "imported" | "manual"         // "manual" = día propio de la empresa
  status: "draft" | "confirmed" | "cancelled"
  campaignStatus: "pending" | "open" | "closed" | "announced"
  createdBy, updatedBy, updatedAt

holidays/{holidayId}/workers/{email}    // solo existe si la persona trabaja ese feriado
  email: string
  displayName: string                   // desnormalizado para la vista pública
  area: string | null
  leaderEmail: string                   // desnormalizado para las reglas
  startTime: string                     // "09:00"
  endTime: string                       // "18:00"
  notes: string | null
  approval: "pending" | "approved" | "rejected" | "not_required"
  approvedBy: string | null
  submittedBy: string                   // la persona, o RRHH si cargó por ella
  updatedAt: Timestamp

mailLog/{id}                            // auditoría de todos los mails enviados
  type: "invite" | "reminder" | "leader_summary" | "approval_request" | "announcement"
  holidayId, to[], sentAt, status, error
```

Un feriado que cae en varios países son documentos separados (uno por país).

## 7. Integración con tbonet

**Solo link/botón, sin iframe.** tbonet (PHP) tiene un link a `https://<app>/feriados`, o al feriado
concreto `https://<app>/feriados/PE_2026-10-08`. El botón "Click here" del mail apunta a la misma URL.
El equipo de diseño solo tiene que agregar el link. La app se abre en su propia pestaña, así que el
login con Google funciona sin problemas de cookies de terceros.

## 8. Feriados por país

- RRHH elige país y año en el panel y aprieta "Importar".
- Una Cloud Function (callable) llama a **Nager.Date**:
  `GET https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}`. Solo **feriados
  nacionales**: los que tienen `global: true` y `types` con `Public`.
- Lo importado entra como `status: "draft"`. Nada se notifica hasta que RRHH lo pasa a `confirmed`.
- Reimportar no pisa ediciones de RRHH: solo crea los que no existen y muestra las diferencias.
- RRHH puede agregar días manuales (`origin: "manual"`).
- **Fallback:** no pudimos verificar desde el entorno de Claude que Nager.Date cubra AR, PE, VN y UA
  (la red bloquea el sitio). Verificarlo al implementar. Si falta un país, usar el calendario público
  de feriados de Google Calendar (`<idioma>.<cc>#holiday@group.v.calendar.google.com` vía Calendar
  API) o carga manual. El importador se escribe con una interfaz `HolidayProvider` por país
  (`countries.holidaySource`).

## 9. Mails

- Tipos: invitación a las personas del país, recordatorio a quienes no cargaron nada (texto
  opcional, "si vas a trabajar..."), resumen a cada líder de quién de su equipo cargó, pedido de
  aprobación al líder (si `approvalMode = "leader"`), y anuncio masivo.
- El anuncio reproduce la plantilla actual ("PUBLIC HOLIDAYS SCHEDULE", en inglés, con fecha, día de
  la semana, país y botón "Click here"), va a toda la empresa, sale desde la cuenta de development y
  lo firma Marti. Asunto del estilo "Public holidays 27/10 in Peru". Remitente, firma y destinatarios
  salen de `settings/campaign`, no de la plantilla.
- Plantillas HTML en `functions/src/mail/templates/`.
- Envío con **Gmail API**: service account con delegación de dominio y scope `gmail.send`,
  impersonando la cuenta de development. Lo habilita IT. Fallback: SMTP relay de Workspace.
- Todo envío queda en `mailLog`. Modo `DRY_RUN` (variable de entorno, `true` por defecto fuera de
  prod) que registra y no envía.

## 10. Origen de personas, países y líderes

**Importación desde el Excel de RRHH** (Marti), exportado a CSV o subido como Sheet, desde el panel.
Columnas mínimas: `email, nombre, país (código ISO), email del líder, área`. La importación hace
upsert por email, marca como inactivas a las personas que ya no aparecen (sin borrarlas) y muestra un
resumen de errores: país desconocido, líder que no existe como persona, persona sin líder, emails
fuera de los dominios permitidos.

Más adelante se puede sincronizar desde el Directory API de Workspace (IT confirmó que es posible).

## 11. Stack y estructura del repo

- Frontend: React + TypeScript + Vite, React Router, Tailwind CSS, react-icons (`md`).
- Backend: Firebase Auth, Firestore, Cloud Functions (Node 22, TypeScript, 2ª generación), funciones
  `onSchedule`, Firebase Hosting.
- Testing: Vitest para el front, Firebase Emulator Suite + `@firebase/rules-unit-testing` para reglas
  y funciones.
- Entornos: dos proyectos de Firebase nuevos, `dev` y `prod`, con alias en `.firebaserc`.

```
/
├─ CLAUDE.md
├─ docs/                 PLAN.md, PREGUNTAS_ABIERTAS.md
├─ web/                  app React (rutas: /, /feriados, /feriados/:id, /cargar/:id, /equipo, /admin)
├─ functions/            Cloud Functions (auth, import de feriados, campañas, mails)
│  └─ src/mail/templates/
├─ firestore.rules
├─ firestore.indexes.json
└─ firebase.json
```

## 12. Seguridad (reglas de Firestore)

- Login solo con emails de `@tbo.group` o `@gobetween.lsp.com`: lo valida una blocking function
  `beforeUserCreated`/`beforeUserSignedIn` y las reglas también chequean el dominio del token.
- `holidays`, `countries`, `settings`: lectura para todos los autenticados; escritura solo `hr_admin`.
- `workers`: lectura para cualquier persona logueada (la información es pública dentro de la
  empresa). La persona crea, edita y borra **solo su propio registro**, solo mientras
  `campaignStatus == "open"`, y no puede tocar `approval`/`approvedBy`. El líder (por
  `leaderEmail`) solo puede cambiar `approval`/`approvedBy`. RRHH puede todo.
- `people`: lectura para autenticados (nombre, país y área son públicos internamente); escritura
  solo `hr_admin`.
- `mailLog`: solo RRHH.
- Tests de reglas para cada caso antes de dar por terminada una etapa.

## 13. Convenciones de trabajo

- El trabajo va **por etapas** (ver `PLAN.md`). No adelantar funcionalidad de una etapa posterior.
- Cada etapa termina con: código revisado, tests pasando en el emulador, y una demo para RRHH.
- Textos de la UI en español; los mails en inglés como la plantilla actual.
- No enviar mails reales desde dev: `DRY_RUN=true` por defecto fuera de prod.
- Nunca commitear credenciales; usar Secret Manager / `firebase functions:secrets`.
- Antes de decidir algo que figure en `PREGUNTAS_ABIERTAS.md`, verificar si ya fue respondido y
  actualizar ese archivo y este CLAUDE.md con la respuesta.
