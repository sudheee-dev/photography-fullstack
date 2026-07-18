import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  registerUser(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password,
    });
  }
}
