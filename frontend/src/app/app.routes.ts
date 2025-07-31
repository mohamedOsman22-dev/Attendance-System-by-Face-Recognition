import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';
import { SubjectDetailsComponent } from './pages/subject-details/subject-details.component';

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
    data: { roles: ['Instructor'] }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'subjects',
    loadComponent: () => import('./pages/instructor-subjects/instructor-subjects.component')
      .then(m => m.InstructorSubjectsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Instructor','instructor'] }
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
