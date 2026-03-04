import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/claim.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _loginState = new BehaviorSubject<boolean>(this.isLoggedIn());
  loginState$ = this._loginState.asObservable();

  private mockUser: User = {
    id: 'USR-001',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@medclaim.com',
    role: 'Admin',
    department: 'Claims Processing',
    phone: '+1 (555) 234-5678',
    joinDate: '2021-03-15',
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      claimUpdates: true,
      systemAlerts: true,
      weeklyReport: true
    }
  };

  login(email: string, password: string): Observable<{ success: boolean; user?: User; token?: string }> {
    if (email && password) {
      localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(this.mockUser));
      this._loginState.next(true);
      return of({ success: true, user: this.mockUser, token: 'mock-jwt-token' }).pipe(delay(800));
    }
    return of({ success: false }).pipe(delay(800));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._loginState.next(false);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : this.mockUser;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
