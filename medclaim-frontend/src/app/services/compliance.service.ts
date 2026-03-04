import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ComplianceResult, ComplianceIssue } from '../models/claim.model';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private icdCodes: { [key: string]: string } = {
    'M54.5': 'Low Back Pain',
    'J18.9': 'Pneumonia, unspecified organism',
    'I21.9': 'Acute myocardial infarction, unspecified',
    'E11.9': 'Type 2 diabetes mellitus without complications',
    'K35.80': 'Other and unspecified acute appendicitis',
    'S52.501A': 'Fracture of unspecified part of radius',
    'Z00.00': 'Encounter for general adult medical examination',
    'R51.9': 'Headache, unspecified',
    'J06.9': 'Acute upper respiratory infection, unspecified',
    'M17.11': 'Primary osteoarthritis, right knee',
    'F32.9': 'Major depressive disorder, single episode, unspecified',
    'I10': 'Essential (primary) hypertension',
    'N39.0': 'Urinary tract infection, site not specified',
    'G43.909': 'Migraine, unspecified, not intractable',
    'K21.0': 'Gastroesophageal reflux disease with esophagitis',
    'L20.9': 'Atopic dermatitis, unspecified',
    'C34.10': 'Malignant neoplasm of upper lobe, bronchus or lung',
    'S82.001A': 'Fracture of patella',
    'I25.10': 'Atherosclerotic heart disease of native coronary artery',
    'J45.901': 'Unspecified asthma with acute exacerbation'
  };

  checkCompliance(claimData: any): Observable<ComplianceResult> {
    const score = this.calculateScore(claimData);
    const issues = this.detectIssues(claimData);
    const icdValid = !!this.icdCodes[claimData.diagnosisCode];

    return of({
      score,
      status: score >= 80 ? 'compliant' : score >= 60 ? 'warning' : 'violation',
      issues,
      recommendations: this.generateRecommendations(issues),
      icdCodeValid: icdValid,
      icdCodeDescription: this.icdCodes[claimData.diagnosisCode] || 'Unknown ICD-10 Code',
      checkedAt: new Date().toISOString()
    } as ComplianceResult).pipe(delay(1500));
  }

  validateIcdCode(code: string): Observable<{ valid: boolean; description: string }> {
    const description = this.icdCodes[code.toUpperCase()];
    return of({ valid: !!description, description: description || 'Code not found in ICD-10 database' }).pipe(delay(500));
  }

  private calculateScore(data: any): number {
    let score = 100;
    if (!data.diagnosisCode || !this.icdCodes[data.diagnosisCode]) score -= 25;
    if (!data.policyNumber) score -= 20;
    if (!data.treatmentDate) score -= 15;
    if (!data.claimAmount || data.claimAmount <= 0) score -= 15;
    if (data.claimAmount > 50000) score -= 10;
    if (!data.hospitalName) score -= 10;
    return Math.max(0, score);
  }

  private detectIssues(data: any): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    if (!data.diagnosisCode || !this.icdCodes[data.diagnosisCode]) {
      issues.push({
        id: 'ISSUE-001', severity: 'high', category: 'ICD-10 Coding',
        description: 'Invalid or missing ICD-10 diagnosis code.',
        regulation: 'HIPAA 5010 Standard', recommendation: 'Verify and enter a valid ICD-10 code.'
      });
    }
    if (data.claimAmount > 50000) {
      issues.push({
        id: 'ISSUE-002', severity: 'medium', category: 'High-Value Claim',
        description: 'Claim exceeds $50,000. Requires senior adjuster review.',
        regulation: 'ACA Section 2719', recommendation: 'Route to senior adjuster for additional review.'
      });
    }
    if (!data.policyNumber) {
      issues.push({
        id: 'ISSUE-003', severity: 'high', category: 'Policy Validation',
        description: 'Missing policy number. Cannot process without valid policy.',
        regulation: 'CMS Claim Filing Requirements', recommendation: 'Obtain and verify policy number from insurer.'
      });
    }
    if (!data.documents || data.documents?.length === 0) {
      issues.push({
        id: 'ISSUE-004', severity: 'medium', category: 'Documentation',
        description: 'No supporting documents attached.',
        regulation: 'Medical Necessity Documentation Standards', recommendation: 'Attach relevant medical records and invoices.'
      });
    }
    return issues;
  }

  private generateRecommendations(issues: ComplianceIssue[]): string[] {
    const recs: string[] = [];
    if (issues.length === 0) {
      recs.push('All compliance checks passed. Claim is ready for processing.');
      recs.push('Ensure all documents are securely stored per HIPAA guidelines.');
    } else {
      recs.push('Address all high-severity issues before processing.');
      recs.push('Verify patient identity and policy coverage validity.');
      recs.push('Ensure all documentation meets CMS filing standards.');
      issues.forEach(i => recs.push(i.recommendation));
    }
    return [...new Set(recs)];
  }
}
