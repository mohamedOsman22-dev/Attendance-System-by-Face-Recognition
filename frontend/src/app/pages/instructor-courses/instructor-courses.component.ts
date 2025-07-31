import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CourseService } from '../../services/course.service';
import { Course, CourseStatus } from '../../shared/interfaces/course.interface';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './instructor-courses.component.html',
  styleUrls: ['./instructor-courses.component.scss']
})
export class InstructorCoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  error = '';

  constructor(
    private courseService: CourseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getInstructorCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
        this.showError(error.message);
      }
    });
  }

  getStatusColor(status: CourseStatus): string {
    switch (status) {
      case CourseStatus.ACTIVE:
        return 'success';
      case CourseStatus.INACTIVE:
        return 'warn';
      case CourseStatus.COMPLETED:
        return 'primary';
      case CourseStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
} 