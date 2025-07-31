import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { NavbarInstructorComponent } from '../../components/navbar/navbar-instructor.component';
import { AttendanceService } from '../../services/attendance.service';
import { EnrollmentService } from '../../../app/services/enrollment.service';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface SubjectInfo {
  id: string;
  name: string;
  instructor?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface AttendanceResponse {
  id: string;
  studentId: string;
  subjectId: string;
  attendanceTime: string;
}

@Component({
  selector: 'app-face-attend',
  standalone: true,
  templateUrl: './face-attend.component.html',
  styleUrls: ['./face-attend.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    NavbarInstructorComponent
  ]
})
export class FaceAttendComponent implements OnInit {
  attendanceForm: FormGroup;
  subjectInfo: SubjectInfo = { id: '', name: '' };
  enrolledStudents: Student[] = [];
  attendanceList: AttendanceResponse[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private enrollmentService: EnrollmentService
  ) {
    this.attendanceForm = this.fb.group({
      subjectId: ['', Validators.required],
      studentId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchAttendance();
  }

  fetchAttendance(): void {
    this.enrollmentService.getStudentsBySubjectId(this.subjectInfo.id).subscribe({
      next: (data: Student[]) => {
        this.enrolledStudents = data;
      },
      error: (error: string) => {
        this.errorMsg = 'Failed to fetch students';
      }
    });
  }

  openCamera() {
    alert("📸 Camera launched (placeholder logic)");
  }

  submitAttendance(): void {
    if (this.attendanceForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const { subjectId, studentId } = this.attendanceForm.value;

    this.attendanceService.recordAttendance({
      studentId,
      subjectId,
      attendanceTime: new Date()
    }).subscribe({
      next: (response: AttendanceResponse) => {
        this.loading = false;
        this.successMsg = 'Attendance recorded successfully!';
        this.attendanceForm.reset();
      },
      error: (error: string) => {
        this.loading = false;
        this.errorMsg = error;
      }
    });
  }

  downloadReport() {
    const docDefinition: any = {
      content: [
        {
          text: 'Attendance Report',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'],
            body: [
              ['Attendee Name', 'Attendee ID', 'Time'],
              ...this.enrolledStudents.map((student: Student) => [
                student.name || '---',
                student.id,
                student.email
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          columns: [
            {
              width: '50%',
              margin: [0, 30, 0, 0],
              table: {
                body: [
                  ['Subject:', this.subjectInfo.name],
                  ['Instructor:', this.subjectInfo.instructor || '---'],
                  ['Date:', new Date().toLocaleString()]
                ]
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1
              }
            },
            { width: '*', text: '' }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true
        }
      }
    };

    // @ts-ignore
    import('pdfmake/build/pdfmake').then((pdfmake) => {
      // @ts-ignore
      import('pdfmake/build/vfs_fonts').then((vfsFonts) => {
        pdfmake.vfs = vfsFonts?.pdfMake?.vfs || vfsFonts?.vfs;
        pdfmake.createPdf(docDefinition).download('attendance_report.pdf');
      });
    });
  }
}
