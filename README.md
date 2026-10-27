# Feriados — TBO

Web para registrar quién trabaja cada feriado y mostrarlo desde tbonet, reemplazando el Sheet que
RRHH manda por mail.

- Contexto y decisiones: [`CLAUDE.md`](CLAUDE.md)
- Plan por etapas: [`docs/PLAN.md`](docs/PLAN.md)
- Preguntas pendientes: [`docs/PREGUNTAS_ABIERTAS.md`](docs/PREGUNTAS_ABIERTAS.md)

Estado: **etapa 0** (base del proyecto y login). Las pantallas con datos llegan en la etapa 1.

## Arrancar en local

Hace falta Node 22 y Java 17 o más (lo usa el emulador de Firestore).

```bash
# 1. Dependencias (instala web y functions). Usar este comando y no npm install dentro de
#    functions: ahí hace falta --legacy-peer-deps por los tests de reglas.
npm install

# 2. Configuración del front
cp web/.env.example web/.env.local   # completar con los datos del proyecto de Firebase dev

# 3. Emuladores (Auth, Firestore, Functions)
npm run emulators

# 4. En otra terminal, la app
npm run dev
```

Con `VITE_USE_EMULATORS=true`, la app se conecta a los emuladores y no toca datos reales.

## Tests

```bash
npm test   # unitarios del front + reglas de Firestore contra el emulador
```

## Entornos

`.firebaserc` define dos alias: `dev` y `prod`. Los proyectos de Firebase todavía hay que crearlos
(ver preguntas abiertas). Deploy: `firebase deploy -P dev`.

## Quién puede entrar

Solo cuentas `@tbo.group` y `@gobetween.lsp.com`. Lo valida una blocking function de Auth
(`functions/src/auth.ts`) y, de nuevo, las reglas de Firestore.

Para que alguien administre, hay que darle el rol:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./sa.json node scripts/set-hr-admin.mjs marti@tbo.group
```
