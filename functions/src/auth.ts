import {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} from 'firebase-functions/v2/identity';
import * as logger from 'firebase-functions/logger';
import { isAllowedEmail } from './domains';

const REGION = 'southamerica-east1';

/** Rechaza cualquier cuenta que no sea de la empresa, al crearse o al entrar. */
function assertCompanyAccount(email: string | undefined): void {
  if (isAllowedEmail(email)) return;
  logger.warn('Intento de acceso con una cuenta de afuera', { email });
  throw new HttpsError('permission-denied', 'Solo se puede entrar con una cuenta de la empresa.');
}

export const blockCreateOutsideDomain = beforeUserCreated({ region: REGION }, (event) => {
  assertCompanyAccount(event.data?.email);
  return {};
});

export const blockSignInOutsideDomain = beforeUserSignedIn({ region: REGION }, (event) => {
  assertCompanyAccount(event.data?.email);
  return {};
});
