import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimsService } from '../../services/claims.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-submit-claim',
  template: `
  <div class="fade-in-up">
    <div class="page-header">
      <h1>📋 Submit New Claim</h1>
      <p>Fill in all required details to submit an insurance claim for processing.</p>
    </div>

    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
        <div class="step-circle">{{currentStep > 1 ? '✓' : '1'}}</div>
        <div class="step-label">Patient Info</div>
      </div>
      <div class="step-line" [class.completed]="currentStep > 1"></div>
      <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
        <div class="step-circle">{{currentStep > 2 ? '✓' : '2'}}</div>
        <div class="step-label">Medical Details</div>
      </div>
      <div class="step-line" [class.completed]="currentStep > 2"></div>
      <div class="step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
        <div class="step-circle">{{currentStep > 3 ? '✓' : '3'}}</div>
        <div class="step-label">Documents</div>
      </div>
      <div class="step-line" [class.completed]="currentStep > 3"></div>
      <div class="step" [class.active]="currentStep === 4">
        <div class="step-circle">4</div>
        <div class="step-label">Review & Submit</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <mat-progress-bar mode="determinate" [value]="(currentStep / 4) * 100" class="step-progress"></mat-progress-bar>

    <div class="card form-card">
      <!-- Step 1: Patient Info -->
      <div *ngIf="currentStep === 1" [formGroup]="patientForm">
        <h2 class="step-title"><mat-icon>person</mat-icon> Patient Information</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Patient Full Name *</label>
            <input class="form-control" formControlName="patientName" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label>Date of Birth *</label>
            <input class="form-control" type="date" formControlName="patientDob">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Insurance ID *</label>
            <input class="form-control" formControlName="insuranceId" placeholder="INS-XXXXX">
          </div>
          <div class="form-group">
            <label>Policy Number *</label>
            <input class="form-control" formControlName="policyNumber" placeholder="POL-2024-XXX">
          </div>
        </div>
        <div class="form-group">
          <label>Patient Address</label>
          <input class="form-control" formControlName="address" placeholder="123 Main St, City, State">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone Number</label>
            <input class="form-control" formControlName="phone" placeholder="+1 (555) 000-0000">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input class="form-control" type="email" formControlName="email" placeholder="patient@email.com">
          </div>
        </div>
      </div>

      <!-- Step 2: Medical Details -->
      <div *ngIf="currentStep === 2" [formGroup]="medicalForm">
        <h2 class="step-title"><mat-icon>local_hospital</mat-icon> Medical Details</h2>
        <div class="form-row">
          <div class="form-group">
            <label>ICD-10 Diagnosis Code *</label>
            <input class="form-control" formControlName="diagnosisCode" placeholder="e.g. M54.5, J18.9, I21.9" style="text-transform:uppercase">
          </div>
          <div class="form-group">
            <label>Diagnosis Description</label>
            <input class="form-control" formControlName="diagnosisDescription" placeholder="Low Back Pain...">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Treatment Date *</label>
            <input class="form-control" type="date" formControlName="treatmentDate">
          </div>
          <div class="form-group">
            <label>Hospital / Clinic Name *</label>
            <input class="form-control" formControlName="hospitalName" placeholder="City General Hospital">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Claim Amount ($) *</label>
            <input class="form-control" type="number" formControlName="claimAmount" placeholder="0.00">
          </div>
          <div class="form-group">
            <label>Treating Physician</label>
            <input class="form-control" formControlName="physician" placeholder="Dr. Jane Smith">
          </div>
        </div>
        <div class="form-group">
          <label>Treatment Description</label>
          <textarea class="form-control" formControlName="treatmentDesc" rows="3" placeholder="Brief description of the treatment provided..."></textarea>
        </div>
      </div>

      <!-- Step 3: Documents -->
      <div *ngIf="currentStep === 3">
        <h2 class="step-title"><mat-icon>upload_file</mat-icon> Upload Documents</h2>
        <div class="upload-area" (click)="triggerUpload()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="upload-title">Drag & Drop Files Here</p>
          <p class="upload-sub">or click to browse — PDF, JPG, PNG (Max 10MB each)</p>
          <input type="file" #fileInput multiple (change)="onFileSelect($event)" style="display:none" accept=".pdf,.jpg,.png,.jpeg">
        </div>
        <div class="uploaded-files" *ngIf="uploadedFiles.length > 0">
          <h3>Uploaded Files ({{uploadedFiles.length}})</h3>
          <div class="file-item" *ngFor="let file of uploadedFiles; let i = index">
            <div class="file-icon">
              <mat-icon>picture_as_pdf</mat-icon>
            </div>
            <div class="file-info">
              <p class="file-name">{{file.name}}</p>
              <p class="file-size">{{formatFileSize(file.size)}}</p>
            </div>
            <button class="remove-file" (click)="removeFile(i)"><mat-icon>close</mat-icon></button>
          </div>
        </div>
        <div class="required-docs-hint">
          <mat-icon>info</mat-icon>
          <p>Required: Medical Report, Hospital Invoice, Physician's Letter. Optional: Lab Results, X-Ray, Imaging Reports.</p>
        </div>
      </div>

      <!-- Step 4: Review & Submit -->
      <div *ngIf="currentStep === 4">
        <h2 class="step-title"><mat-icon>fact_check</mat-icon> Review & Submit</h2>
        <div class="review-grid">
          <div class="review-section">
            <h3><mat-icon>person</mat-icon> Patient Info</h3>
            <div class="review-row"><span>Name:</span><strong>{{patientForm.value.patientName || '—'}}</strong></div>
            <div class="review-row"><span>DOB:</span><strong>{{patientForm.value.patientDob | date}}</strong></div>
            <div class="review-row"><span>Insurance ID:</span><strong>{{patientForm.value.insuranceId || '—'}}</strong></div>
            <div class="review-row"><span>Policy No.:</span><strong>{{patientForm.value.policyNumber || '—'}}</strong></div>
          </div>
          <div class="review-section">
            <h3><mat-icon>local_hospital</mat-icon> Medical Details</h3>
            <div class="review-row"><span>ICD-10 Code:</span><strong>{{medicalForm.value.diagnosisCode || '—'}}</strong></div>
            <div class="review-row"><span>Treatment Date:</span><strong>{{medicalForm.value.treatmentDate | date}}</strong></div>
            <div class="review-row"><span>Hospital:</span><strong>{{medicalForm.value.hospitalName || '—'}}</strong></div>
            <div class="review-row"><span>Claim Amount:</span><strong class="amount-highlight">\${{medicalForm.value.claimAmount | number:'1.2-2'}}</strong></div>
          </div>
        </div>
        <div class="review-docs">
          <h3><mat-icon>attach_file</mat-icon> Documents ({{uploadedFiles.length}})</h3>
          <span *ngFor="let f of uploadedFiles" class="doc-chip">{{f.name}}</span>
          <span *ngIf="uploadedFiles.length === 0" style="color:#718096;font-size:13px">No documents attached</span>
        </div>
        <div class="submit-agreement">
          <mat-checkbox [(ngModel)]="agreed">
            I certify that the information provided is accurate and complete to the best of my knowledge.
          </mat-checkbox>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="step-nav">
        <button class="btn-outline" *ngIf="currentStep > 1" (click)="prevStep()">
          <mat-icon>arrow_back</mat-icon> Previous
        </button>
        <div style="flex:1"></div>
        <button class="btn-primary" *ngIf="currentStep < 4" (click)="nextStep()">
          Next <mat-icon>arrow_forward</mat-icon>
        </button>
        <button class="btn-accent" *ngIf="currentStep === 4" (click)="submitClaim()" [disabled]="!agreed || isSubmitting">
          <mat-progress-spinner *ngIf="isSubmitting" diameter="18" mode="indeterminate" color="accent"></mat-progress-spinner>
          <mat-icon *ngIf="!isSubmitting">send</mat-icon>
          {{isSubmitting ? 'Submitting...' : 'Submit Claim'}}
        </button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .step-progress { margin-bottom: 28px; height: 6px; border-radius: 3px; }
    .form-card { padding: 32px; max-width: 800px; margin: 0 auto; }
    .step-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #1a3c6e; margin-bottom: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .upload-area { border: 2px dashed #cbd5e0; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s ease; margin-bottom: 20px; }
    .upload-area:hover { border-color: #1a3c6e; background: #f8fafc; }
    .upload-icon { font-size: 48px; color: #cbd5e0; }
    .upload-title { font-size: 16px; font-weight: 700; color: #1a202c; margin: 8px 0 4px; }
    .upload-sub { font-size: 13px; color: #718096; }
    .uploaded-files h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .file-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px; }
    .file-icon { color: #e74c3c; }
    .file-info { flex: 1; }
    .file-name { font-size: 13px; font-weight: 600; margin: 0; }
    .file-size { font-size: 11px; color: #718096; margin: 0; }
    .remove-file { background: none; border: none; cursor: pointer; color: #718096; display: flex; padding: 2px; }
    .remove-file:hover { color: #e74c3c; }
    .required-docs-hint { display: flex; align-items: flex-start; gap: 8px; background: #e8f4fd; border-radius: 8px; padding: 12px; font-size: 12px; color: #1a3c6e; }
    .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .review-section { background: #f8fafc; border-radius: 12px; padding: 20px; }
    .review-section h3 { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; margin-bottom: 14px; color: #1a3c6e; }
    .review-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .review-row span { color: #718096; }
    .review-row strong { color: #1a202c; }
    .amount-highlight { color: #00a86b !important; font-size: 16px; }
    .review-docs { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .review-docs h3 { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #1a3c6e; }
    .doc-chip { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 50px; font-size: 12px; margin: 3px; font-weight: 500; }
    .submit-agreement { margin-bottom: 20px; font-size: 13px; }
    .step-nav { display: flex; align-items: center; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
  `]
})
export class SubmitClaimComponent implements OnInit {
  currentStep = 1;
  isSubmitting = false;
  agreed = false;
  uploadedFiles: File[] = [];
  patientForm!: FormGroup;
  medicalForm!: FormGroup;

  constructor(private fb: FormBuilder, private claimsService: ClaimsService, private router: Router, private snack: MatSnackBar) {}

  ngOnInit() {
    this.patientForm = this.fb.group({
      patientName: ['', Validators.required],
      patientDob: ['', Validators.required],
      insuranceId: ['', Validators.required],
      policyNumber: ['', Validators.required],
      address: [''], phone: [''], email: ['']
    });
    this.medicalForm = this.fb.group({
      diagnosisCode: ['', Validators.required],
      diagnosisDescription: [''],
      treatmentDate: ['', Validators.required],
      hospitalName: ['', Validators.required],
      claimAmount: [0, [Validators.required, Validators.min(1)]],
      physician: [''], treatmentDesc: ['']
    });
  }

  nextStep() { if (this.currentStep < 4) this.currentStep++; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  triggerUpload() { document.querySelector<HTMLInputElement>('input[type=file]')?.click(); }

  onDragOver(e: DragEvent) { e.preventDefault(); }
  onDrop(e: DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    this.uploadedFiles.push(...files);
  }

  onFileSelect(e: any) {
    this.uploadedFiles.push(...Array.from<File>(e.target.files));
  }

  removeFile(i: number) { this.uploadedFiles.splice(i, 1); }
  formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  submitClaim() {
    this.isSubmitting = true;
    const claim = { ...this.patientForm.value, ...this.medicalForm.value };
    this.claimsService.submitClaim(claim).subscribe(result => {
      this.isSubmitting = false;
      this.snack.open(`✅ Claim ${result.id} submitted successfully!`, 'View', { duration: 5000 });
      this.router.navigate(['/claim-detail', result.id]);
    });
  }
}
