// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
export interface LoginResponse {
  token: string;
  [key: string]: any; // يسمح بأي خصائص إضافية
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _role = new BehaviorSubject<'Attendee' | 'Instructor' | 'Admin' | 'guest'>('guest');
  role$ = this._role.asObservable();
  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role =
          decoded.role ||
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.userType ||
          decoded.user_type ||
          'guest';

        this._role.next(role as 'Attendee' | 'Instructor' | 'Admin' | 'guest');
      } catch (e) {
        console.warn('Invalid token during service init.');
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse | { error: string }> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);

          let role = 'guest';
          try {
            const decoded: any = jwtDecode(res.token);
            role =
              decoded.role ||
              decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
              decoded.userType ||
              decoded.user_type ||
              'guest';

            // تخزين بيانات مبسطة
            const user = {
              role,
              id: decoded.sub || decoded.userId || decoded.id || ''
            };

            localStorage.setItem('user', JSON.stringify(user));
            this._role.next(role as 'Attendee' | 'Instructor' | 'Admin' | 'guest');
          } catch (e) {
            console.error('Error decoding token during login:', e);
          }
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({ error: 'Login failed. Please check your credentials.' });
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

  getCurrentUserId(): string {
    const user = this.user;
    return user && user.id ? user.id : '';
  }
}