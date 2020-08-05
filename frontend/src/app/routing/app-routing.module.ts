import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AppComponent } from '../app.component';
import { LandingPageComponent } from '../scenes/landing-page/components/landing-page/landing-page.component';
import { MeetingComponent } from '../scenes/meeting-page/components/meeting/meeting.component';


const routes: Routes = [
  { path: '**', component: LandingPageComponent },
  { path: 'meeting-page', component: MeetingComponent }
];

/*GuardExanple:
{
    path: 'loginNeOk',
    component: AppComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(['logIn'])}
  },
*/

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
