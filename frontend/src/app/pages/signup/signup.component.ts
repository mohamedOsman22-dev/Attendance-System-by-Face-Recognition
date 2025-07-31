import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { DataService } from '../../../app/shared/data.service';

interface SignupResponse {
  id: string;
  name: string;
  email: string;
  userType: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule
  ]
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  hidePassword = true;
  hideConfirmPassword = true;
  bubbles = Array(6);
  showAnimatedMsg = false;
  signupSuccess = false;
  userTypes = [
    { label: 'Attendee', value: 'Attendee' },
    { label: 'Instructor', value: 'Instructor' },
    { label: 'Admin', value: 'Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      userType: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showAnimatedMsg = false;
      const { name, email, password, userType } = this.signupForm.value;
      this.dataService.register({
        fullName: name,
        email,
        password,
        role: userType
      }).subscribe({
        next: (response: any) => {
          this.signupSuccess = true;
          this.showAnimatedMsg = true;
          setTimeout(() => { this.showAnimatedMsg = false; }, 2500);
          setTimeout(() => { this.router.navigate(['/login']); }, 1200);
        },
        error: (error) => {
          this.signupSuccess = false;
          this.errorMessage = error.message || 'Failed to create account. Please try again.';
          this.showAnimatedMsg = true;
          setTimeout(() => { this.showAnimatedMsg = false; }, 2500);
          this.isLoading = false;
        }
      });
    }
  }
}
