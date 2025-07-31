import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { SubjectService } from '../../services/subject.service';
import { jwtDecode } from "jwt-decode";
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instructor-subjects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule
  ],
  templateUrl: './instructor-subjects.component.html',
  styleUrls: ['./instructor-subjects.component.scss']
})
export class InstructorSubjectsComponent implements OnInit {
  students: { name: string; id: string }[] = [];
subjects: { subjectId: string; name: string; createdDate?: string }[] = [];
loading = true;
error: string = '';

  constructor(private subjectService: SubjectService, private router: Router) {}

  ngOnInit() {
  const token = localStorage.getItem('token');
  const instructorId = token ? (jwtDecode(token) as any).sub : null;

  if (!instructorId) {
    this.router.navigate(['/login']);
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  this.subjectService.getInstructorSubjects(instructorId, headers).subscribe({
    next: (res) => {
      this.subjects = res || [];
      this.loading = false;
      if (this.subjects.length === 0) {
        this.error = 'لا يوجد مواد لهذا المدرس.';
      }
    },
    error: () => {
      this.error = 'فشل تحميل المواد';
      this.loading = false;
    }
  });
}
openSubjectDetails(subject: any) {
  console.log('📦 Navigating to subject:', subject);

  const subjectId = subject.subjectId || subject.id || subject.name; // fallback to name

  if (!subjectId) {
    console.error('❌ subjectId غير موجود، لن يتم التوجيه!');
    return;
  }

  localStorage.setItem('selectedSubject', JSON.stringify(subject));
  this.router.navigate(['/subject-details', subjectId]);
}






}
