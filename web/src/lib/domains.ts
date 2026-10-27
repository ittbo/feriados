const DEFAULT_ALLOWED_DOMAINS = ['tbo.group', 'gobetween.lsp.com']

/** Dominios habilitados para iniciar sesión. */
export function allowedDomains(raw = import.meta.env.VITE_ALLOWED_DOMAINS): string[] {
  const configured = (raw ?? '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean)
  return configured.length > 0 ? configured : DEFAULT_ALLOWED_DOMAINS
}

export function isAllowedEmail(email: string | null | undefined, domains = allowedDomains()): boolean {
  if (!email) return false
  const at = email.lastIndexOf('@')
  if (at < 1) return false
  return domains.includes(email.slice(at + 1).toLowerCase())
}
