import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// App Routing
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SubmitClaimComponent } from './components/submit-claim/submit-claim.component';
import { ClaimsTrackerComponent } from './components/claims-tracker/claims-tracker.component';
import { ClaimDetailComponent } from './components/claim-detail/claim-detail.component';
import { ComplianceCheckerComponent } from './components/compliance-checker/compliance-checker.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';

// Services
import { ClaimsService } from './services/claims.service';
import { AuthService } from './services/auth.service';
import { ComplianceService } from './services/compliance.service';
import { AnalyticsService } from './services/analytics.service';

const MATERIAL_MODULES = [
  MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule,
  MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule,
  MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
  MatDialogModule, MatSnackBarModule, MatProgressBarModule, MatProgressSpinnerModule,
  MatChipsModule, MatMenuModule, MatBadgeModule, MatTooltipModule, MatTabsModule,
  MatStepperModule, MatCheckboxModule, MatSlideToggleModule, MatExpansionModule,
  MatDividerModule, MatAutocompleteModule
];

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    NavbarComponent,
    DashboardComponent,
    SubmitClaimComponent,
    ClaimsTrackerComponent,
    ClaimDetailComponent,
    ComplianceCheckerComponent,
    AnalyticsComponent,
    ProfileComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    ...MATERIAL_MODULES
  ],
  providers: [
    ClaimsService,
    AuthService,
    ComplianceService,
    AnalyticsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
