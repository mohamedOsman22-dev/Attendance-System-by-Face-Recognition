import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// === Interfaces ===
export interface Subject {
  id: string;
  name: string;
  description?: string;
  instructorId?: string;
  instructorIds: string[];
  dates: {
    id: any;
    day?: string;
    dayOfWeek?: number;
    from?: string;
    to?: string;
    startTime?: string;
    endTime?: string;
  }[];
  subjectDates?: {
    day?: string;
    dayOfWeek?: number;
    from?: string;
    to?: string;
    startTime?: string;
    endTime?: string;
  }[];
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  number?: string;
  subjects: string[]; 
  password?: string;// ids of subjects
  // خصائص إضافية محتملة من الـ API
  fullName?: string;
  userName?: string;
  mail?: string;
  userEmail?: string;
}

export interface Student {  
  id: string;
  name: string;
  email: string;
  avatar?: string;
  number?: string;
  assignedSubjects: string[];
  password?: string; // ids of subjects
}

// =============== Service ===============
@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing.');
    }
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Subjects`, this.getAuthHeaders());
  }
  getInstructors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Instructors`, this.getAuthHeaders());
  }
  getStudents() {
    return this.http.get(`${this.apiUrl}/Attendees`, this.getAuthHeaders());
  }

  // ربط التسجيل بالـ API
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, data);
  }

  // --- Add/Edit/Delete Subjects ---
  addSubject(subj: Subject) {
    subj.id = subj.id || this.randomId('s');
    subj.instructorIds = subj.instructorIds || [];
    subj.dates = subj.dates || [];
    return this.http.post(`${this.apiUrl}/Subjects`, subj, this.getAuthHeaders());
  }
  editSubject(subj: Subject) {
    return this.http.put(`${this.apiUrl}/Subjects/${subj.id}`, subj, this.getAuthHeaders());
  }
  deleteSubject(subjId: string) {
    return this.http.delete(`${this.apiUrl}/Subjects/${subjId}`, this.getAuthHeaders());
  }

  // === Helper to generate a valid username from email or random string ===
  private generateUsername(email: string): string {
    let base = (email || '').split('@')[0] || '';
    base = base.replace(/[^a-zA-Z0-9]/g, '');
    if (!base) {
      base = 'user' + Math.random().toString(36).substring(2, 8);
    }
    return base;
  }

  // --- Add/Edit/Delete Instructor ---
  addInstructor(ins: Instructor) {
    const body = {
      fullName: ins.name,
      email: ins.email,
      password: ins.password || '123456',
      number: ins.number || ''
    };
    return this.http.post(`${this.apiUrl}/Instructors`, body, this.getAuthHeaders());
  }
  editInstructor(ins: Instructor) {
    const username = this.generateUsername(ins.email);
    const body = {
      dto: {
        fullName: ins.name,
        mail: ins.email,
        password: ins.password || '123456',
        number: ins.number ? Number(ins.number) : null,
        subjects: ins.subjects || [],
        username: username
      }
    };
    return this.http.patch(`${this.apiUrl}/Instructors/${ins.id}`, body, this.getAuthHeaders());
  }
  deleteInstructor(insId: string) {
    return this.http.delete(`${this.apiUrl}/Instructors/${insId}`, this.getAuthHeaders());
  }
  uploadInstructorImage(instructorId: string, file: File) {
    if (!instructorId) {
      console.error('No instructorId provided for image upload!');
      return { subscribe: () => {} } as any; // Prevents API call if no ID
    }
    const formData = new FormData();
    formData.append('Name', file.name);
    formData.append('FileName', file.name);
    formData.append('ContentType', file.type);
    formData.append('ContentDisposition', 'form-data');
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Instructors/${instructorId}/image`, formData, this.getAuthHeaders());
  }

  // --- Add/Edit/Delete Student ---
  addStudent(st: Student) {
    return this.http.post(`${this.apiUrl}/Attendees`, st, this.getAuthHeaders());
  }
  editStudent(st: Student) {
    return this.http.patch(`${this.apiUrl}/Attendees/${st.id}`, st, this.getAuthHeaders());
  }
  deleteStudent(id: string) {
    return this.http.delete(`${this.apiUrl}/Attendees/${id}`, this.getAuthHeaders());
  }

  // --- Assign subject to instructor ---
  assignSubjectToInstructor(instructorId: string, subjectId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/Instructors/${instructorId}/subjects/${subjectId}`, {}, this.getAuthHeaders());
  }

  // --- Assign subject to student ---
  assignSubjectToStudent(studentId: string, subjId: string) {
    this.http.post(`${this.apiUrl}/Attendees/${studentId}/subjects/${subjId}`, {}, this.getAuthHeaders()).subscribe();
  }

  // === New: Get subjects by instructor ===
  getSubjectsByInstructorId(instructorId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/Instructors/${instructorId}/subjects`, this.getAuthHeaders());}



  // === Helpers ===
  getInstructorName(id: string): string {
    // Implementation needed
    return '';
  }
  getSubjectName(id: string): string {
    // Implementation needed
    return '';
  }
  private randomId(prefix = '') {
    return prefix + Math.random().toString(36).substr(2, 10);
  }

  getInstructorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Instructors/${id}`, this.getAuthHeaders());
  }

  getSubjectById(subjectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Subjects/${subjectId}`, this.getAuthHeaders());
  }
  patchSubject(subjectId: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/Subjects/${subjectId}`, data, this.getAuthHeaders());
  }
  deleteAllSubjects(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Subjects/all-subjects`, this.getAuthHeaders());
  }
  getSubjectAttendees(subjectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Subjects/${subjectId}/attendees`, this.getAuthHeaders());
  }
  postSubjectDates(subjectId: string, data: any): Observable<any> {
    const dayOfWeek = typeof data.day === 'string'
      ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(data.day)
      : (data.dayOfWeek ?? 0);

    function toTimeString(val: string): string {
      if (!val) return '00:00:00';
      if (val.length === 5) return val + ':00';
      return val;
    }

    // حماية إضافية: لا ترسل إذا الوقت ناقص
    const startTime = toTimeString(data.from || data.startTime);
    const endTime = toTimeString(data.to || data.endTime);

    if (!startTime || !endTime || startTime === '00:00:00' || endTime === '00:00:00') {
      return throwError(() => new Error('StartTime and EndTime are required'));
    }

    const body = {
      dayOfWeek,
      startTime,
      endTime
    };

    return this.http.post(`${this.apiUrl}/Subjects/${subjectId}/subject_dates`, body, this.getAuthHeaders());
  }
  deleteSubjectDate(subjectId: string, subjectDateId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Subjects/${subjectId}/subject_dates/${subjectDateId}`, this.getAuthHeaders());
  }

  // --- Assign subject to attendee ---
  assignSubjectToAttendee(attendeeId: string, subjectId: string) {
    return this.http.put(`${this.apiUrl}/Attendees/${attendeeId}/subjects/${subjectId}`, {}, this.getAuthHeaders());
  }
  getSubjectsByAttendeeId(attendeeId: string) {
    return this.http.get(`${this.apiUrl}/Attendees/${attendeeId}/subjects`, this.getAuthHeaders());
  }
  removeSubjectFromAttendee(attendeeId: string, subjectId: string) {
    return this.http.delete(`${this.apiUrl}/Attendees/${attendeeId}/subjects/${subjectId}`, this.getAuthHeaders());
  }
  // --- Upload images for training ---
  uploadImagesForTraining(attendeeId: string, files: File[]) {
    if (!attendeeId) throw new Error('attendeeId is required for image upload');
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post(`${this.apiUrl}/Attendees/${attendeeId}/upload_images_for_training`, formData, this.getAuthHeaders());
  }
  // --- Delete all attendees ---
  deleteAllAttendees() {
    return this.http.delete(`${this.apiUrl}/Attendees/all-attendees`, this.getAuthHeaders());
  }

  uploadStudentAvatar(studentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Attendees/${studentId}/image`, formData, this.getAuthHeaders());
  }

  getStudentById(id: string) {
    return this.http.get(`${this.apiUrl}/Attendees/${id}`, this.getAuthHeaders());
  }

  // === Calendar Events ===
  getCalendarEvents() {
    return this.http.get<any[]>(`${this.apiUrl}/Attendances/calendar`, this.getAuthHeaders());
  }

  uploadAttendeeImage(attendeeId: string, file: File) {
    if (!attendeeId) {
      console.error('No attendeeId provided for image upload!');
      return { subscribe: () => {} } as any;
    }
    const formData = new FormData();
    formData.append('Name', file.name);
    formData.append('FileName', file.name);
    formData.append('ContentType', file.type);
    formData.append('ContentDisposition', 'form-data');
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Attendees/${attendeeId}/image`, formData, this.getAuthHeaders());
  }

  getSubjectDatesForStudent(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/student/${studentId}/subjects/dates`);
  }

  /**
   * Call the backend endpoint to auto-register a user (instructor or attendee) by ID
   * @param id The user ID (instructor or attendee)
   */
  autoRegisterUser(id: string) {
    return this.http.post(`${this.apiUrl}/Auth/auto-register/${id}`, {});
  }
  
  getStudentCalendar(studentId: string): Observable<any> {
    // قم بإنشاء الطلب الذي يرسل إلى الـ API للحصول على البيانات
    return this.http.get(`${this.apiUrl}/attendances/${studentId}/calendar`);
  }
}
