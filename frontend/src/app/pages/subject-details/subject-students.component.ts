import { Component, Input, OnInit } from '@angular/core';
import { SubjectService } from '../../services/subject.service';
import { Student } from '../../shared/interfaces/student.interface';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-subject-students',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './subject-students.component.html',
  styleUrls: ['./subject-students.component.scss']
})
export class SubjectStudentsComponent implements OnInit {
  @Input() subjectId!: string;
  students: Student[] = [];
  loading = true;
  error = '';

  constructor(private subjectService: SubjectService) {}

  ngOnInit(): void {
    if (this.subjectId) {
      this.subjectService.getSubjectStudents(this.subjectId).subscribe({
        next: (students) => {
          this.students = students;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load students.';
          this.loading = false;
        }
      });
    }
  }
} 