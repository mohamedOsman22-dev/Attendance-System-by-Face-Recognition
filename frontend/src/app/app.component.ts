import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs/operators';
import { StudentCalendarComponent } from './pages/student-calendar/student-calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'aps-frontend';
  isHomePage = false;
  isLoginPage = false;
  isSignupPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.isHomePage = e.urlAfterRedirects === '/' || e.url === '/';
      this.isLoginPage = e.urlAfterRedirects.startsWith('/login');
      this.isSignupPage = e.urlAfterRedirects.startsWith('/signup');
    });
  }
}
