import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { blockCreateOutsideDomain, blockSignInOutsideDomain } from './auth';
