import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/login`, { username: email, password });
  }

  loginAttendee(email: string, password: string): Observable<any> {
    // جرب كل الصيغ الممكنة (قم بإلغاء التعليق عن واحدة كل مرة حسب ما يعمل مع الـ backend)
    // 1. mail
    return this.http.post(`${environment.apiUrl}/Attendees/login`, { mail: email, password });
    // 2. email
    // return this.http.post(`${environment.apiUrl}/Attendees/login`, { email, password });
    // 3. username
    // return this.http.post(`${environment.apiUrl}/Attendees/login`, { username: email, password });
  } 
} 