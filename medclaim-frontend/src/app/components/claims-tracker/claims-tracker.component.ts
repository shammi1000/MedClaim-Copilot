import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsService } from '../../services/claims.service';
import { Claim } from '../../models/claim.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-claims-tracker',
  template: `
  <div class="fade-in-up">
    <div class="page-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <h1>🔍 Claims Tracker</h1>
          <p>Search, filter and manage all submitted insurance claims.</p>
        </div>
        <button class="btn-primary" routerLink="/submit-claim">
          <mat-icon>add</mat-icon> New Claim
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card filters-card">
      <div class="filters-row">
        <div class="search-bar">
          <mat-icon>search</mat-icon>
          <input placeholder="Search by Claim ID, Patient Name, Diagnosis..." [(ngModel)]="searchQuery" (input)="applyFilters()">
        </div>
        <select class="form-control filter-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="In Review">In Review</option>
        </select>
        <input class="form-control" type="date" [(ngModel)]="dateFrom" (change)="applyFilters()" placeholder="Date From" style="width:160px">
        <input class="form-control" type="date" [(ngModel)]="dateTo" (change)="applyFilters()" placeholder="Date To" style="width:160px">
        <button class="btn-outline" (click)="clearFilters()">
          <mat-icon>filter_list_off</mat-icon> Clear
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="tracker-stats">
      <div class="tracker-stat" *ngFor="let s of trackerStats">
        <span class="ts-label">{{s.label}}</span>
        <strong class="ts-count" [style.color]="s.color">{{s.count}}</strong>
      </div>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <div class="table-header">
        <span class="results-count">Showing {{filteredClaims.length}} claim(s)</span>
        <button class="btn-outline" style="font-size:12px;padding:6px 12px">
          <mat-icon style="font-size:16px">download</mat-icon> Export CSV
        </button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Patient Name</th>
              <th>Diagnosis</th>
              <th>Hospital</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let claim of paginatedClaims">
              <td><span class="claim-id-link" (click)="viewClaim(claim.id)">{{claim.id}}</span></td>
              <td>
                <div class="patient-cell">
                  <div class="patient-av">{{claim.patientName.charAt(0)}}</div>
                  {{claim.patientName}}
                </div>
              </td>
              <td>
                <span class="diag-chip">{{claim.diagnosisCode}}</span>
                <div class="diag-desc">{{claim.diagnosisDescription}}</div>
              </td>
              <td style="font-size:13px;color:#718096">{{claim.hospitalName}}</td>
              <td style="font-size:13px">{{claim.submittedDate | date:'MMM d, y'}}</td>
              <td><strong style="color:#1a3c6e">\${{claim.claimAmount | number:'1.0-0'}}</strong></td>
              <td>
                <span class="badge" [ngClass]="getBadgeClass(claim.status)">
                  <span class="badge-dot"></span>{{claim.status}}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="action-btn" (click)="viewClaim(claim.id)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button class="action-btn" matTooltip="Edit Claim">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="action-btn danger" matTooltip="Delete">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filteredClaims.length === 0" class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>No claims found matching your filters.</p>
          <button class="btn-outline" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar" *ngIf="filteredClaims.length > 0">
        <span class="page-info">Page {{currentPage}} of {{totalPages}}</span>
        <div class="page-btns">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="changePage(-1)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button class="page-btn active-page">{{currentPage}}</button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="changePage(1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .filters-card { margin-bottom: 20px; padding: 18px 24px; }
    .filters-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .filter-select { width: 160px; padding: 9px 12px; }
    .tracker-stats { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .tracker-stat { background: white; border-radius: 10px; padding: 12px 20px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; min-width: 100px; }
    .ts-label { font-size: 12px; color: #718096; font-weight: 500; }
    .ts-count { font-size: 22px; font-weight: 800; }
    .table-card { padding: 0; overflow: hidden; }
    .table-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
    .results-count { font-size: 13px; color: #718096; font-weight: 500; }
    .table-container { overflow-x: auto; }
    .claim-id-link { font-weight: 700; color: #1a3c6e; cursor: pointer; font-size: 13px; }
    .claim-id-link:hover { text-decoration: underline; }
    .patient-cell { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; }
    .patient-av { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #1a3c6e, #2a5298); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .diag-chip { background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 50px; }
    .diag-desc { font-size: 11px; color: #718096; margin-top: 2px; }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block; margin-right: 4px; }
    .action-btns { display: flex; gap: 4px; }
    .action-btn { background: none; border: none; cursor: pointer; padding: 5px; border-radius: 6px; color: #718096; display: flex; }
    .action-btn:hover { background: #f0f4f8; color: #1a3c6e; }
    .action-btn.danger:hover { background: #fee2e2; color: #e74c3c; }
    .empty-state { text-align: center; padding: 60px 20px; color: #718096; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 15px; margin-bottom: 16px; }
    .pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-top: 1px solid #e2e8f0; }
    .page-info { font-size: 13px; color: #718096; }
    .page-btns { display: flex; gap: 4px; }
    .page-btn { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; cursor: pointer; display: flex; align-items: center; font-size: 13px; }
    .page-btn:hover:not(:disabled) { background: #f0f4f8; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .active-page { background: #1a3c6e; color: white; border-color: #1a3c6e; }
  `]
})
export class ClaimsTrackerComponent implements OnInit {
  allClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  searchQuery = '';
  statusFilter = 'All';
  dateFrom = '';
  dateTo = '';
  currentPage = 1;
  pageSize = 8;
  trackerStats = [
    { label: 'Total', count: 0, color: '#1a3c6e' },
    { label: 'Pending', count: 0, color: '#f39c12' },
    { label: 'Approved', count: 0, color: '#00a86b' },
    { label: 'Rejected', count: 0, color: '#e74c3c' },
    { label: 'In Review', count: 0, color: '#3498db' }
  ];

  constructor(private claimsService: ClaimsService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => { if (p['q']) this.searchQuery = p['q']; });
    this.claimsService.getAllClaims().subscribe(claims => {
      this.allClaims = claims;
      this.applyFilters();
      this.trackerStats[0].count = claims.length;
      this.trackerStats[1].count = claims.filter(c => c.status === 'Pending').length;
      this.trackerStats[2].count = claims.filter(c => c.status === 'Approved').length;
      this.trackerStats[3].count = claims.filter(c => c.status === 'Rejected').length;
      this.trackerStats[4].count = claims.filter(c => c.status === 'In Review').length;
    });
  }

  applyFilters() {
    let result = [...this.allClaims];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c => c.id.toLowerCase().includes(q) || c.patientName.toLowerCase().includes(q) || c.diagnosisCode.toLowerCase().includes(q) || c.hospitalName.toLowerCase().includes(q));
    }
    if (this.statusFilter !== 'All') result = result.filter(c => c.status === this.statusFilter);
    if (this.dateFrom) result = result.filter(c => c.submittedDate >= this.dateFrom);
    if (this.dateTo) result = result.filter(c => c.submittedDate <= this.dateTo);
    this.filteredClaims = result;
    this.currentPage = 1;
  }

  clearFilters() { this.searchQuery = ''; this.statusFilter = 'All'; this.dateFrom = ''; this.dateTo = ''; this.applyFilters(); }

  get totalPages() { return Math.ceil(this.filteredClaims.length / this.pageSize); }
  get paginatedClaims() { return this.filteredClaims.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  changePage(d: number) { this.currentPage = Math.max(1, Math.min(this.totalPages, this.currentPage + d)); }

  getBadgeClass(status: string) {
    const m: any = { 'Approved': 'badge-approved', 'Rejected': 'badge-rejected', 'Pending': 'badge-pending', 'In Review': 'badge-review' };
    return m[status] || 'badge-pending';
  }

  viewClaim(id: string) { this.router.navigate(['/claim-detail', id]); }
}
