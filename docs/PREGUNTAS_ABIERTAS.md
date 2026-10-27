# Preguntas abiertas

Quedan solo las pendientes. Entre corchetes, lo que asumimos mientras no haya respuesta.
Las respondidas están al final y ya están aplicadas en `CLAUDE.md` y `PLAN.md`.

## Para RRHH (Marti)

1. **¿Quién aprueba cuando alguien carga que trabaja el feriado?** El líder, RRHH, o nadie
   (queda aprobado al cargarlo).
   [El líder aprueba con un click; si no aprueba antes del cierre, se publica igual. Se puede
   cambiar en un ajuste sin tocar código]
2. **El Excel de personas:** pedírselo a Marti para ver columnas reales (email, país, líder, área).
3. **Lista completa de países.** Hoy sabemos AR, PE, VN y UA.
4. **¿Cuál es el email o grupo de "toda la empresa"** al que va el anuncio, y la dirección exacta
   de la cuenta de development? [Configurable en el panel]

## Para IT

5. Crear el repositorio `feriados` en la organización de GitHub de IT
   ([github.com/ittbo](https://github.com/ittbo)) y subir la etapa 0.
6. Crear los dos proyectos de Firebase (dev y prod), o darnos permisos para crearlos.

## Respondidas

**27/10/2026, primera tanda**
- Plazos: aviso **10 días** antes, recordatorio **5 días** antes, cierre y anuncio **3 días** antes.
- Feriados: **solo nacionales**.
- Visibilidad: **cualquier persona logueada** de la empresa.
- tbonet: **link/botón**, sin iframe.
- Envío de mails: **service account con delegación de dominio y `gmail.send`**; si no, SMTP relay.

**27/10/2026, segunda tanda** (reemplaza lo anterior donde difiere)
- Personas, país y líder: **Excel de RRHH** (lo tiene Marti), importado como CSV/Sheet.
- Países: **Argentina y Perú** los principales; también **Vietnam, Ucrania** y otros.
- Quién carga: **autogestionado, cada persona carga** (antes habíamos asumido que cargaba el líder).
- Datos por persona: **trabaja sí/no, horario** y nota.
- Anuncio masivo: a **toda la empresa**, estilo "Public holidays 27/10 in Peru".
- Remitente: **cuenta de development**, firma **Marti**.
- Días propios de la empresa: hoy **no hay**; si aparece alguno, se gestiona igual.
- Todas las personas **tienen líder**.
- tbonet está hecho en **PHP**; el link no es problema.
- Dominios: **`@tbo.group` y `@gobetween.lsp.com`**.
- Service account con `gmail.send`: **IT lo puede habilitar**.
- Directory API de Workspace: **se puede**; queda como mejora opcional.
- Firebase: **proyectos nuevos**, no se reusan.
- UI: **Tailwind** + librería de íconos (elegimos react-icons con el set Material Design).
- GitHub: **organización de IT**.

**27/10/2026, tercera tanda**
- **Solo cargan quienes trabajan.** Se saca la opción "No trabajo": quien no trabaja no hace nada.
- GitHub de IT: **github.com/ittbo**.
