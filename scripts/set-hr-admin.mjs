/**
 * Asigna el rol hr_admin a una persona.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json node scripts/set-hr-admin.mjs marti@tbo.group
 *
 * Contra el emulador:
 *   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 GCLOUD_PROJECT=tbo-feriados-dev \
 *     node scripts/set-hr-admin.mjs marti@tbo.group
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
if (!email) {
  console.error('Falta el email. Ejemplo: node scripts/set-hr-admin.mjs marti@tbo.group')
  process.exit(1)
}

initializeApp({ credential: applicationDefault() })

const auth = getAuth()
const user = await auth.getUserByEmail(email)
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), role: 'hr_admin' })
console.log(`Listo: ${email} ahora es hr_admin. Tiene que volver a entrar para que tome efecto.`)
