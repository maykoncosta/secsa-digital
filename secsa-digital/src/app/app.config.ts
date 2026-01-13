import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { environment } from '../environments/environment';
import { GlobalErrorHandlerService } from './core/services/error-handler.service';
import * as Sentry from '@sentry/angular';

import { routes } from './app.routes';

// Inicializar Sentry
if (environment.sentry.enabled) {
  Sentry.init({
    dsn: environment.sentry.dsn,
    environment: environment.sentry.environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: environment.sentry.tracesSampleRate,
    replaysSessionSampleRate: environment.sentry.replaysSessionSampleRate,
    replaysOnErrorSampleRate: environment.sentry.replaysOnErrorSampleRate,
    beforeSend(event, hint) {
      // Filtrar erros conhecidos ou não importantes
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message.includes('ChunkLoadError')) {
          // Não enviar erros de chunk loading (geralmente causados por deploy)
          return null;
        }
      }
      return event;
    }
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      multi: true
    }
  ]
};
