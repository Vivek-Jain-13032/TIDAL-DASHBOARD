import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import 'ag-grid-community/styles/ag-grid.css'; /* Core Data Grid CSS */
import 'ag-grid-community/styles/ag-theme-quartz.css'; /* Quartz Theme Specific CSS */

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
