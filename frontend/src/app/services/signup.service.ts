import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  constructor(private http: HttpClient) {}

  signup(fullName: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/login`, {
      email,
      password
    }).pipe(
      catchError(error => {
        console.error('Signup error:', error);
        return throwError(() => error.error?.message || 'Failed to sign up. Please try again.');
      })
    );
  }
} 