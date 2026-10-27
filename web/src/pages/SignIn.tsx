import { MdCalendarMonth } from 'react-icons/md'
import { useSession } from '../lib/auth'
import { allowedDomains } from '../lib/domains'

export function SignIn() {
  const { signIn, error } = useSession()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <MdCalendarMonth className="mx-auto mb-4 text-4xl text-indigo-600" aria-hidden />
        <h1 className="text-xl font-semibold text-slate-900">Feriados</h1>
        <p className="mt-2 text-sm text-slate-600">
          Entrá con tu cuenta de la empresa para ver los feriados y avisar si trabajás.
        </p>
        <button
          type="button"
          onClick={signIn}
          className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Entrar con Google
        </button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <p className="mt-6 text-xs text-slate-400">
          Solo cuentas {allowedDomains().map((domain) => `@${domain}`).join(' y ')}
        </p>
      </div>
    </div>
  )
}
