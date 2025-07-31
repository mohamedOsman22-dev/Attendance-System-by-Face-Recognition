import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarStudentComponent } from './navbar-student.component';
import { NavbarInstructorComponent } from './navbar-instructor.component';
import { NavbarAdminComponent } from './navbar-admin.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NavbarStudentComponent, NavbarInstructorComponent, NavbarAdminComponent],
  template: `
    <ng-container [ngSwitch]="role">
      <app-navbar-student *ngSwitchCase="'student'"></app-navbar-student>
      <app-navbar-instructor *ngSwitchCase="'instructor'"></app-navbar-instructor>
      <app-navbar-admin *ngSwitchCase="'admin'"></app-navbar-admin>
      <ng-container *ngSwitchDefault>
        <!-- no navbar to show -->
      </ng-container>
    </ng-container>
  `
})
export class AppNavbarComponent {
  role: string = '';

  constructor() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.role = user?.role?.toLowerCase() || '';
    } catch {
      this.role = '';
    }
  }
}
