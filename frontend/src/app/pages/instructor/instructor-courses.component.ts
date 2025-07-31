import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NavbarInstructorComponent } from "../../components/navbar/navbar-instructor.component";
import { DataService } from '../../shared/data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NavbarInstructorComponent
  ],
  templateUrl: './instructor-courses.component.html',
  styleUrls: ['./instructor-courses.component.scss']
})
export class InstructorCoursesComponent implements OnInit {
  subjects: any[] = [];
  loading = false;
  errorMsg = '';

  constructor(private router: Router, private dataService: DataService) {}

  ngOnInit() {
    this.fetchSubjects();
  }

  fetchSubjects() {
    this.loading = true;
    this.errorMsg = '';
    const token = localStorage.getItem('token');
    let instructorId = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Try all possible keys for instructor id
        instructorId = payload.id || payload.instructorId || payload.sub || payload.userId || '';
        if (!instructorId) {
          this.errorMsg = 'Instructor ID not found in token.';
          this.loading = false;
          return;
        }
      } catch (e) {
        this.errorMsg = 'Invalid token.';
        this.loading = false;
        return;
      }
    } else {
      this.errorMsg = 'Not authenticated.';
      this.loading = false;
      return;
    }
    this.dataService.getSubjectsByInstructorId(instructorId).subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.loading = false;
        if (subjects.length > 0) {
          console.log('First Instructor Object:', subjects[0]);
        }
      },
      error: (err) => {
        this.errorMsg = 'Failed to load subjects.';
        this.loading = false;
      }
    });
  }

  openSubject(subject: any) {
    this.router.navigate(['/instructor-subject', subject.id]);
  }
}
