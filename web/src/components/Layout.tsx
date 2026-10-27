import { NavLink, Outlet } from 'react-router-dom'
import { MdLogout } from 'react-icons/md'
import { useSession } from '../lib/auth'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`

export function Layout() {
  const { user, role, logOut } = useSession()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-base font-semibold">Feriados</span>
          <nav className="flex flex-1 flex-wrap gap-1">
            <NavLink to="/feriados" className={linkClass}>
              Feriados
            </NavLink>
            {role === 'hr_admin' && (
              <NavLink to="/admin" className={linkClass}>
                Administración
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={logOut}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
            >
              <MdLogout aria-hidden /> Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
