/** Dominios de mail habilitados para entrar a la app. */
export const ALLOWED_DOMAINS = ['tbo.group', 'gobetween.lsp.com'] as const;

export function isAllowedEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const at = email.lastIndexOf('@');
  if (at < 1) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return (ALLOWED_DOMAINS as readonly string[]).includes(domain);
}
