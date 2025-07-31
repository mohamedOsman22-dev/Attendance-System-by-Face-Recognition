import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar-instructor',
  standalone: true,
  template: `
    <nav class="navbar">
      <a routerLink="/" class="nav-title">AI Instructor Panel</a>
      <div class="nav-links">
        <a routerLink="/courses" routerLinkActive="active">Courses</a>
        <a (click)="logout()">Logout</a>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar-instructor.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class NavbarInstructorComponent {
  logout() {
    localStorage.clear();
    location.href = '/login';
  }
}
