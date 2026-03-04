import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplianceService } from '../../services/compliance.service';
import { ComplianceResult } from '../../models/claim.model';
import { ClaimsService } from '../../services/claims.service';
import { Claim } from '../../models/claim.model';

@Component({
  selector: 'app-compliance-checker',
  template: `
  <div class="fade-in-up">
    <div class="page-header">
      <h1>✅ Compliance Checker</h1>
      <p>AI-powered compliance validation for insurance claims — HIPAA, ACA, CMS standards.</p>
    </div>

    <div class="two-col-grid">
      <!-- Input Panel -->
      <div class="card">
        <h2 class="section-title"><mat-icon>input</mat-icon> Claim Input</h2>
        <div style="margin-bottom:16px">
          <label class="tab-label">Select from existing claims:</label>
          <select class="form-control" (change)="loadClaim($event)" style="margin-top:6px">
            <option value="">— Select a Claim —</option>
            <option *ngFor="let c of allClaims" [value]="c.id">{{c.id}} — {{c.patientName}}</option>
          </select>
        </div>
        <div class="divider-text"><span>OR ENTER MANUALLY</span></div>
        <form [formGroup]="claimForm">
          <div class="form-group">
            <label>ICD-10 Diagnosis Code *</label>
            <div style="display:flex;gap:8px">
              <input class="form-control" formControlName="diagnosisCode" placeholder="e.g. M54.5" style="text-transform:uppercase;flex:1" (input)="onIcdInput($event)">
              <button class="btn-outline" style="white-space:nowrap;padding:9px 14px" (click)="validateIcd()" type="button">
                <mat-icon style="font-size:16px">search</mat-icon> Validate
              </button>
            </div>
            <div class="icd-validation" *ngIf="icdResult !== null">
              <mat-icon [style.color]="icdResult.valid ? '#00a86b' : '#e74c3c'">{{icdResult.valid ? 'check_circle' : 'cancel'}}</mat-icon>
              <span [style.color]="icdResult.valid ? '#00a86b' : '#e74c3c'">{{icdResult.description}}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Policy Number</label>
            <input class="form-control" formControlName="policyNumber" placeholder="POL-2024-XXX">
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Treatment Date</label>
              <input class="form-control" type="date" formControlName="treatmentDate">
            </div>
            <div class="form-group">
              <label>Claim Amount ($)</label>
              <input class="form-control" type="number" formControlName="claimAmount" placeholder="0.00">
            </div>
          </div>
          <div class="form-group">
            <label>Hospital / Facility Name</label>
            <input class="form-control" formControlName="hospitalName" placeholder="Hospital Name">
          </div>
          <div class="form-group">
            <label>Documents Attached</label>
            <select class="form-control" formControlName="documentCount">
              <option value="0">No documents</option>
              <option value="1">1 document</option>
              <option value="2">2-3 documents</option>
              <option value="5">4+ documents</option>
            </select>
          </div>
          <button class="btn-primary run-btn" (click)="runCheck()" [disabled]="isChecking" type="button">
            <mat-progress-spinner *ngIf="isChecking" diameter="18" mode="indeterminate" color="accent"></mat-progress-spinner>
            <mat-icon *ngIf="!isChecking">verified_user</mat-icon>
            {{isChecking ? 'Running AI Analysis...' : 'Run Compliance Check'}}
          </button>
        </form>
      </div>

      <!-- Results Panel -->
      <div>
        <!-- No result yet -->
        <div class="card empty-result" *ngIf="!result && !isChecking">
          <mat-icon class="empty-result-icon">health_and_safety</mat-icon>
          <h3>Ready to Check Compliance</h3>
          <p>Fill in claim details and click "Run Compliance Check" to receive AI-powered compliance analysis.</p>
          <div class="check-list">
            <div class="check-item"><mat-icon style="color:#00a86b">check</mat-icon> ICD-10 Code Validation</div>
            <div class="check-item"><mat-icon style="color:#00a86b">check</mat-icon> HIPAA 5010 Standards</div>
            <div class="check-item"><mat-icon style="color:#00a86b">check</mat-icon> ACA Section 2719 Compliance</div>
            <div class="check-item"><mat-icon style="color:#00a86b">check</mat-icon> CMS Filing Requirements</div>
            <div class="check-item"><mat-icon style="color:#00a86b">check</mat-icon> Documentation Standards</div>
          </div>
        </div>

        <!-- Loading -->
        <div class="card loading-card" *ngIf="isChecking">
          <mat-progress-spinner mode="indeterminate" diameter="60" style="margin:0 auto 20px"></mat-progress-spinner>
          <h3>Analyzing Claim...</h3>
          <p>Running AI compliance checks against HIPAA, ACA, and CMS standards</p>
          <div class="checking-items">
            <div class="ci" *ngFor="let item of checkingItems; let i = index" [class.ci-done]="checkProgress > i">
              <mat-icon>{{checkProgress > i ? 'check_circle' : 'radio_button_unchecked'}}</mat-icon>
              <span>{{item}}</span>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div *ngIf="result && !isChecking">
          <!-- Score Card -->
          <div class="card score-card" [ngClass]="'score-' + result.status">
            <div class="score-circle" [ngClass]="'circle-' + result.status">
              <span class="score-num">{{result.score}}</span>
              <span class="score-pct">%</span>
            </div>
            <div class="score-info">
              <h2 class="score-title">{{getStatusTitle(result.status)}}</h2>
              <p class="score-sub">Compliance Score — {{result.checkedAt | date:'medium'}}</p>
              <div class="compliance-badges">
                <span class="cbadge" [ngClass]="result.icdCodeValid ? 'valid' : 'invalid'">
                  <mat-icon>{{result.icdCodeValid ? 'check' : 'close'}}</mat-icon>
                  ICD-10: {{result.icdCodeValid ? result.icdCodeDescription : 'Invalid Code'}}
                </span>
              </div>
            </div>
          </div>

          <!-- Issues -->
          <div class="card" style="margin-top:20px" *ngIf="result.issues.length > 0">
            <h3 class="section-title"><mat-icon>warning</mat-icon> Issues Found ({{result.issues.length}})</h3>
            <div class="issue-item" *ngFor="let issue of result.issues" [ngClass]="'issue-' + issue.severity">
              <div class="issue-header">
                <span class="issue-badge" [ngClass]="'ib-' + issue.severity">{{issue.severity.toUpperCase()}}</span>
                <span class="issue-cat">{{issue.category}}</span>
              </div>
              <p class="issue-desc">{{issue.description}}</p>
              <p class="issue-reg"><mat-icon>gavel</mat-icon>{{issue.regulation}}</p>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="card" style="margin-top:20px">
            <h3 class="section-title"><mat-icon>lightbulb</mat-icon> Recommendations</h3>
            <div class="rec-item" *ngFor="let rec of result.recommendations; let i = index">
              <span class="rec-num">{{i + 1}}</span>
              <span>{{rec}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #1a3c6e; margin-bottom: 18px; }
    .tab-label { font-size: 13px; font-weight: 600; color: #1a202c; }
    .divider-text { display: flex; align-items: center; gap: 12px; margin: 16px 0; font-size: 11px; color: #718096; font-weight: 600; letter-spacing: 1px; }
    .divider-text::before, .divider-text::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .icd-validation { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; margin-top: 6px; }
    .run-btn { width: 100%; justify-content: center; padding: 13px; font-size: 15px; gap: 10px; }
    .empty-result { text-align: center; padding: 40px; }
    .empty-result-icon { font-size: 56px; width: 56px; height: 56px; color: #00a86b; margin-bottom: 12px; }
    .empty-result h3 { font-size: 18px; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
    .empty-result p { color: #718096; font-size: 13px; margin-bottom: 24px; }
    .check-list { text-align: left; display: flex; flex-direction: column; gap: 10px; }
    .check-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; }
    .loading-card { text-align: center; padding: 40px; }
    .loading-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .loading-card p { color: #718096; font-size: 13px; margin-bottom: 24px; }
    .checking-items { text-align: left; display: flex; flex-direction: column; gap: 10px; }
    .ci { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #718096; }
    .ci mat-icon { font-size: 18px; width: 18px; height: 18px; color: #cbd5e0; }
    .ci.ci-done mat-icon { color: #00a86b; }
    .ci.ci-done { color: #1a202c; font-weight: 500; }
    .score-card { display: flex; align-items: center; gap: 20px; }
    .score-compliant { border-left: 4px solid #00a86b; background: linear-gradient(135deg, #f0fdf4, white); }
    .score-warning { border-left: 4px solid #f39c12; background: linear-gradient(135deg, #fffbeb, white); }
    .score-violation { border-left: 4px solid #e74c3c; background: linear-gradient(135deg, #fff5f5, white); }
    .score-circle { width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: baseline; justify-content: center; gap: 2px; flex-shrink: 0; font-weight: 800; }
    .circle-compliant { background: #d1fae5; color: #065f46; }
    .circle-warning { background: #fef3c7; color: #92400e; }
    .circle-violation { background: #fee2e2; color: #991b1b; }
    .score-num { font-size: 32px; }
    .score-pct { font-size: 18px; }
    .score-title { font-size: 20px; font-weight: 800; margin: 0 0 4px; }
    .score-sub { font-size: 12px; color: #718096; margin: 0 0 10px; }
    .compliance-badges { display: flex; flex-wrap: wrap; gap: 8px; }
    .cbadge { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 50px; }
    .cbadge.valid { background: #d1fae5; color: #065f46; }
    .cbadge.invalid { background: #fee2e2; color: #991b1b; }
    .cbadge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .issue-item { border-radius: 8px; padding: 14px; margin-bottom: 10px; border-left: 4px solid; }
    .issue-high { background: #fff5f5; border-color: #e74c3c; }
    .issue-medium { background: #fffbeb; border-color: #f39c12; }
    .issue-low { background: #f0fdf4; border-color: #00a86b; }
    .issue-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .issue-badge { padding: 2px 8px; border-radius: 50px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }
    .ib-high { background: #fee2e2; color: #991b1b; }
    .ib-medium { background: #fef3c7; color: #92400e; }
    .ib-low { background: #d1fae5; color: #065f46; }
    .issue-cat { font-size: 13px; font-weight: 700; color: #1a202c; }
    .issue-desc { font-size: 13px; color: #4a5568; margin: 0 0 4px; }
    .issue-reg { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #718096; margin: 0; }
    .issue-reg mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .rec-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f4f8; font-size: 13px; color: #4a5568; }
    .rec-num { width: 24px; height: 24px; border-radius: 50%; background: #1a3c6e; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  `]
})
export class ComplianceCheckerComponent implements OnInit {
  claimForm!: FormGroup;
  result: ComplianceResult | null = null;
  isChecking = false;
  icdResult: { valid: boolean; description: string } | null = null;
  allClaims: Claim[] = [];
  checkProgress = 0;
  checkingItems = ['Validating ICD-10 Code', 'Checking Policy Coverage', 'Verifying Documentation', 'HIPAA 5010 Compliance', 'ACA Standards Check'];

  constructor(private fb: FormBuilder, private complianceService: ComplianceService, private claimsService: ClaimsService) {}

  ngOnInit() {
    this.claimForm = this.fb.group({
      diagnosisCode: ['', Validators.required],
      policyNumber: [''],
      treatmentDate: [''],
      claimAmount: [0],
      hospitalName: [''],
      documentCount: [0]
    });
    this.claimsService.getAllClaims().subscribe(c => this.allClaims = c);
  }

  loadClaim(event: any) {
    const id = event.target.value;
    if (!id) return;
    const claim = this.allClaims.find(c => c.id === id);
    if (claim) {
      this.claimForm.patchValue({
        diagnosisCode: claim.diagnosisCode,
        policyNumber: claim.policyNumber,
        treatmentDate: claim.treatmentDate,
        claimAmount: claim.claimAmount,
        hospitalName: claim.hospitalName,
        documentCount: claim.documents?.length || 0
      });
    }
  }

  onIcdInput(e: any) { this.icdResult = null; }

  validateIcd() {
    const code = this.claimForm.value.diagnosisCode;
    if (!code) return;
    this.complianceService.validateIcdCode(code).subscribe(r => { this.icdResult = r; });
  }

  runCheck() {
    this.isChecking = true;
    this.result = null;
    this.checkProgress = 0;
    const interval = setInterval(() => { if (this.checkProgress < 5) this.checkProgress++; else clearInterval(interval); }, 280);
    this.complianceService.checkCompliance({
      ...this.claimForm.value,
      documents: Array(parseInt(this.claimForm.value.documentCount)).fill({})
    }).subscribe(r => {
      this.result = r;
      this.isChecking = false;
    });
  }

  getStatusTitle(s: string) {
    return s === 'compliant' ? '✅ Fully Compliant' : s === 'warning' ? '⚠️ Compliance Warning' : '❌ Compliance Violation';
  }
}
