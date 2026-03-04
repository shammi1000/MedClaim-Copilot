import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Claim, ClaimDocument, TimelineEvent } from '../models/claim.model';

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private claims: Claim[] = [
    {
      id: 'CLM-2024-001',
      patientName: 'James Anderson',
      patientDob: '1978-04-22',
      insuranceId: 'INS-78453',
      policyNumber: 'POL-2024-112',
      diagnosisCode: 'M54.5',
      diagnosisDescription: 'Low Back Pain',
      treatmentDate: '2024-11-15',
      hospitalName: 'City General Hospital',
      claimAmount: 4250.00,
      status: 'Approved',
      submittedDate: '2024-11-18',
      adjusterNotes: 'All documentation verified. Claim approved after review.',
      documents: [
        { id: 'DOC-001', name: 'Medical_Report_Anderson.pdf', type: 'application/pdf', size: '2.4 MB', uploadedAt: '2024-11-18' },
        { id: 'DOC-002', name: 'Hospital_Invoice_001.pdf', type: 'application/pdf', size: '1.1 MB', uploadedAt: '2024-11-18' }
      ],
      timeline: [
        { id: 'T1', event: 'Claim Submitted', date: '2024-11-18 09:15 AM', description: 'Claim submitted by provider portal.', status: 'completed', actor: 'Provider Portal' },
        { id: 'T2', event: 'Under Review', date: '2024-11-19 10:30 AM', description: 'Assigned to adjuster Mark Johnson for review.', status: 'completed', actor: 'System' },
        { id: 'T3', event: 'Documents Verified', date: '2024-11-20 02:00 PM', description: 'All medical documents verified successfully.', status: 'completed', actor: 'Mark Johnson' },
        { id: 'T4', event: 'Claim Approved', date: '2024-11-21 11:00 AM', description: 'Claim approved. Payment scheduled.', status: 'completed', actor: 'Mark Johnson' }
      ]
    },
    {
      id: 'CLM-2024-002',
      patientName: 'Maria Rodriguez',
      patientDob: '1985-09-10',
      insuranceId: 'INS-91234',
      policyNumber: 'POL-2024-089',
      diagnosisCode: 'J18.9',
      diagnosisDescription: 'Pneumonia, unspecified',
      treatmentDate: '2024-11-20',
      hospitalName: 'St. Mary Medical Center',
      claimAmount: 12800.00,
      status: 'In Review',
      submittedDate: '2024-11-22',
      adjusterNotes: 'Awaiting additional lab results from hospital.',
      documents: [
        { id: 'DOC-003', name: 'X_Ray_Report.pdf', type: 'application/pdf', size: '5.2 MB', uploadedAt: '2024-11-22' },
        { id: 'DOC-004', name: 'Admission_Records.pdf', type: 'application/pdf', size: '3.7 MB', uploadedAt: '2024-11-22' }
      ],
      timeline: [
        { id: 'T1', event: 'Claim Submitted', date: '2024-11-22 08:30 AM', description: 'Claim submitted successfully.', status: 'completed', actor: 'Dr. Carlos Ruiz' },
        { id: 'T2', event: 'Under Review', date: '2024-11-23 09:00 AM', description: 'Claim under adjuster review.', status: 'active', actor: 'System' },
        { id: 'T3', event: 'Additional Info Requested', date: 'Pending', description: 'Awaiting lab results from St. Mary.', status: 'pending', actor: '' }
      ]
    },
    {
      id: 'CLM-2024-003',
      patientName: 'Robert Chen',
      patientDob: '1962-12-03',
      insuranceId: 'INS-55678',
      policyNumber: 'POL-2024-201',
      diagnosisCode: 'I21.9',
      diagnosisDescription: 'Acute myocardial infarction',
      treatmentDate: '2024-11-10',
      hospitalName: 'Heart & Vascular Institute',
      claimAmount: 85000.00,
      status: 'Pending',
      submittedDate: '2024-11-25',
      adjusterNotes: '',
      documents: [
        { id: 'DOC-005', name: 'Surgical_Report.pdf', type: 'application/pdf', size: '8.1 MB', uploadedAt: '2024-11-25' }
      ],
      timeline: [
        { id: 'T1', event: 'Claim Submitted', date: '2024-11-25 03:45 PM', description: 'High-value claim submitted for cardiac procedure.', status: 'completed', actor: 'Provider Portal' },
        { id: 'T2', event: 'Awaiting Assignment', date: 'Pending', description: 'Awaiting adjuster assignment.', status: 'pending', actor: '' }
      ]
    },
    {
      id: 'CLM-2024-004',
      patientName: 'Emily Thompson',
      patientDob: '1990-06-17',
      insuranceId: 'INS-33892',
      policyNumber: 'POL-2024-055',
      diagnosisCode: 'S52.501A',
      diagnosisDescription: 'Fracture of unspecified part of radius',
      treatmentDate: '2024-11-05',
      hospitalName: 'Orthopedic Specialists Clinic',
      claimAmount: 6750.00,
      status: 'Rejected',
      submittedDate: '2024-11-08',
      adjusterNotes: 'Policy does not cover out-of-network providers. Claim rejected. Patient advised to appeal.',
      documents: [
        { id: 'DOC-006', name: 'Fracture_Xray.pdf', type: 'application/pdf', size: '4.3 MB', uploadedAt: '2024-11-08' }
      ],
      timeline: [
        { id: 'T1', event: 'Claim Submitted', date: '2024-11-08 10:00 AM', description: 'Claim submitted for orthopedic treatment.', status: 'completed', actor: 'Dr. Emily Thompson' },
        { id: 'T2', event: 'Under Review', date: '2024-11-09 09:30 AM', description: 'Reviewed by adjuster.', status: 'completed', actor: 'Lisa Park' },
        { id: 'T3', event: 'Claim Rejected', date: '2024-11-11 04:00 PM', description: 'Rejected — out-of-network provider not covered by policy.', status: 'rejected', actor: 'Lisa Park' }
      ]
    },
    {
      id: 'CLM-2024-005',
      patientName: 'David Wilson',
      patientDob: '1975-03-28',
      insuranceId: 'INS-62145',
      policyNumber: 'POL-2024-178',
      diagnosisCode: 'E11.9',
      diagnosisDescription: 'Type 2 diabetes mellitus',
      treatmentDate: '2024-11-28',
      hospitalName: 'Metro Diabetes Care Center',
      claimAmount: 3200.00,
      status: 'Pending',
      submittedDate: '2024-11-29',
      adjusterNotes: '',
      documents: [],
      timeline: [
        { id: 'T1', event: 'Claim Submitted', date: '2024-11-29 11:15 AM', description: 'Diabetes management claim submitted.', status: 'completed', actor: 'Provider Portal' }
      ]
    },
    {
      id: 'CLM-2024-006',
      patientName: 'Sarah Johnson',
      patientDob: '1988-11-14',
      insuranceId: 'INS-74219',
      policyNumber: 'POL-2024-302',
      diagnosisCode: 'K35.80',
      diagnosisDescription: 'Appendicitis without abscess',
      treatmentDate: '2024-10-30',
      hospitalName: 'General Surgery Associates',
      claimAmount: 22500.00,
      status: 'Approved',
      submittedDate: '2024-11-03',
      adjusterNotes: 'Emergency procedure. All documentation complete. Approved.',
      documents: [
        { id: 'DOC-007', name: 'Surgery_Report_Johnson.pdf', type: 'application/pdf', size: '6.2 MB', uploadedAt: '2024-11-03' },
        { id: 'DOC-008', name: 'Anesthesia_Report.pdf', type: 'application/pdf', size: '1.8 MB', uploadedAt: '2024-11-03' }
      ],
      timeline: [
        { id: 'T1', event: 'Claim Submitted', date: '2024-11-03 08:00 AM', description: 'Emergency appendectomy claim.', status: 'completed', actor: 'Hospital Billing' },
        { id: 'T2', event: 'Fast-Track Review', date: '2024-11-04 10:00 AM', description: 'Expedited for emergency procedure.', status: 'completed', actor: 'System' },
        { id: 'T3', event: 'Approved', date: '2024-11-05 02:30 PM', description: 'Approved. Payment processed.', status: 'completed', actor: 'James Turner' }
      ]
    }
  ];

  private claimsSubject = new BehaviorSubject<Claim[]>(this.claims);

  getAllClaims(): Observable<Claim[]> {
    return this.claimsSubject.asObservable().pipe(delay(300));
  }

  getClaimById(id: string): Observable<Claim | undefined> {
    return of(this.claims.find(c => c.id === id)).pipe(delay(300));
  }

  getClaimStats() {
    const total = this.claims.length;
    const pending = this.claims.filter(c => c.status === 'Pending').length;
    const approved = this.claims.filter(c => c.status === 'Approved').length;
    const rejected = this.claims.filter(c => c.status === 'Rejected').length;
    const inReview = this.claims.filter(c => c.status === 'In Review').length;
    const totalAmount = this.claims.reduce((sum, c) => sum + c.claimAmount, 0);
    return of({ total, pending, approved, rejected, inReview, totalAmount }).pipe(delay(200));
  }

  submitClaim(claim: Partial<Claim>): Observable<Claim> {
    const newClaim: Claim = {
      ...claim as Claim,
      id: 'CLM-2024-' + String(this.claims.length + 1).padStart(3, '0'),
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      timeline: [{ id: 'T1', event: 'Claim Submitted', date: new Date().toLocaleString(), description: 'New claim submitted.', status: 'completed', actor: 'Portal User' }]
    };
    this.claims.unshift(newClaim);
    this.claimsSubject.next([...this.claims]);
    return of(newClaim).pipe(delay(1000));
  }

  updateClaimStatus(id: string, status: Claim['status'], notes: string): Observable<Claim> {
    const idx = this.claims.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.claims[idx] = { ...this.claims[idx], status, adjusterNotes: notes };
      this.claimsSubject.next([...this.claims]);
    }
    return of(this.claims[idx]).pipe(delay(500));
  }

  searchClaims(query: string, status?: string, dateFrom?: string, dateTo?: string): Observable<Claim[]> {
    let results = [...this.claims];
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.patientName.toLowerCase().includes(q) ||
        c.diagnosisCode.toLowerCase().includes(q) ||
        c.hospitalName.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'All') results = results.filter(c => c.status === status);
    if (dateFrom) results = results.filter(c => c.submittedDate >= dateFrom);
    if (dateTo) results = results.filter(c => c.submittedDate <= dateTo);
    return of(results).pipe(delay(300));
  }
}
