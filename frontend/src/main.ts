import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const token = localStorage.getItem('token');
          if (token) {
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next(cloned); // ✅ مش .handle()
          }
          return next(req); // ✅ السطر الصحيح
        }
      ])
    ),
    provideAnimations()
  ]
}).catch(err => console.error(err));
