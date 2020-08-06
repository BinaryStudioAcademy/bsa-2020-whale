import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AppComponent } from '../app.component';
import { LandingPageComponent } from '../scenes/landing-page/components/landing-page/landing-page.component';
import { MeetingComponent } from '../scenes/meeting-page/components/meeting/meeting.component';
import { ProfilePageComponent } from '../scenes/profile-page/components/profile-page/profile-page.component';


const routes: Routes = [
  // { path: 'meeting-page', component: MeetingComponent },
  { path: 'meeting-page/:id/:pwd', component: MeetingComponent },
  { path: 'profile-page', component: ProfilePageComponent },
  { path: '**', component: LandingPageComponent }
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
