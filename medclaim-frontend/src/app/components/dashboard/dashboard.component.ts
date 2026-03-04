import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClaimsService } from '../../services/claims.service';
import { Claim } from '../../models/claim.model';

@Component({
  selector: 'app-dashboard',
  template: `
  <div class="fade-in-up">
    <div class="page-header">
      <h1>Welcome back, Dr. Mitchell 👋</h1>
      <p>Here's what's happening with your claims today — {{today | date:'MMMM d, y'}}</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" routerLink="/claims-tracker">
        <div class="stat-icon" style="background: linear-gradient(135deg, #e8f4fd, #bde0f7)">
          <mat-icon style="color:#1a3c6e">assignment</mat-icon>
        </div>
        <div class="stat-info">
          <h3>{{stats.total}}</h3>
          <p>Total Claims</p>
          <div class="stat-trend trend-up">↑ 12% this month</div>
        </div>
      </div>
      <div class="stat-card" routerLink="/claims-tracker">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fff3cd, #ffe082)">
          <mat-icon style="color:#f39c12">pending_actions</mat-icon>
        </div>
        <div class="stat-info">
          <h3>{{stats.pending}}</h3>
          <p>Pending Review</p>
          <div class="stat-trend trend-down">↑ 2 new today</div>
        </div>
      </div>
      <div class="stat-card" routerLink="/claims-tracker">
        <div class="stat-icon" style="background: linear-gradient(135deg, #d1fae5, #6ee7b7)">
          <mat-icon style="color:#00a86b">check_circle</mat-icon>
        </div>
        <div class="stat-info">
          <h3>{{stats.approved}}</h3>
          <p>Approved Claims</p>
          <div class="stat-trend trend-up">↑ 8% this week</div>
        </div>
      </div>
      <div class="stat-card" routerLink="/claims-tracker">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fee2e2, #fca5a5)">
          <mat-icon style="color:#e74c3c">cancel</mat-icon>
        </div>
        <div class="stat-info">
          <h3>{{stats.rejected}}</h3>
          <p>Rejected Claims</p>
          <div class="stat-trend trend-down">↓ 3% vs last week</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-bar">
      <button class="btn-primary" routerLink="/submit-claim">
        <mat-icon>add_circle</mat-icon> Submit New Claim
      </button>
      <button class="btn-accent" routerLink="/claims-tracker">
        <mat-icon>track_changes</mat-icon> Track Claims
      </button>
      <button class="btn-outline" routerLink="/compliance-checker">
        <mat-icon>verified_user</mat-icon> Run Compliance Check
      </button>
      <button class="btn-outline" routerLink="/analytics">
        <mat-icon>bar_chart</mat-icon> View Reports
      </button>
    </div>

    <!-- Main Content -->
    <div class="two-col-grid" style="margin-top:24px">
      <!-- Recent Claims Table -->
      <div class="card" style="grid-column: span 1">
        <div class="card-header">
          <h2><mat-icon class="card-icon">receipt_long</mat-icon> Recent Claims</h2>
          <a routerLink="/claims-tracker" class="view-all-link">View All →</a>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Patient</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let claim of recentClaims" (click)="viewClaim(claim.id)" style="cursor:pointer">
              <td><span class="claim-id">{{claim.id}}</span></td>
              <td>
                <div class="patient-cell">
                  <div class="patient-avatar">{{claim.patientName.charAt(0)}}</div>
                  <div>
                    <p class="patient-name">{{claim.patientName}}</p>
                    <p class="patient-diag">{{claim.diagnosisCode}}</p>
                  </div>
                </div>
              </td>
              <td><strong>{{'$' + (claim.claimAmount | number:'1.0-0')}}</strong></td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(claim.status)">
                  {{claim.status}}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:20px">
        <!-- Payout Card -->
        <div class="payout-card">
          <div class="payout-icon"><mat-icon>payments</mat-icon></div>
          <div>
            <p class="payout-label">Total Payout This Month</p>
            <h2 class="payout-amount">{{ '$' + (stats.totalAmount | number:'1.0-0') }}</h2>
            <p class="payout-sub">Across {{stats.total}} claims</p>
          </div>
        </div>

        <!-- Status Distribution -->
        <div class="card">
          <div class="card-header"><h2><mat-icon class="card-icon">donut_large</mat-icon> Status Overview</h2></div>
          <div class="status-bars">
            <div class="status-bar-item" *ngFor="let item of statusItems">
              <div class="status-bar-label">
                <span>{{item.label}}</span>
                <span class="status-bar-count">{{item.count}}</span>
              </div>
              <div class="status-bar-track">
                <div class="status-bar-fill" [style.width.%]="item.pct" [style.background]="item.color"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- In Review Alert -->
        <div class="alert-card" *ngIf="stats.inReview > 0">
          <mat-icon class="alert-icon">warning</mat-icon>
          <div>
            <p class="alert-title">{{stats.inReview}} Claims Need Attention</p>
            <p class="alert-sub">Claims are awaiting adjuster review.</p>
          </div>
          <button class="btn-outline" routerLink="/claims-tracker" style="font-size:12px;padding:6px 12px">Review</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .quick-actions-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .card-header h2 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; margin: 0; }
    .card-icon { color: #1a3c6e; font-size: 20px; }
    .view-all-link { font-size: 13px; color: #1a3c6e; font-weight: 600; text-decoration: none; }
    .view-all-link:hover { text-decoration: underline; }
    .claim-id { font-weight: 600; color: #1a3c6e; font-size: 13px; }
    .patient-cell { display: flex; align-items: center; gap: 10px; }
    .patient-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #1a3c6e, #00a86b); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
    .patient-name { font-size: 13px; font-weight: 600; margin: 0; }
    .patient-diag { font-size: 11px; color: #718096; margin: 0; }
    .payout-card { background: linear-gradient(135deg, #1a3c6e 0%, #2a5298 100%); border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 16px; }
    .payout-icon { width: 52px; height: 52px; border-radius: 12px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
    .payout-icon mat-icon { color: white; font-size: 26px; }
    .payout-label { color: rgba(255,255,255,0.7); font-size: 13px; margin: 0; }
    .payout-amount { color: white; font-size: 30px; font-weight: 800; margin: 2px 0; }
    .payout-sub { color: rgba(255,255,255,0.5); font-size: 12px; margin: 0; }
    .status-bars { display: flex; flex-direction: column; gap: 12px; }
    .status-bar-item {}
    .status-bar-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; font-weight: 500; color: #718096; }
    .status-bar-count { font-weight: 700; color: #1a202c; }
    .status-bar-track { height: 8px; background: #f0f4f8; border-radius: 4px; overflow: hidden; }
    .status-bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
    .alert-card { background: #fff8e6; border: 1px solid #ffc107; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; }
    .alert-icon { color: #f39c12; font-size: 24px; }
    .alert-title { font-size: 14px; font-weight: 700; color: #856404; margin: 0; }
    .alert-sub { font-size: 12px; color: #a07510; margin: 0; }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  recentClaims: Claim[] = [];
  stats = { total: 0, pending: 0, approved: 0, rejected: 0, inReview: 0, totalAmount: 0 };
  statusItems = [
    { label: 'Approved', count: 0, pct: 0, color: '#00a86b' },
    { label: 'Pending', count: 0, pct: 0, color: '#f39c12' },
    { label: 'Rejected', count: 0, pct: 0, color: '#e74c3c' },
    { label: 'In Review', count: 0, pct: 0, color: '#3498db' }
  ];

  constructor(private claimsService: ClaimsService, private router: Router) {}

  ngOnInit() {
    this.claimsService.getAllClaims().subscribe(claims => {
      this.recentClaims = claims.slice(0, 5);
    });
    this.claimsService.getClaimStats().subscribe(s => {
      this.stats = s;
      this.statusItems[0].count = s.approved; this.statusItems[0].pct = (s.approved / s.total) * 100;
      this.statusItems[1].count = s.pending; this.statusItems[1].pct = (s.pending / s.total) * 100;
      this.statusItems[2].count = s.rejected; this.statusItems[2].pct = (s.rejected / s.total) * 100;
      this.statusItems[3].count = s.inReview; this.statusItems[3].pct = (s.inReview / s.total) * 100;
    });
  }

  getStatusClass(status: string) {
    const map: any = { 'Approved': 'badge-approved', 'Rejected': 'badge-rejected', 'Pending': 'badge-pending', 'In Review': 'badge-review' };
    return map[status] || 'badge-pending';
  }

  viewClaim(id: string) { this.router.navigate(['/claim-detail', id]); }
}
