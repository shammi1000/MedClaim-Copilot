import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/claim.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  template: `
  <div class="fade-in-up">
    <div class="page-header">
      <h1>👤 My Profile & Settings</h1>
      <p>Manage your account information, preferences, and security settings.</p>
    </div>

    <div class="profile-grid">
      <!-- Profile Card -->
      <div class="card profile-card">
        <div class="profile-banner"></div>
        <div class="profile-body">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar">{{user?.name?.charAt(0)}}</div>
            <button class="change-avatar-btn" matTooltip="Change Photo"><mat-icon>camera_alt</mat-icon></button>
          </div>
          <h2 class="profile-name">{{user?.name}}</h2>
          <span class="profile-role-badge">{{user?.role}}</span>
          <p class="profile-dept"><mat-icon>business</mat-icon>{{user?.department}}</p>
          <p class="profile-email"><mat-icon>email</mat-icon>{{user?.email}}</p>
          <p class="profile-phone"><mat-icon>phone</mat-icon>{{user?.phone}}</p>
          <div class="profile-stats">
            <div class="pstat"><strong>247</strong><span>Claims Reviewed</span></div>
            <div class="pstat"><strong>98.2%</strong><span>Accuracy Rate</span></div>
            <div class="pstat"><strong>4.9d</strong><span>Avg. Process Time</span></div>
          </div>
          <div class="join-date"><mat-icon>calendar_today</mat-icon>Member since {{user?.joinDate | date:'MMMM y'}}</div>
        </div>
      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:20px">
        <!-- Account Settings -->
        <div class="card">
          <div class="settings-header"><mat-icon>manage_accounts</mat-icon><h3>Account Settings</h3></div>
          <form [formGroup]="profileForm">
            <div class="form-row-2">
              <div class="form-group">
                <label>Full Name</label>
                <input class="form-control" formControlName="name">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input class="form-control" type="email" formControlName="email">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Phone Number</label>
                <input class="form-control" formControlName="phone">
              </div>
              <div class="form-group">
                <label>Department</label>
                <input class="form-control" formControlName="department">
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Role</label>
                <select class="form-control" formControlName="role">
                  <option>Admin</option>
                  <option>Adjuster</option>
                  <option>Provider</option>
                </select>
              </div>
              <div class="form-group">
                <label>Timezone</label>
                <select class="form-control" formControlName="timezone">
                  <option>Eastern (UTC-5)</option>
                  <option>Central (UTC-6)</option>
                  <option>Mountain (UTC-7)</option>
                  <option>Pacific (UTC-8)</option>
                </select>
              </div>
            </div>
            <button class="btn-primary" type="button" (click)="saveProfile()">
              <mat-icon>save</mat-icon> Save Changes
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card">
          <div class="settings-header"><mat-icon>lock</mat-icon><h3>Change Password</h3></div>
          <form [formGroup]="passwordForm">
            <div class="form-group">
              <label>Current Password</label>
              <input class="form-control" type="password" formControlName="currentPassword" placeholder="••••••••">
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>New Password</label>
                <input class="form-control" type="password" formControlName="newPassword" placeholder="••••••••">
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <input class="form-control" type="password" formControlName="confirmPassword" placeholder="••••••••">
              </div>
            </div>
            <div class="password-strength" *ngIf="passwordForm.value.newPassword">
              <span>Password Strength:</span>
              <div class="strength-bars">
                <div class="sb" [class.active]="pwStrength >= 1" style="background:#e74c3c"></div>
                <div class="sb" [class.active]="pwStrength >= 2" style="background:#f39c12"></div>
                <div class="sb" [class.active]="pwStrength >= 3" style="background:#00a86b"></div>
              </div>
              <span class="strength-label">{{['Weak','Moderate','Strong'][pwStrength-1] || ''}}</span>
            </div>
            <button class="btn-outline" type="button" (click)="changePassword()">
              <mat-icon>lock_reset</mat-icon> Update Password
            </button>
          </form>
        </div>

        <!-- Notification Preferences -->
        <div class="card">
          <div class="settings-header"><mat-icon>notifications_active</mat-icon><h3>Notification Preferences</h3></div>
          <div class="notif-prefs" *ngIf="user?.notifications">
            <div class="pref-item">
              <div class="pref-info">
                <p>Email Notifications</p>
                <span>Receive claim updates via email</span>
              </div>
              <mat-slide-toggle [(ngModel)]="user!.notifications!.emailNotifications" color="primary"></mat-slide-toggle>
            </div>
            <div class="pref-item">
              <div class="pref-info">
                <p>SMS Notifications</p>
                <span>Get text alerts for urgent claims</span>
              </div>
              <mat-slide-toggle [(ngModel)]="user!.notifications!.smsNotifications" color="primary"></mat-slide-toggle>
            </div>
            <div class="pref-item">
              <div class="pref-info">
                <p>Claim Status Updates</p>
                <span>Notify when claims change status</span>
              </div>
              <mat-slide-toggle [(ngModel)]="user!.notifications!.claimUpdates" color="primary"></mat-slide-toggle>
            </div>
            <div class="pref-item">
              <div class="pref-info">
                <p>System Alerts</p>
                <span>Critical system and security alerts</span>
              </div>
              <mat-slide-toggle [(ngModel)]="user!.notifications!.systemAlerts" color="primary"></mat-slide-toggle>
            </div>
            <div class="pref-item">
              <div class="pref-info">
                <p>Weekly Performance Report</p>
                <span>Receive weekly analytics summary</span>
              </div>
              <mat-slide-toggle [(ngModel)]="user!.notifications!.weeklyReport" color="primary"></mat-slide-toggle>
            </div>
          </div>
          <button class="btn-primary" style="margin-top:16px" (click)="saveNotifications()">
            <mat-icon>save</mat-icon> Save Preferences
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
    .profile-card { padding: 0; overflow: hidden; }
    .profile-banner { height: 100px; background: linear-gradient(135deg, #1a3c6e, #2a5298, #00a86b); }
    .profile-body { padding: 0 24px 24px; text-align: center; }
    .profile-avatar-wrap { position: relative; display: inline-block; margin-top: -40px; margin-bottom: 12px; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1a3c6e, #00a86b); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; border: 4px solid white; }
    .change-avatar-btn { position: absolute; bottom: 0; right: 0; background: #1a3c6e; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .change-avatar-btn mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .profile-name { font-size: 20px; font-weight: 800; margin: 0 0 8px; }
    .profile-role-badge { background: linear-gradient(135deg, #1a3c6e, #2a5298); color: white; padding: 4px 14px; border-radius: 50px; font-size: 12px; font-weight: 600; }
    .profile-dept, .profile-email, .profile-phone { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: #718096; margin: 8px 0 0; }
    .profile-dept mat-icon, .profile-email mat-icon, .profile-phone mat-icon { font-size: 16px; width: 16px; height: 16px; color: #1a3c6e; }
    .profile-stats { display: flex; gap: 0; margin: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .pstat { flex: 1; padding: 14px 8px; display: flex; flex-direction: column; }
    .pstat:not(:last-child) { border-right: 1px solid #e2e8f0; }
    .pstat strong { font-size: 20px; font-weight: 800; color: #1a3c6e; }
    .pstat span { font-size: 10px; color: #718096; font-weight: 500; margin-top: 2px; }
    .join-date { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #718096; }
    .join-date mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .settings-header { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .settings-header mat-icon { color: #1a3c6e; }
    .settings-header h3 { font-size: 15px; font-weight: 700; margin: 0; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .password-strength { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; font-size: 12px; color: #718096; }
    .strength-bars { display: flex; gap: 4px; }
    .sb { width: 32px; height: 5px; border-radius: 3px; background: #e2e8f0; }
    .sb.active { opacity: 1; }
    .sb:not(.active) { opacity: 0.3; }
    .strength-label { font-weight: 600; color: #1a202c; }
    .notif-prefs { display: flex; flex-direction: column; gap: 0; }
    .pref-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f0f4f8; }
    .pref-info p { font-size: 14px; font-weight: 600; margin: 0 0 2px; }
    .pref-info span { font-size: 12px; color: #718096; }
    @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  get pwStrength() {
    const pw = this.passwordForm?.value?.newPassword || '';
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10 && /[A-Z]/.test(pw)) s++;
    if (/[!@#$%^&*]/.test(pw)) s++;
    return s;
  }

  constructor(private authService: AuthService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.profileForm = this.fb.group({
      name: [this.user?.name, Validators.required],
      email: [this.user?.email, [Validators.required, Validators.email]],
      phone: [this.user?.phone],
      department: [this.user?.department],
      role: [this.user?.role],
      timezone: ['Eastern (UTC-5)']
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  saveProfile() {
    this.snack.open('✅ Profile updated successfully!', 'Close', { duration: 3000 });
  }

  changePassword() {
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.snack.open('⚠️ Passwords do not match.', 'Close', { duration: 3000 });
      return;
    }
    this.snack.open('✅ Password updated successfully!', 'Close', { duration: 3000 });
    this.passwordForm.reset();
  }

  saveNotifications() {
    this.snack.open('✅ Notification preferences saved!', 'Close', { duration: 3000 });
  }
}
