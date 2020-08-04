import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { canActivate, AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AppComponent } from '../app.component';
import { LandingPageComponent } from '../scenes/landing-page/components/landing-page/landing-page.component';

const routes: Routes = [
  { path: 'login', component: AppComponent, canActivate: [AngularFireAuthGuard]}, /// REMOVE BEFORE MARGE
  { path: '**', component: LandingPageComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
