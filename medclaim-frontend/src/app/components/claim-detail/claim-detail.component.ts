import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsService } from '../../services/claims.service';
import { Claim } from '../../models/claim.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-claim-detail',
  template: `
  <div class="fade-in-up" *ngIf="claim; else loading">
    <!-- Header -->
    <div class="detail-header">
      <div>
        <div class="back-link" (click)="router.navigate(['/claims-tracker'])">
          <mat-icon>arrow_back</mat-icon> Back to Claims
        </div>
        <h1>Claim Detail — <span class="claim-id-title">{{claim.id}}</span></h1>
        <p>Submitted on {{claim.submittedDate | date:'MMMM d, y'}} · {{claim.hospitalName}}</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <span class="badge badge-lg" [ngClass]="getBadgeClass(claim.status)">{{claim.status}}</span>
        <button class="btn-outline" (click)="runCompliance()"><mat-icon>verified_user</mat-icon> Check Compliance</button>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Left Column -->
      <div style="display:flex;flex-direction:column;gap:20px">
        <!-- Patient Info Card -->
        <div class="card">
          <div class="card-section-title"><mat-icon>person</mat-icon> Patient Information</div>
          <div class="info-grid">
            <div class="info-item"><span>Full Name</span><strong>{{claim.patientName}}</strong></div>
            <div class="info-item"><span>Date of Birth</span><strong>{{claim.patientDob | date:'mediumDate'}}</strong></div>
            <div class="info-item"><span>Insurance ID</span><strong>{{claim.insuranceId}}</strong></div>
            <div class="info-item"><span>Policy Number</span><strong>{{claim.policyNumber}}</strong></div>
          </div>
        </div>

        <!-- Medical Details Card -->
        <div class="card">
          <div class="card-section-title"><mat-icon>local_hospital</mat-icon> Medical Details</div>
          <div class="info-grid">
            <div class="info-item"><span>ICD-10 Code</span>
              <strong><span class="icd-badge">{{claim.diagnosisCode}}</span></strong>
            </div>
            <div class="info-item"><span>Diagnosis</span><strong>{{claim.diagnosisDescription}}</strong></div>
            <div class="info-item"><span>Treatment Date</span><strong>{{claim.treatmentDate | date:'mediumDate'}}</strong></div>
            <div class="info-item"><span>Hospital</span><strong>{{claim.hospitalName}}</strong></div>
          </div>
          <div class="amount-banner">
            <div>
              <p class="amount-label">Claim Amount</p>
              <h2 class="amount-value">\${{claim.claimAmount | number:'1.2-2'}}</h2>
            </div>
            <mat-icon class="amount-icon">payments</mat-icon>
          </div>
        </div>

        <!-- Documents -->
        <div class="card">
          <div class="card-section-title"><mat-icon>attach_file</mat-icon> Supporting Documents</div>
          <div *ngIf="claim.documents?.length; else noDocs">
            <div class="doc-row" *ngFor="let doc of claim.documents">
              <mat-icon class="doc-icon">picture_as_pdf</mat-icon>
              <div class="doc-info">
                <p>{{doc.name}}</p>
                <span>{{doc.size}} · Uploaded {{doc.uploadedAt | date:'MMM d, y'}}</span>
              </div>
              <button class="action-btn" matTooltip="Download"><mat-icon>download</mat-icon></button>
              <button class="action-btn" matTooltip="Preview"><mat-icon>visibility</mat-icon></button>
            </div>
          </div>
          <ng-template #noDocs>
            <div class="empty-docs"><mat-icon>folder_open</mat-icon><p>No documents attached</p></div>
          </ng-template>
        </div>
      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:20px">
        <!-- Timeline -->
        <div class="card">
          <div class="card-section-title"><mat-icon>timeline</mat-icon> Claim Timeline</div>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let event of claim.timeline" [ngClass]="event.status">
              <div class="tl-event">{{event.event}}</div>
              <div class="tl-date">{{event.date}}</div>
              <div class="tl-desc">{{event.description}}</div>
              <div class="tl-actor" *ngIf="event.actor"><mat-icon>person_outline</mat-icon>{{event.actor}}</div>
            </div>
          </div>
        </div>

        <!-- Adjuster Notes -->
        <div class="card">
          <div class="card-section-title"><mat-icon>notes</mat-icon> Adjuster Notes</div>
          <textarea class="form-control notes-area" [(ngModel)]="adjusterNotes" placeholder="Add notes about this claim..." rows="4"></textarea>
          <button class="btn-primary" style="margin-top:12px;width:100%" (click)="saveNotes()">
            <mat-icon>save</mat-icon> Save Notes
          </button>
        </div>

        <!-- Adjuster Actions -->
        <div class="card action-card" *ngIf="claim.status !== 'Approved' && claim.status !== 'Rejected'">
          <div class="card-section-title"><mat-icon>gavel</mat-icon> Adjuster Actions</div>
          <div class="action-buttons-grid">
            <button class="action-full-btn approve" (click)="updateStatus('Approved')">
              <mat-icon>check_circle</mat-icon> Approve Claim
            </button>
            <button class="action-full-btn reject" (click)="updateStatus('Rejected')">
              <mat-icon>cancel</mat-icon> Reject Claim
            </button>
            <button class="action-full-btn request" (click)="updateStatus('In Review')">
              <mat-icon>info</mat-icon> Request More Info
            </button>
          </div>
        </div>

        <!-- Final Status Banner -->
        <div class="final-banner" *ngIf="claim.status === 'Approved'" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:1px solid #10b981">
          <mat-icon style="color:#065f46;font-size:32px">check_circle</mat-icon>
          <div>
            <h3 style="color:#065f46;margin:0">Claim Approved</h3>
            <p style="color:#047857;margin:0;font-size:13px">Payment will be processed within 3-5 business days.</p>
          </div>
        </div>
        <div class="final-banner" *ngIf="claim.status === 'Rejected'" style="background:linear-gradient(135deg,#fee2e2,#fecaca);border:1px solid #ef4444">
          <mat-icon style="color:#991b1b;font-size:32px">cancel</mat-icon>
          <div>
            <h3 style="color:#991b1b;margin:0">Claim Rejected</h3>
            <p style="color:#b91c1c;margin:0;font-size:13px">{{claim.adjusterNotes}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ng-template #loading>
    <div style="text-align:center;padding:80px">
      <mat-progress-spinner mode="indeterminate" diameter="50" style="margin:0 auto"></mat-progress-spinner>
      <p style="margin-top:16px;color:#718096">Loading claim details...</p>
    </div>
  </ng-template>
  `,
  styles: [`
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .back-link { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #718096; cursor: pointer; margin-bottom: 8px; transition: color 0.2s; }
    .back-link:hover { color: #1a3c6e; }
    .claim-id-title { color: #1a3c6e; }
    .badge-lg { font-size: 13px; padding: 6px 16px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card-section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #1a3c6e; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .info-item { display: flex; flex-direction: column; gap: 2px; }
    .info-item span { font-size: 11px; color: #718096; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item strong { font-size: 14px; color: #1a202c; }
    .icd-badge { background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 50px; font-size: 13px; font-weight: 700; }
    .amount-banner { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1a3c6e, #2a5298); border-radius: 10px; padding: 16px 20px; margin-top: 16px; }
    .amount-label { color: rgba(255,255,255,0.7); font-size: 12px; margin: 0; }
    .amount-value { color: white; font-size: 28px; font-weight: 800; margin: 0; }
    .amount-icon { color: rgba(255,255,255,0.5); font-size: 36px; width: 36px; height: 36px; }
    .doc-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f4f8; }
    .doc-icon { color: #e74c3c; font-size: 28px; flex-shrink: 0; }
    .doc-info { flex: 1; }
    .doc-info p { font-size: 13px; font-weight: 600; margin: 0; }
    .doc-info span { font-size: 11px; color: #718096; }
    .action-btn { background: none; border: none; cursor: pointer; color: #718096; display: flex; padding: 4px; border-radius: 6px; }
    .action-btn:hover { background: #f0f4f8; color: #1a3c6e; }
    .empty-docs { text-align: center; padding: 24px; color: #718096; }
    .empty-docs mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; }
    .tl-event { font-size: 14px; font-weight: 700; color: #1a202c; }
    .tl-date { font-size: 12px; color: #718096; margin: 2px 0; }
    .tl-desc { font-size: 13px; color: #4a5568; }
    .tl-actor { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #718096; margin-top: 4px; }
    .tl-actor mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .notes-area { resize: vertical; }
    .action-buttons-grid { display: flex; flex-direction: column; gap: 10px; }
    .action-full-btn { width: 100%; padding: 12px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; font-family: 'Inter', sans-serif; }
    .approve { background: #d1fae5; color: #065f46; }
    .approve:hover { background: #a7f3d0; }
    .reject { background: #fee2e2; color: #991b1b; }
    .reject:hover { background: #fecaca; }
    .request { background: #dbeafe; color: #1e40af; }
    .request:hover { background: #bfdbfe; }
    .final-banner { border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; }
  `]
})
export class ClaimDetailComponent implements OnInit {
  claim: Claim | undefined;
  adjusterNotes = '';

  constructor(public router: Router, private route: ActivatedRoute, private claimsService: ClaimsService, private snack: MatSnackBar) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.claimsService.getClaimById(id).subscribe(c => {
      this.claim = c;
      this.adjusterNotes = c?.adjusterNotes || '';
    });
  }

  getBadgeClass(status: string) {
    const m: any = { 'Approved': 'badge-approved', 'Rejected': 'badge-rejected', 'Pending': 'badge-pending', 'In Review': 'badge-review' };
    return m[status] || 'badge-pending';
  }

  saveNotes() {
    if (this.claim) {
      this.claimsService.updateClaimStatus(this.claim.id, this.claim.status, this.adjusterNotes).subscribe(() => {
        this.snack.open('Notes saved successfully!', 'Close', { duration: 3000 });
      });
    }
  }

  updateStatus(status: Claim['status']) {
    if (this.claim) {
      this.claimsService.updateClaimStatus(this.claim.id, status, this.adjusterNotes).subscribe(updated => {
        this.claim = updated;
        this.snack.open(`Claim status updated to ${status}`, 'Close', { duration: 3000 });
      });
    }
  }

  runCompliance() { this.router.navigate(['/compliance-checker']); }
}
