import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getRole(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('role');
  }

  isAdmin(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    return this.getRole() === 'ADMIN';
  }
}
