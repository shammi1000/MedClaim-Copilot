import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SubmitClaimComponent } from './components/submit-claim/submit-claim.component';
import { ClaimsTrackerComponent } from './components/claims-tracker/claims-tracker.component';
import { ClaimDetailComponent } from './components/claim-detail/claim-detail.component';
import { ComplianceCheckerComponent } from './components/compliance-checker/compliance-checker.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'submit-claim', component: SubmitClaimComponent, canActivate: [AuthGuard] },
  { path: 'claims-tracker', component: ClaimsTrackerComponent, canActivate: [AuthGuard] },
  { path: 'claim-detail/:id', component: ClaimDetailComponent, canActivate: [AuthGuard] },
  { path: 'compliance-checker', component: ComplianceCheckerComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
