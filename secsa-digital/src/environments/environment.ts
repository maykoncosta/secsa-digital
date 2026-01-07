export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCNvR4GrOPajeMYM6GQSir8hpd0HCSSJ84",
    authDomain: "secsa-digital.firebaseapp.com",
    projectId: "secsa-digital",
    storageBucket: "secsa-digital.firebasestorage.app",
    messagingSenderId: "760024363855",
    appId: "1:760024363855:web:bd3f91f4411202ff450b3a",
    measurementId: "G-DGS9B2365V"
  },
  api: {
    baseUrl: 'http://localhost:4200'
  },
  sentry: {
    dsn: 'https://fb87a31023776179b0bf42e19b404149@o4510666701471744.ingest.us.sentry.io/4510666702782464', 
    enabled: true, // Ativar após configurar o DSN
    environment: 'development',
    tracesSampleRate: 1.0, // 100% em desenvolvimento
    replaysSessionSampleRate: 0.1, // 10% de sessões
    replaysOnErrorSampleRate: 1.0 // 100% quando houver erro
  }
};
