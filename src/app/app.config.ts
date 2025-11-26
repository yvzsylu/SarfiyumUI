import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { 
  provideHttpClient, 
  withFetch, 
  withInterceptors // <--- BU EKSİK OLDUĞU İÇİN HATA VERİYOR
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideToastr } from 'ngx-toastr';

// Store & Effects
import { rootReducer } from './store';
import { CalendarEffects } from '@store/calendar/calendar.effects';
import { AuthenticationEffects } from '@store/authentication/authentication.effects'; // Effect burada
import { localStorageSyncReducer } from '@store/layout/layout-reducers';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
// DİKKAT: Gerçek API kullanacaksan FakeBackendProvider'ı buradan kaldırdım.
// import { FakeBackendProvider } from './helper/fake-backend'; 

export const appConfig: ApplicationConfig = {
  providers: [
    // FakeBackendProvider, // <--- GERÇEK API İÇİN BU KAPALI OLMALI
    DecimalPipe,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // Store Yapılandırması
    provideStore(rootReducer, { metaReducers: [localStorageSyncReducer] }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    
    // Effects: AuthenticationEffects burada kayıtlı, süper.
    provideEffects(CalendarEffects, AuthenticationEffects),
    
    importProvidersFrom(BrowserAnimationsModule, BrowserModule),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor]) // Artık hata vermeyecektir
    ),
    
    // Toastr Ayarlarını buraya taşıdık (Main.ts'ten aldık)
    provideToastr({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      timeOut: 3000,
      progressBar: true, // İsteğe bağlı, şık durur
    }),
  ],
};