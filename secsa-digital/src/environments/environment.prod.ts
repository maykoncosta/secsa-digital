export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyCNvR4GrOPajeMYM6GQSir8hpd0HCSSJ84",
    authDomain: "secsa-digital.firebaseapp.com",
    projectId: "secsa-digital",
    storageBucket: "secsa-digital.firebasestorage.app",
    messagingSenderId: "760024363855",
    appId: "1:760024363855:web:bd3f91f4411202ff450b3a",
    measurementId: "G-DGS9B2365V"
  },
  sentry: {
    dsn: '', // TODO: Adicionar seu DSN do Sentry aqui
    enabled: true,
    environment: 'production',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0
  }
};
