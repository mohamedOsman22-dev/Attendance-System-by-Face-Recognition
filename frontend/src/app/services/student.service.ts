import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScheduleItem {
  subjectName: string;
  dayOfWeek: number;
  startTime: string | Date;
  endTime: string | Date;
}


@Injectable({
  providedIn: 'root'
})
export class StudentService {
private baseUrl = 'http://aps.tryasp.net';
  constructor(private http: HttpClient) {}

 getStudentSchedule(): Observable<ScheduleItem[]> {
  return this.http.get<ScheduleItem[]>(`${this.baseUrl}/Attendees/calendar`);
}
}
