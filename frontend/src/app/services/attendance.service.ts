import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AttendanceRecord {
  studentId: string;
  subjectId: string;
  attendanceTime: Date;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  // قائمة الطلاب المؤقتة اللي هتتنقل بين التابين
  private attendanceList: { name: string; id: string }[] = [];

  constructor(private http: HttpClient) {}

  // ----------- State Handling Methods ----------
  getAttendanceList() {
    return this.attendanceList;
  }

  addStudent(student: { name: string; id: string }) {
    this.attendanceList.push(student);
  }

  removeStudent(index: number) {
    this.attendanceList.splice(index, 1);
  }

  setAttendanceList(list: { name: string; id: string }[]) {
    this.attendanceList = list;
  }

  clear() {
    this.attendanceList = [];
  }

  // ----------- API Methods ----------
  recordAttendance(record: AttendanceRecord): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Attendance/record`, record);
  }

  getAttendanceBySubject(subjectId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/Attendance/subject/${subjectId}`);
  }

  getAttendanceByStudent(studentId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/Attendance/student/${studentId}`);
  }

 submitAttendance(subjectId: string, students: { name: string, id: string }[]): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  // غالبًا الـ backend مستني students: [...students]
  return this.http.post(
    `${environment.apiUrl}/Attendances/subjects/${subjectId}/attendees`,
    { students },
    { headers }
  );
}
faceCheckIn(subjectId: string, base64Image: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const formData = new FormData();
  formData.append('file', this.dataURItoBlob(base64Image), 'face.jpg');
  return this.http.post(
    `${environment.apiUrl}/Attendances/face-checkin?subjectId=${subjectId}`,
    formData,
    { headers }
  );
}

// استخدم الدالة دي لتحويل الـ base64 لـ Blob:
private dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}



}
