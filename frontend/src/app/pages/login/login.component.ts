import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../../app/services/login.service';
import { jwtDecode } from 'jwt-decode';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatIconModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';
  hidePassword = true;
  bubbles = Array(6);
  showAnimatedMsg = false;
  loginSuccess = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

 login(): void {
  if (this.loginForm.invalid) return;

  const { email, password } = this.loginForm.value;

  this.loginService.login(email, password).subscribe(res => {
    console.log('API RESPONSE:', res);

    if ('error' in res) {
      this.errorMsg = res.error;
      return;
    }

    const token = res.token;
    localStorage.setItem('token', token);

    let decoded: any;
    try {
      decoded = jwtDecode(token);
      console.log('Decoded Token:', JSON.stringify(decoded, null, 2));
    } catch (e) {
      this.errorMsg = 'Invalid token';
      return;
    }

    // استخراج الدور وتأكد من أن أول حرف كبير
    let role =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.userType ||
      decoded.user_type ||
      '';

    // التأكد من أن أول حرف من الدور كبير
    role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    console.log('ROLE:', role);
    console.log('Detected role:', role);

    setTimeout(() => {
      switch (role) {
        case 'Instructor': // سيتم الآن استخدام "Instructor" مع أول حرف كبير
          this.router.navigate(['/subjects']);
          break;
        case 'Attendee': // سيتم الآن استخدام "Attendee" مع أول حرف كبير
          this.router.navigate(['/student-calendar']);
          break;
        case 'Admin': // سيتم الآن استخدام "Admin" مع أول حرف كبير
          this.router.navigate(['/dashboard']);
          break;
        default:
          this.router.navigate(['/']);
      }
    }, 100);
  });
}
}