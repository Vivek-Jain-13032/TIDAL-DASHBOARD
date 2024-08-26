import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'ag-grid-community/styles/ag-grid.css'; /* Core Data Grid CSS */
import 'ag-grid-community/styles/ag-theme-quartz.css'; /* Quartz Theme Specific CSS */

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
