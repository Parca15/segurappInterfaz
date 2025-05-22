import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'; // Necesario para HttpClient
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Necesario para formularios

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // Provee HttpClient globalmente
    importProvidersFrom(FormsModule, ReactiveFormsModule) // Importa módulos de formularios
  ]
};