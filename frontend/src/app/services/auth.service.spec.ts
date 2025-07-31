// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _role = new BehaviorSubject<'student' | 'instructor' | 'admin' | 'guest'>('guest');
  role$ = this._role.asObservable();
  private API_URL = 'http://aps.tryasp.net/api'; // Use actual base API URL

  constructor(private http: HttpClient) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.role) this._role.next(user.role);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      tap((res) => {
        // Assume response contains token + userType
        if (res && res.token && res.userType) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res));
          this._role.next(res.userType);
        }
      }),
      catchError((err) => {
        return of({ error: 'Invalid credentials' });
      })
    );
  }

  logout() {
    localStorage.clear();
    this._role.next('guest');
  }

  get role() {
    return this._role.value;
  }

  get token() {
    return localStorage.getItem('token');
  }

  get user() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
}
