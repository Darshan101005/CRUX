import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  currentUser = signal<any>(null);

  constructor(private http: HttpClient) {}

  signup(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { name, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.currentUser.set(res.user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  saveOnboarding(data: { platforms: string, primaryPurpose: string, role: string, email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding`, data);
  }
}
