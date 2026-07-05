import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  username!: string;
  Admin: string = '';
  NormalUser: string = '';
  Post: string = '';
  PostEdit: string = '';
  PostEditandPost: string = '';
  firstName: string = '';
  lastName: string = '';
  dateogBirth: string = '';
  gender: string = '';
  email: string = '';
  password = '';
  showPassword = false;
  Confirmpassword: string = '';
  show = false;
  selectedForm = 'formGroupStepOne';
  selectedForm1 = 'formGroupStep1';
  formGroupStep: boolean = true;
  formGroupStepTwo: boolean = false;
  formGroupStepOne: boolean = false;
  formGroupStep1: boolean = false;
  Router: any;

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: Auth,
  ) {}

  preview() {
    this.show = !this.show;
    console.log('prev');
  }

  register() {
    console.log('reg button clicked');
    const permissions = [];

    if (this.PostEdit) permissions.push('POST_EDIT');
    if (this.Post) permissions.push('POST');
    if (this.PostEditandPost) permissions.push('POST_EDIT_AND_POST');

    const userData = {
      username: this.username,
      first_name: this.firstName,
      last_name: this.lastName,
      dob: this.dateogBirth,
      gender: this.gender,
      email: this.email,
      password: this.password,
      permissions: permissions.join(','),
    };

    this.authService.registerUser(userData).subscribe({
      next: (response: any) => {
        console.log('Registered:', response);
        this.snackBar.open('Registered successfully! Please log in.', 'Close', {
          duration: 3000,
        });
        // move to the login step automatically
        this.formGroupStep = false;
        this.formGroupStepTwo = true;
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.snackBar.open(err?.error?.message || 'Registration failed', 'Close', {
          duration: 3000,
        });
      },
    });
  }
  login() {
    this.snackBar.open('Successfully Logged-In!', 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });
    console.log('EMAIL:', this.email);
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log(response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.user.role.toUpperCase());
        localStorage.setItem('userId', response.user.id);

        this.router.navigate(['/postlist']);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  next() {
    this.formGroupStep = false;
    this.formGroupStepTwo = true;
    this.formGroupStepOne = false;
  }

  previousForm1() {
    this.formGroupStepTwo = false;
    this.formGroupStep = true;
  }
}
