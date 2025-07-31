import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { SubjectAttendanceComponent } from './subject-attendance.component';
import { SubjectAttendanceReviewComponent } from './subject-attendance-review.component';
import { AttendanceStateService } from '../../services/attendance-state.service';

@Component({
  selector: 'app-subject-details',
  standalone: true,
  templateUrl: './subject-details.component.html',
  styleUrls: ['./subject-attendance.component.scss'],
  imports: [
    CommonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    SubjectAttendanceComponent,
    SubjectAttendanceReviewComponent,
  ]
})
export class SubjectDetailsComponent implements OnInit {
  subject: any = null;
  subjectId: string = '';

  constructor(private attendanceState: AttendanceStateService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('selectedSubject');

    if (stored) {
      try {
        this.subject = JSON.parse(stored);
        this.subjectId = this.subject?.subjectId || this.subject?.id || this.subject?.name;

        console.log('🆔 subjectId:', this.subjectId);
      } catch (err) {
        console.error('❌ Failed to parse subject from localStorage:', err);
      }
    } else {
      console.warn('⚠️ No subject found in localStorage.');
    }
  }

  sendToReview(): void {
    this.attendanceState.sendDraftToFinal();
  }

  downloadPDF(): void {
    alert('📄 Download PDF feature coming soon.');
  }

  downloadCSV(): void {
    alert('📊 Download CSV feature coming soon.');
  }
}
