import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { canActivate, AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AppComponent } from '../app.component';

const routes: Routes = [{ path: 'login', component: AppComponent, canActivate: [AngularFireAuthGuard]}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
