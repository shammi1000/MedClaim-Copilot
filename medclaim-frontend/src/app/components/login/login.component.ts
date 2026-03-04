import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  template: `
  <div class="login-page">
    <!-- Left Panel - Branding -->
    <div class="login-branding">
      <div class="brand-content">
        <div class="brand-logo">
          <mat-icon>health_and_safety</mat-icon>
        </div>
        <h1 class="brand-name">MedClaim<br>Copilot</h1>
        <p class="brand-tagline">AI-Powered Insurance Claims Processing & Compliance Platform</p>

        <div class="brand-features">
          <div class="feature-item">
            <div class="fi-icon"><mat-icon>speed</mat-icon></div>
            <div>
              <p class="fi-title">Lightning Fast Processing</p>
              <span>Process claims 5x faster with AI assistance</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="fi-icon"><mat-icon>verified_user</mat-icon></div>
            <div>
              <p class="fi-title">HIPAA Compliant</p>
              <span>End-to-end encryption and compliance monitoring</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="fi-icon"><mat-icon>bar_chart</mat-icon></div>
            <div>
              <p class="fi-title">Real-Time Analytics</p>
              <span>Deep insights into your claims operations</span>
            </div>
          </div>
        </div>

        <div class="brand-stats">
          <div class="bstat"><h3>2.4M+</h3><p>Claims Processed</p></div>
          <div class="bstat"><h3>99.9%</h3><p>Uptime SLA</p></div>
          <div class="bstat"><h3>78%</h3><p>Approval Rate</p></div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="login-form-panel">
      <div class="login-form-container">
        <div class="login-form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your MedClaim Copilot account</p>
        </div>

        <div class="demo-hint">
          <mat-icon>info</mat-icon>
          <span>Demo: Use any email + password to sign in</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-icon-wrap">
              <mat-icon class="input-icon">email</mat-icon>
              <input class="form-control login-input" type="email" formControlName="email"
                     placeholder="sarah.mitchell@medclaim.com" autocomplete="email">
            </div>
          </div>

          <div class="form-group">
            <div class="pw-label-row">
              <label>Password</label>
              <a class="forgot-link" href="#">Forgot password?</a>
            </div>
            <div class="input-icon-wrap">
              <mat-icon class="input-icon">lock</mat-icon>
              <input class="form-control login-input" [type]="showPw ? 'text' : 'password'"
                     formControlName="password" placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="pw-toggle" (click)="showPw = !showPw">
                <mat-icon>{{showPw ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </div>
          </div>

          <div class="remember-row">
            <mat-checkbox formControlName="rememberMe">Keep me signed in</mat-checkbox>
          </div>

          <button type="submit" class="btn-primary login-btn" [disabled]="isLoading">
            <mat-progress-spinner *ngIf="isLoading" diameter="20" mode="indeterminate" style="display:inline-block"></mat-progress-spinner>
            <mat-icon *ngIf="!isLoading">login</mat-icon>
            {{isLoading ? 'Signing In...' : 'Sign In'}}
          </button>
        </form>

        <div class="login-footer">
          <div class="login-divider"><span>SECURE ACCESS</span></div>
          <div class="trust-badges">
            <div class="tbadge"><mat-icon>shield</mat-icon> HIPAA Compliant</div>
            <div class="tbadge"><mat-icon>lock</mat-icon> 256-bit SSL</div>
            <div class="tbadge"><mat-icon>verified</mat-icon> SOC 2 Type II</div>
          </div>
          <p class="login-terms">By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .login-page { display: flex; min-height: 100vh; }

    /* Left Branding Panel */
    .login-branding {
      flex: 1;
      background: linear-gradient(150deg, #0f2447 0%, #1a3c6e 40%, #1e5c8a 70%, #00715a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }
    .login-branding::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(0,168,107,0.15) 0%, transparent 70%);
      top: -100px;
      right: -100px;
      border-radius: 50%;
    }
    .login-branding::after {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(26,60,110,0.3) 0%, transparent 70%);
      bottom: -50px;
      left: -50px;
      border-radius: 50%;
    }
    .brand-content { max-width: 440px; position: relative; z-index: 1; }
    .brand-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #00a86b, #00c97f);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0,168,107,0.4);
    }
    .brand-logo mat-icon { color: white; font-size: 34px; width: 34px; height: 34px; }
    .brand-name { color: white; font-size: 48px; font-weight: 800; line-height: 1.1; margin-bottom: 12px; letter-spacing: -1px; }
    .brand-tagline { color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6; margin-bottom: 40px; }
    .brand-features { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }
    .feature-item { display: flex; align-items: center; gap: 14px; }
    .fi-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .fi-icon mat-icon { color: #00c97f; font-size: 20px; }
    .fi-title { color: white; font-size: 14px; font-weight: 700; margin: 0 0 2px; }
    .feature-item span { color: rgba(255,255,255,0.6); font-size: 12px; }
    .brand-stats { display: flex; gap: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.15); }
    .bstat h3 { color: #00c97f; font-size: 28px; font-weight: 800; margin: 0 0 2px; }
    .bstat p { color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; }

    /* Right Form Panel */
    .login-form-panel {
      width: 480px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 48px;
    }
    .login-form-container { width: 100%; }
    .login-form-header { margin-bottom: 24px; }
    .login-form-header h2 { font-size: 28px; font-weight: 800; color: #1a202c; margin: 0 0 6px; }
    .login-form-header p { color: #718096; font-size: 14px; margin: 0; }
    .demo-hint { display: flex; align-items: center; gap: 8px; background: #e8f4fd; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #1a3c6e; font-weight: 500; margin-bottom: 24px; }
    .demo-hint mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .pw-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .forgot-link { font-size: 12px; color: #1a3c6e; font-weight: 600; text-decoration: none; }
    .forgot-link:hover { text-decoration: underline; }

    .input-icon-wrap { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #718096; z-index: 1; }
    .login-input { padding-left: 42px !important; font-size: 15px; }
    .pw-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #718096; display: flex; padding: 2px; }
    .pw-toggle:hover { color: #1a3c6e; }

    .remember-row { margin-bottom: 20px; font-size: 13px; }

    .login-btn { width: 100%; justify-content: center; padding: 13px; font-size: 16px; gap: 10px; }

    .login-footer { margin-top: 28px; }
    .login-divider { display: flex; align-items: center; gap: 10px; font-size: 10px; color: #718096; letter-spacing: 1px; font-weight: 600; margin-bottom: 16px; }
    .login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
    .trust-badges { display: flex; gap: 12px; justify-content: center; margin-bottom: 16px; }
    .tbadge { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #718096; font-weight: 600; }
    .tbadge mat-icon { font-size: 14px; width: 14px; height: 14px; color: #00a86b; }
    .login-terms { text-align: center; font-size: 11px; color: #718096; margin: 0; }
    .login-terms a { color: #1a3c6e; text-decoration: none; font-weight: 600; }

    @media (max-width: 900px) {
      .login-branding { display: none; }
      .login-form-panel { width: 100%; padding: 40px 24px; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPw = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private snack: MatSnackBar) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.snack.open('Please enter valid credentials.', 'Close', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(res => {
      this.isLoading = false;
      if (res.success) {
        this.snack.open('Welcome back! Signing you in...', 'Close', { duration: 2000 });
        this.router.navigate(['/dashboard']);
      } else {
        this.snack.open('Invalid credentials. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
