import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWwAIWuNmam4FdzkXy-RTczYLKLvMlhhM",
  authDomain: "mokelumne-ee81d.firebaseapp.com",
  projectId: "mokelumne-ee81d",
  storageBucket: "mokelumne-ee81d.firebasestorage.app",
  messagingSenderId: "1078866958380",
  appId: "1:1078866958380:web:4f0fc2082c192b6cfa5989",
  measurementId: "G-RL37B1CTVD"
};

export const appConfig: ApplicationConfig = {
   providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
