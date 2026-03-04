import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AnalyticsData } from '../models/claim.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  getAnalytics(): Observable<AnalyticsData> {
    return of({
      totalClaims: 1248,
      totalPayout: 4872650,
      avgProcessingDays: 4.7,
      approvalRate: 78.4,
      monthlyData: [
        { month: 'Jan', submitted: 98, approved: 72, rejected: 14, amount: 385000 },
        { month: 'Feb', submitted: 112, approved: 85, rejected: 18, amount: 420000 },
        { month: 'Mar', submitted: 95, approved: 70, rejected: 12, amount: 365000 },
        { month: 'Apr', submitted: 128, approved: 100, rejected: 20, amount: 510000 },
        { month: 'May', submitted: 143, approved: 112, rejected: 22, amount: 580000 },
        { month: 'Jun', submitted: 110, approved: 88, rejected: 15, amount: 445000 },
        { month: 'Jul', submitted: 125, approved: 97, rejected: 19, amount: 495000 },
        { month: 'Aug', submitted: 138, approved: 110, rejected: 21, amount: 560000 },
        { month: 'Sep', submitted: 102, approved: 78, rejected: 16, amount: 398000 },
        { month: 'Oct', submitted: 118, approved: 92, rejected: 18, amount: 472000 },
        { month: 'Nov', submitted: 130, approved: 102, rejected: 20, amount: 520000 },
        { month: 'Dec', submitted: 149, approved: 118, rejected: 24, amount: 522650 }
      ],
      statusBreakdown: [
        { status: 'Approved', count: 978, percentage: 78.4 },
        { status: 'Rejected', count: 147, percentage: 11.8 },
        { status: 'Pending', count: 74, percentage: 5.9 },
        { status: 'In Review', count: 49, percentage: 3.9 }
      ],
      topDiagnosisCodes: [
        { code: 'I21.9', description: 'Acute Myocardial Infarction', count: 142, totalAmount: 1240000 },
        { code: 'J18.9', description: 'Pneumonia', count: 118, totalAmount: 890000 },
        { code: 'K35.80', description: 'Appendicitis', count: 96, totalAmount: 720000 },
        { code: 'M54.5', description: 'Low Back Pain', count: 188, totalAmount: 650000 },
        { code: 'E11.9', description: 'Type 2 Diabetes', count: 211, totalAmount: 580000 }
      ]
    } as AnalyticsData).pipe(delay(400));
  }
}
