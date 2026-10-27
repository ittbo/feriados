import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let testEnv: RulesTestEnvironment;

const staff = { email: 'pepito@tbo.group', email_verified: true };
const staffOtherDomain = { email: 'pepito@gobetween.lsp.com', email_verified: true };
const hr = { email: 'marti@tbo.group', email_verified: true, role: 'hr_admin' };
const outsider = { email: 'alguien@gmail.com', email_verified: true };
const unverified = { email: 'pepito@tbo.group', email_verified: false };

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'tbo-feriados-test',
    firestore: { rules: readFileSync('../firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'countries/PE'), { name: 'Perú', timezone: 'America/Lima', active: true });
    await setDoc(doc(db, 'holidays/PE_2026-10-08'), { countryCode: 'PE', date: '2026-10-08', status: 'confirmed' });
    await setDoc(doc(db, 'holidays/PE_2026-10-08/workers/pepito@tbo.group'), { startTime: '09:00', endTime: '18:00' });
    await setDoc(doc(db, 'mailLog/1'), { type: 'announcement' });
  });
});

describe('lectura', () => {
  it('cualquier persona de la empresa lee feriados, países y quién trabaja', async () => {
    const db = testEnv.authenticatedContext('u1', staff).firestore();
    await assertSucceeds(getDoc(doc(db, 'countries/PE')));
    await assertSucceeds(getDoc(doc(db, 'holidays/PE_2026-10-08')));
    await assertSucceeds(getDoc(doc(db, 'holidays/PE_2026-10-08/workers/pepito@tbo.group')));
  });

  it('también desde el segundo dominio de la empresa', async () => {
    const db = testEnv.authenticatedContext('u2', staffOtherDomain).firestore();
    await assertSucceeds(getDoc(doc(db, 'holidays/PE_2026-10-08')));
  });

  it('una cuenta de afuera no lee nada', async () => {
    const db = testEnv.authenticatedContext('u3', outsider).firestore();
    await assertFails(getDoc(doc(db, 'holidays/PE_2026-10-08')));
  });

  it('sin loguearse no se lee nada', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'holidays/PE_2026-10-08')));
  });

  it('una cuenta sin mail verificado no lee nada', async () => {
    const db = testEnv.authenticatedContext('u4', unverified).firestore();
    await assertFails(getDoc(doc(db, 'holidays/PE_2026-10-08')));
  });
});

describe('escritura', () => {
  it('RRHH escribe feriados, países y configuración', async () => {
    const db = testEnv.authenticatedContext('hr', hr).firestore();
    await assertSucceeds(setDoc(doc(db, 'countries/AR'), { name: 'Argentina', active: true }));
    await assertSucceeds(setDoc(doc(db, 'holidays/AR_2026-05-25'), { countryCode: 'AR', date: '2026-05-25' }));
    await assertSucceeds(setDoc(doc(db, 'settings/campaign'), { notifyDaysBefore: 10 }));
  });

  it('una persona sin rol no escribe', async () => {
    const db = testEnv.authenticatedContext('u1', staff).firestore();
    await assertFails(setDoc(doc(db, 'countries/AR'), { name: 'Argentina' }));
    await assertFails(setDoc(doc(db, 'holidays/PE_2026-10-08'), { status: 'cancelled' }));
    await assertFails(setDoc(doc(db, 'people/pepito@tbo.group'), { countryCode: 'PE' }));
  });
});

describe('mailLog', () => {
  it('solo RRHH lo lee y nadie lo escribe desde el cliente', async () => {
    await assertSucceeds(getDoc(doc(testEnv.authenticatedContext('hr', hr).firestore(), 'mailLog/1')));
    await assertFails(getDoc(doc(testEnv.authenticatedContext('u1', staff).firestore(), 'mailLog/1')));
    await assertFails(setDoc(doc(testEnv.authenticatedContext('hr', hr).firestore(), 'mailLog/2'), { type: 'x' }));
  });
});

describe('colecciones no previstas', () => {
  it('quedan cerradas', async () => {
    const db = testEnv.authenticatedContext('hr', hr).firestore();
    await assertFails(getDoc(doc(db, 'otraCosa/1')));
    expect(true).toBe(true);
  });
});
