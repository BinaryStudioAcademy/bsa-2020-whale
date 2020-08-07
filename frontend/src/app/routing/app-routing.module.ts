import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from '../scenes/landing-page/components/landing-page/landing-page.component';
import { MeetingComponent } from '../scenes/meeting-page/components/meeting/meeting.component';
import { ProfilePageComponent } from '../scenes/profile-page/components/profile-page/profile-page.component';
import { ScheduleMeetingPageComponent } from 'app/scenes/schedule-meeting-page/components/schedule-meeting-page/schedule-meeting-page.component';

const routes: Routes = [
  { path: 'meeting-page', component: MeetingComponent },
  { path: 'profile-page', component: ProfilePageComponent },
  { path: 'schedule-meeting', component: ScheduleMeetingPageComponent},
  { path: '**', component: LandingPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
