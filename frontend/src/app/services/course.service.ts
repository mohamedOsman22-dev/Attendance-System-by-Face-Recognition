import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course, CreateCourseDto, UpdateCourseDto } from '../shared/interfaces/course.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // تأكد من أن الرابط لا يحتوي على /api في النهاية
  private apiUrl = `${environment.apiUrl}`;
;

  constructor(private http: HttpClient) {}

  // Get all courses for the current instructor
  getInstructorCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/instructor`);
  }

  // Get a specific course by ID
  getCourseById(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${courseId}`);
  }

  // Create a new course
  createCourse(courseData: CreateCourseDto): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, courseData);
  }

  // Update an existing course
  updateCourse(courseId: string, courseData: UpdateCourseDto): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/${courseId}`, courseData);
  }

  // Delete a course
  deleteCourse(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${courseId}`);
  }

  // Get enrolled students for a course
  getEnrolledStudents(courseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${courseId}/students`);
  }

  // Update course status
  updateCourseStatus(courseId: string, status: string): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/${courseId}/status`, { status });
  }
}
