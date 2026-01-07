import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { ErrorBoundaryComponent } from './shared/components/error-boundary.component';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    ToastContainerComponent, 
    ErrorBoundaryComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('secsa-digital');
}
