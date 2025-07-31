import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatTableModule],
  template: `
    <div class="dashboard-container">
      <h1>Instructor Dashboard</h1>
      
      <div class="courses-section">
        <h2>My Courses</h2>
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="courses">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Course Name</th>
                <td mat-cell *matCellDef="let course">{{course.name}}</td>
              </ng-container>
              <ng-container matColumnDef="students">
                <th mat-header-cell *matHeaderCellDef>Enrolled Students</th>
                <td mat-cell *matCellDef="let course">{{course.students}}</td>
              </ng-container>
              <ng-container matColumnDef="schedule">
                <th mat-header-cell *matHeaderCellDef>Schedule</th>
                <td mat-cell *matCellDef="let course">{{course.schedule}}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'students', 'schedule']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'students', 'schedule'];"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>

      <button mat-raised-button color="primary" routerLink="/face-attend">
        Take Attendance
      </button>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }
    .courses-section {
      margin: 2rem 0;
    }
    table {
      width: 100%;
    }
  `]
})
export class InstructorDashboardComponent implements OnInit {
  courses = [
    { name: 'Course 1', students: 25, schedule: 'Mon, Wed 9:00 AM' },
    { name: 'Course 2', students: 30, schedule: 'Tue, Thu 11:00 AM' },
    { name: 'Course 3', students: 20, schedule: 'Fri 2:00 PM' }
  ];

  ngOnInit() {
    // Load courses data from service
  }
} 