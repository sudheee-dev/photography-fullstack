import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  registerUser(userData: any) {
    return this.http.post('http://localhost:3000/api/auth/register', userData);
  }

  login(email: string, password: string) {
    return this.http.post('http://localhost:3000/api/auth/login', {
      email,
      password,
    });
  }
}
