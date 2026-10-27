import { describe, expect, it } from 'vitest';
import { isAllowedEmail } from './domains';

describe('isAllowedEmail', () => {
  it('acepta los dominios de la empresa', () => {
    expect(isAllowedEmail('marti@tbo.group')).toBe(true);
    expect(isAllowedEmail('Alguien@GoBetween.lsp.com')).toBe(true);
  });

  it('rechaza cualquier otra cuenta', () => {
    expect(isAllowedEmail('alguien@gmail.com')).toBe(false);
    expect(isAllowedEmail('alguien@mail.tbo.group')).toBe(false);
    expect(isAllowedEmail(undefined)).toBe(false);
    expect(isAllowedEmail('sinarroba')).toBe(false);
  });
});
