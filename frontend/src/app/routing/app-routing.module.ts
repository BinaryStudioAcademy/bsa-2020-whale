import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from '../scenes/landing-page/components/landing-page/landing-page.component';
import { MeetingComponent } from '../scenes/meeting-page/components/meeting/meeting.component';

const routes: Routes = [
  { path: '**', component: LandingPageComponent },
  { path: 'meeting-page', component: MeetingComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
