import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Subject } from '../shared/interfaces/subject.interface';
import { Student } from '../shared/interfaces/student.interface';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // subject.service.ts
getInstructorSubjects(instructorId: string, headers: HttpHeaders): Observable<any[]> {
  return this.http.get<any[]>(`http://aps.tryasp.net/Instructors/${instructorId}/subjects`, {
    headers
  });
}






  assignSubjectToInstructor(instructorId: string, subjectId: string): Observable<any> {
    // This assumes a PUT or POST endpoint exists for assignment
    return this.http.put(`${this.apiUrl}/Instructors/${instructorId}/subjects/${subjectId}`, {});
  }

  assignSubjectToAttendee(attendeeId: string, subjectId: string): Observable<any> {
    // This assumes a PUT or POST endpoint exists for assignment
    return this.http.put(`${this.apiUrl}/Attendees/${attendeeId}/subjects/${subjectId}`, {});
  }

  getSubjectById(subjectId: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/Subjects/${subjectId}`);
  }

  getSubjectStudents(subjectId: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/Instructors/subjects/${subjectId}/students`);
  }
} 