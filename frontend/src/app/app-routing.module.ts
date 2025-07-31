import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { FaceAttendComponent } from './pages/face-attend/face-attend.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { StudentCalendarComponent } from './pages/student-calendar/student-calendar.component';
import { InstructorDashboardComponent } from './pages/instructor-dashboard/instructor-dashboard.component';
import { InstructorCoursesComponent } from './pages/instructor-courses/instructor-courses.component';
import { InstructorSubjectsComponent } from './pages/instructor-subjects/instructor-subjects.component';
import { SubjectDetailsComponent } from './pages/subject-details/subject-details.component';

import { RoleGuard } from './guards/role.guard'; // تأكد من المسار الصحيح
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent) },

 {
  path: 'student-calendar',
  loadComponent: () => import('./pages/student-calendar/student-calendar.component')
    .then(m => m.StudentCalendarComponent),
  canActivate: [RoleGuard],
  data: { roles: ['attendee', 'Attendee', 'student', 'Student'] } // <-- زود كل احتمالات الرول بتاعك
}

,
  {
    path: 'take-attendance',
    loadComponent: () => import('./pages/face-attend/face-attend.component')
      .then(m => m.FaceAttendComponent),
    canActivate: [RoleGuard],
    data: { roles: ['instructor'] } // ✅ lowercase
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } // ✅ lowercase
  },
  {
    path: 'instructor-subject/:id',
    loadComponent: () => import('./pages/face-attend/face-attend.component')
      .then(m => m.FaceAttendComponent),
    canActivate: [RoleGuard],
    data: { roles: ['instructor'] }
  },
  {
    path: 'courses',
    loadComponent: () => import('./pages/instructor/instructor-courses.component')
      .then(m => m.InstructorCoursesComponent),
    canActivate: [RoleGuard],
    data: { roles: ['instructor'] }
  },
  {
    path: 'subjects',
    loadComponent: () => import('./pages/instructor-subjects/instructor-subjects.component')
      .then(m => m.InstructorSubjectsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['instructor'] }
  },
{
  path: 'subject-details/:id',
  loadComponent: () =>
    import('./pages/subject-details/subject-details.component')
      .then(m => m.SubjectDetailsComponent),
  canActivate: [RoleGuard],
  data: { roles: ['instructor'] }
}

,
  { path: '**', redirectTo: '' }

];