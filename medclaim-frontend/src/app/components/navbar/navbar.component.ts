import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Notification, User } from '../../models/claim.model';

@Component({
  selector: 'app-navbar',
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <button class="toggle-btn" (click)="onToggle()">
          <mat-icon>{{menuOpen ? 'menu_open' : 'menu'}}</mat-icon>
        </button>
        <div class="page-breadcrumb">
          <span class="breadcrumb-home">MedClaim Copilot</span>
          <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
          <span class="breadcrumb-current">{{pageTitle}}</span>
        </div>
      </div>
      <div class="navbar-right">
        <div class="search-container">
          <mat-icon class="search-icon">search</mat-icon>
          <input placeholder="Search claims, patients..." class="nav-search" (keyup.enter)="search($event)">
        </div>
        <button class="icon-btn" [matMenuTriggerFor]="notifMenu" [matBadge]="unreadCount" matBadgeColor="warn" matBadgeSize="small">
          <mat-icon>notifications</mat-icon>
        </button>
        <mat-menu #notifMenu="matMenu" class="notif-menu">
          <div class="notif-header">
            <h4>Notifications</h4>
            <span class="notif-count">{{unreadCount}} new</span>
          </div>
          <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.read" (click)="markRead(n)">
            <mat-icon class="notif-icon" [class]="'notif-' + n.type">
              {{n.type === 'success' ? 'check_circle' : n.type === 'warning' ? 'warning' : n.type === 'error' ? 'error' : 'info'}}
            </mat-icon>
            <div class="notif-content">
              <p>{{n.message}}</p>
              <span>{{n.time}}</span>
            </div>
          </div>
        </mat-menu>
        <button class="icon-btn" routerLink="/profile">
          <mat-icon>settings</mat-icon>
        </button>
        <button class="user-avatar-btn" [matMenuTriggerFor]="userMenu">
          <div class="avatar">{{currentUser?.name?.charAt(0)}}</div>
          <div class="user-info-nav">
            <span class="user-name-nav">{{currentUser?.name?.split(' ')[0]}}</span>
            <span class="user-role-nav">{{currentUser?.role}}</span>
          </div>
          <mat-icon>keyboard_arrow_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile"><mat-icon>person</mat-icon> My Profile</button>
          <button mat-menu-item routerLink="/analytics"><mat-icon>bar_chart</mat-icon> Analytics</button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()" style="color:#e74c3c"><mat-icon style="color:#e74c3c">logout</mat-icon> Sign Out</button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 64px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-left { display: flex; align-items: center; gap: 16px; }
    .toggle-btn { background: none; border: none; cursor: pointer; color: #718096; display: flex; padding: 6px; border-radius: 8px; }
    .toggle-btn:hover { background: #f0f4f8; }
    .page-breadcrumb { display: flex; align-items: center; gap: 4px; }
    .breadcrumb-home { font-size: 13px; color: #718096; }
    .breadcrumb-sep { font-size: 16px; color: #cbd5e0; }
    .breadcrumb-current { font-size: 14px; font-weight: 600; color: #1a202c; }

    .navbar-right { display: flex; align-items: center; gap: 8px; }
    .search-container {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f0f4f8;
      border-radius: 10px;
      padding: 7px 12px;
    }
    .search-icon { font-size: 18px; color: #718096; }
    .nav-search { border: none; background: transparent; outline: none; font-size: 14px; color: #1a202c; width: 200px; font-family: 'Inter', sans-serif; }
    .icon-btn { background: none; border: none; cursor: pointer; color: #718096; padding: 8px; border-radius: 8px; display: flex; position: relative; }
    .icon-btn:hover { background: #f0f4f8; color: #1a3c6e; }
    .user-avatar-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .user-avatar-btn:hover { background: #f0f4f8; }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a3c6e, #00a86b);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }
    .user-info-nav { display: flex; flex-direction: column; align-items: flex-start; }
    .user-name-nav { font-size: 13px; font-weight: 600; color: #1a202c; line-height: 1; }
    .user-role-nav { font-size: 11px; color: #718096; }

    .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
    .notif-header h4 { font-size: 14px; font-weight: 700; margin: 0; }
    .notif-count { background: #1a3c6e; color: white; font-size: 11px; padding: 2px 8px; border-radius: 50px; font-weight: 600; }
    .notif-item { display: flex; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f0f4f8; min-width: 320px; }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #f0f4f8; }
    .notif-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .notif-icon.notif-success { color: #27ae60; }
    .notif-icon.notif-warning { color: #f39c12; }
    .notif-icon.notif-error { color: #e74c3c; }
    .notif-icon.notif-info { color: #3498db; }
    .notif-content p { font-size: 13px; font-weight: 500; color: #1a202c; margin: 0; line-height: 1.4; }
    .notif-content span { font-size: 11px; color: #718096; }
  `]
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  menuOpen = true;
  pageTitle = 'Dashboard';
  currentUser: User | null = null;
  unreadCount = 3;

  notifications: Notification[] = [
    { id: '1', message: 'CLM-2024-003 requires urgent review', type: 'warning', time: '5 min ago', read: false },
    { id: '2', message: 'CLM-2024-001 has been approved', type: 'success', time: '1 hour ago', read: false },
    { id: '3', message: 'New compliance rule update available', type: 'info', time: '2 hours ago', read: false },
    { id: '4', message: 'CLM-2024-004 was rejected', type: 'error', time: '3 hours ago', read: true },
    { id: '5', message: 'Weekly analytics report is ready', type: 'info', time: '1 day ago', read: true }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.router.events.subscribe(e => {
      const url = this.router.url;
      const titles: any = {
        '/dashboard': 'Dashboard', '/submit-claim': 'Submit New Claim',
        '/claims-tracker': 'Claims Tracker', '/compliance-checker': 'Compliance Checker',
        '/analytics': 'Analytics & Reports', '/profile': 'My Profile'
      };
      this.pageTitle = titles[url.split('?')[0]] || 'Dashboard';
    });
  }

  onToggle() {
    this.menuOpen = !this.menuOpen;
    this.toggleSidebar.emit();
  }

  markRead(n: Notification) {
    n.read = true;
    this.unreadCount = this.notifications.filter(x => !x.read).length;
  }

  search(event: any) {
    if (event.target.value) this.router.navigate(['/claims-tracker'], { queryParams: { q: event.target.value } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
