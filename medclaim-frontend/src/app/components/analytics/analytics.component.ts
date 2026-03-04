import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsData } from '../../models/claim.model';

@Component({
  selector: 'app-analytics',
  template: `
  <div class="fade-in-up">
    <div class="page-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <h1>📊 Analytics & Reports</h1>
          <p>Comprehensive insights into your claims operations and performance metrics.</p>
        </div>
        <div style="display:flex;gap:10px">
          <select class="form-control" style="width:150px;padding:9px 12px">
            <option>Last 12 Months</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
          <button class="btn-primary"><mat-icon>download</mat-icon> Export Report</button>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="stats-grid" *ngIf="data">
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#e8f4fd,#bde0f7)">
          <mat-icon style="color:#1a3c6e">assignment</mat-icon>
        </div>
        <div class="stat-info">
          <h3>{{data.totalClaims | number}}</h3>
          <p>Total Claims Processed</p>
          <div class="stat-trend trend-up">↑ 14% vs last year</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#d1fae5,#6ee7b7)">
          <mat-icon style="color:#00a86b">payments</mat-icon>
        </div>
        <div class="stat-info">
          <h3>\${{(data.totalPayout / 1000000).toFixed(2)}}M</h3>
          <p>Total Payout</p>
          <div class="stat-trend trend-up">↑ 8.3% YoY growth</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#fef3c7,#fde68a)">
          <mat-icon style="color:#f39c12">schedule</mat-icon>
        </div>
        <div class="stat-info">
          <h3>{{data.avgProcessingDays}}d</h3>
          <p>Avg. Processing Time</p>
          <div class="stat-trend trend-up">↓ 0.8 days improvement</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#ede9fe,#c4b5fd)">
          <mat-icon style="color:#7c3aed">percent</mat-icon>
        </div>
        <div class="stat-info">
          <h3>{{data.approvalRate}}%</h3>
          <p>Approval Rate</p>
          <div class="stat-trend trend-up">↑ 2.1% this quarter</div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="two-col-grid" style="margin-bottom:24px">
      <!-- Monthly Bar Chart -->
      <div class="card">
        <div class="chart-card-header">
          <div>
            <h3>Claims by Month</h3>
            <p>Submitted, Approved, and Rejected claims</p>
          </div>
          <div class="chart-legend">
            <span class="leg-item"><span class="leg-dot" style="background:#1a3c6e"></span>Submitted</span>
            <span class="leg-item"><span class="leg-dot" style="background:#00a86b"></span>Approved</span>
            <span class="leg-item"><span class="leg-dot" style="background:#e74c3c"></span>Rejected</span>
          </div>
        </div>
        <div class="bar-chart-container" *ngIf="data">
          <div class="bar-chart">
            <div class="bar-group" *ngFor="let m of data.monthlyData">
              <div class="bars">
                <div class="bar bar-submitted" [style.height.px]="(m.submitted / maxMonthly) * 140" [matTooltip]="'Submitted: ' + m.submitted"></div>
                <div class="bar bar-approved" [style.height.px]="(m.approved / maxMonthly) * 140" [matTooltip]="'Approved: ' + m.approved"></div>
                <div class="bar bar-rejected" [style.height.px]="(m.rejected / maxMonthly) * 140" [matTooltip]="'Rejected: ' + m.rejected"></div>
              </div>
              <span class="bar-label">{{m.month}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Pie Chart -->
      <div class="card">
        <div class="chart-card-header">
          <div>
            <h3>Claims by Status</h3>
            <p>Distribution across all statuses</p>
          </div>
        </div>
        <div class="donut-chart-container" *ngIf="data">
          <div class="donut-wrapper">
            <svg viewBox="0 0 200 200" class="donut-svg">
              <g *ngFor="let seg of donutSegments; let i = index">
                <circle
                  cx="100" cy="100" r="70"
                  fill="transparent"
                  [attr.stroke]="seg.color"
                  stroke-width="32"
                  [attr.stroke-dasharray]="seg.dash + ' ' + seg.gap"
                  [attr.stroke-dashoffset]="seg.offset"
                  transform="rotate(-90 100 100)"
                />
              </g>
              <circle cx="100" cy="100" r="50" fill="white"/>
              <text x="100" y="95" text-anchor="middle" font-size="24" font-weight="800" fill="#1a3c6e">{{data.totalClaims}}</text>
              <text x="100" y="115" text-anchor="middle" font-size="10" fill="#718096">Total Claims</text>
            </svg>
          </div>
          <div class="donut-legend">
            <div class="dl-item" *ngFor="let s of data.statusBreakdown">
              <div class="dl-dot" [style.background]="getStatusColor(s.status)"></div>
              <div class="dl-info">
                <span class="dl-label">{{s.status}}</span>
                <span class="dl-count">{{s.count}} ({{s.percentage}}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Diagnosis Codes Table -->
    <div class="card">
      <div class="chart-card-header">
        <div>
          <h3>Top Diagnosis Codes</h3>
          <p>Most frequent ICD-10 codes by claim count and payout</p>
        </div>
      </div>
      <table class="data-table" *ngIf="data">
        <thead>
          <tr>
            <th>Rank</th>
            <th>ICD-10 Code</th>
            <th>Description</th>
            <th>Claim Count</th>
            <th>Total Payout</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of data.topDiagnosisCodes; let i = index">
            <td><span class="rank-badge rank-{{i+1}}">{{i + 1}}</span></td>
            <td><span class="icd-tag">{{d.code}}</span></td>
            <td>{{d.description}}</td>
            <td><strong>{{d.count}}</strong></td>
            <td><strong style="color:#00a86b">\${{d.totalAmount | number:'1.0-0'}}</strong></td>
            <td>
              <div class="mini-bar-track">
                <div class="mini-bar" [style.width.%]="(d.count / maxDiagCount) * 100"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  styles: [`
    .chart-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .chart-card-header h3 { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
    .chart-card-header p { font-size: 12px; color: #718096; margin: 0; }
    .chart-legend { display: flex; gap: 12px; flex-shrink: 0; }
    .leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #718096; }
    .leg-dot { width: 10px; height: 10px; border-radius: 2px; }
    .bar-chart-container { overflow-x: auto; padding-bottom: 8px; }
    .bar-chart { display: flex; align-items: flex-end; gap: 12px; min-width: 600px; height: 180px; padding-bottom: 8px; }
    .bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; }
    .bars { display: flex; align-items: flex-end; gap: 3px; height: 150px; }
    .bar { width: 14px; border-radius: 4px 4px 0 0; transition: height 0.8s ease; cursor: pointer; }
    .bar:hover { opacity: 0.8; }
    .bar-submitted { background: #1a3c6e; }
    .bar-approved { background: #00a86b; }
    .bar-rejected { background: #e74c3c; }
    .bar-label { font-size: 10px; color: #718096; margin-top: 6px; font-weight: 500; }
    .donut-chart-container { display: flex; align-items: center; gap: 24px; }
    .donut-wrapper { flex-shrink: 0; }
    .donut-svg { width: 180px; height: 180px; }
    .donut-legend { display: flex; flex-direction: column; gap: 12px; flex: 1; }
    .dl-item { display: flex; align-items: center; gap: 10px; }
    .dl-dot { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; }
    .dl-info { display: flex; flex-direction: column; }
    .dl-label { font-size: 13px; font-weight: 600; color: #1a202c; }
    .dl-count { font-size: 12px; color: #718096; }
    .rank-badge { width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; }
    .rank-1 { background: #fef3c7; color: #92400e; }
    .rank-2 { background: #f1f5f9; color: #475569; }
    .rank-3 { background: #fef3c7; color: #92400e; }
    .rank-4, .rank-5 { background: #f0f4f8; color: #718096; }
    .icd-tag { background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 50px; font-size: 12px; font-weight: 700; }
    .mini-bar-track { height: 8px; background: #f0f4f8; border-radius: 4px; overflow: hidden; width: 120px; }
    .mini-bar { height: 100%; background: linear-gradient(90deg, #1a3c6e, #00a86b); border-radius: 4px; }
  `]
})
export class AnalyticsComponent implements OnInit {
  data: AnalyticsData | null = null;
  maxMonthly = 0;
  maxDiagCount = 0;
  donutSegments: any[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.analyticsService.getAnalytics().subscribe(d => {
      this.data = d;
      this.maxMonthly = Math.max(...d.monthlyData.map(m => m.submitted));
      this.maxDiagCount = Math.max(...d.topDiagnosisCodes.map(x => x.count));
      this.buildDonut(d);
    });
  }

  buildDonut(d: AnalyticsData) {
    const circumference = 2 * Math.PI * 70;
    const colors = ['#00a86b', '#e74c3c', '#f39c12', '#3498db'];
    let offset = 0;
    this.donutSegments = d.statusBreakdown.map((s, i) => {
      const pct = s.percentage / 100;
      const dash = pct * circumference;
      const gap = circumference - dash;
      const seg = { color: colors[i], dash, gap, offset: -offset };
      offset += dash;
      return seg;
    });
  }

  getStatusColor(status: string) {
    const m: any = { 'Approved': '#00a86b', 'Rejected': '#e74c3c', 'Pending': '#f39c12', 'In Review': '#3498db' };
    return m[status] || '#718096';
  }
}
