import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(private http: HttpClient) {}

  getStudentsBySubjectId(subjectId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/Enrollment/subject/${subjectId}`);
  }

  getSubjectsByStudentId(studentId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/Enrollment/student/${studentId}`);
  }

  enrollStudent(studentId: string, subjectId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Enrollment`, { studentId, subjectId });
  }
} 