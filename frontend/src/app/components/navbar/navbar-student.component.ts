import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-student',
  standalone: true,
  imports: [CommonModule],
  template: `
  <nav class="main-navbar">
    <div class="navbar-logo">Face <span style="color:#b993f7;">AI</span></div>
    <div class="navbar-links">
      <a routerLink="/" routerLinkActive="active-link">Home</a>
      <a routerLink="/student-calendar" routerLinkActive="active-link">Calendar</a>
      <a routerLink="/manage-account" routerLinkActive="active-link">Account</a>
      <a (click)="logout()" style="color:#fc4a6a;font-weight:bold;cursor:pointer;">Logout</a>
    </div>
    <div class="navbar-actions">
      <span style="font-weight:bold;">Student User</span>
    </div>
  </nav>
  `,
  styleUrls: ['./navbar-student.component.scss']
})
export class NavbarStudentComponent {
  constructor(private router: Router) {}
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
    setTimeout(() => window.location.reload(), 200);
  }
}
 