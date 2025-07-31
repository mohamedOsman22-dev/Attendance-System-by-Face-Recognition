import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatTableModule],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      
      <div class="courses-section">
        <h2>Courses</h2>
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
              <tr mat-header-row *matHeaderRowDef="['name', 'students']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'students'];"></tr>
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
export class AdminDashboardComponent implements OnInit {
  courses = [
    { name: 'Course 1', students: 25 },
    { name: 'Course 2', students: 30 },
    { name: 'Course 3', students: 20 }
  ];

  ngOnInit() {
    // Load courses data from service
  }
} 