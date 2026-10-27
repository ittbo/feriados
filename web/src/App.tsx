import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Placeholder } from './pages/Placeholder'
import { SignIn } from './pages/SignIn'
import { useSession } from './lib/auth'

export default function App() {
  const { user, role, loading } = useSession()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Cargando…
      </div>
    )
  }

  if (!user) return <SignIn />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/feriados" replace />} />
        <Route
          path="feriados"
          element={
            <Placeholder
              title="Próximos feriados"
              description="Acá vas a ver los feriados de tu país y quién trabaja cada uno. Se completa en la etapa 1."
            />
          }
        />
        {role === 'hr_admin' && (
          <Route
            path="admin"
            element={
              <Placeholder
                title="Administración"
                description="Países, personas y calendario de feriados. Se completa en la etapa 1."
              />
            }
          />
        )}
        <Route
          path="*"
          element={<Placeholder title="No encontramos esa página" description="Revisá el link o volvé a Feriados." />}
        />
      </Route>
    </Routes>
  )
}
