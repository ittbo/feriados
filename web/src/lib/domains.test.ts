import { describe, expect, it } from 'vitest'
import { allowedDomains, isAllowedEmail } from './domains'

describe('allowedDomains', () => {
  it('usa los dominios configurados', () => {
    expect(allowedDomains('tbo.group, gobetween.lsp.com')).toEqual(['tbo.group', 'gobetween.lsp.com'])
  })

  it('cae en los dominios por defecto si no hay configuración', () => {
    expect(allowedDomains('')).toEqual(['tbo.group', 'gobetween.lsp.com'])
  })
})

describe('isAllowedEmail', () => {
  const domains = ['tbo.group', 'gobetween.lsp.com']

  it('acepta los dos dominios de la empresa', () => {
    expect(isAllowedEmail('marti@tbo.group', domains)).toBe(true)
    expect(isAllowedEmail('MARTI@TBO.GROUP', domains)).toBe(true)
    expect(isAllowedEmail('alguien@gobetween.lsp.com', domains)).toBe(true)
  })

  it('rechaza cuentas de afuera y valores vacíos', () => {
    expect(isAllowedEmail('alguien@gmail.com', domains)).toBe(false)
    expect(isAllowedEmail('subdominio@mail.tbo.group', domains)).toBe(false)
    expect(isAllowedEmail(null, domains)).toBe(false)
    expect(isAllowedEmail('sinarroba', domains)).toBe(false)
  })
})
