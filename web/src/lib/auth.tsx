import { type User, onIdTokenChanged, signInWithPopup, signOut } from 'firebase/auth'
import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, googleProvider } from './firebase'
import { isAllowedEmail } from './domains'

export type Role = 'employee' | 'hr_admin'

export type Session = {
  user: User | null
  role: Role
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  logOut: () => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role>('employee')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onIdTokenChanged(auth, async (next) => {
      if (next && !isAllowedEmail(next.email)) {
        // Defensa en profundidad: la blocking function ya rechaza estos usuarios.
        setError('Esa cuenta no es de la empresa. Entrá con tu cuenta de trabajo.')
        await signOut(auth)
        setUser(null)
        setRole('employee')
        setLoading(false)
        return
      }
      const claims = next ? (await next.getIdTokenResult()).claims : null
      setUser(next)
      setRole(claims?.role === 'hr_admin' ? 'hr_admin' : 'employee')
      setLoading(false)
    })
  }, [])

  const value = useMemo<Session>(
    () => ({
      user,
      role,
      loading,
      error,
      signIn: async () => {
        setError(null)
        try {
          await signInWithPopup(auth, googleProvider)
        } catch (cause) {
          setError(
            cause instanceof Error && cause.message.includes('auth/popup-closed-by-user')
              ? null
              : 'No pudimos iniciar sesión. Probá de nuevo.',
          )
        }
      },
      logOut: async () => {
        setError(null)
        await signOut(auth)
      },
    }),
    [user, role, loading, error],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession necesita estar dentro de <SessionProvider>')
  return session
}
