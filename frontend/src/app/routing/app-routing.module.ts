import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from '../scenes/landing-page/components/landing-page/landing-page.component';
import { MeetingComponent } from '../scenes/meeting-page/components/meeting/meeting.component';
import { ProfilePageComponent } from '../scenes/profile-page/components/profile-page/profile-page.component';
import { HomePageComponent } from '../scenes/home-page/components/home-page/home-page.component';
import { ScheduleMeetingPageComponent } from 'app/scenes/schedule-meeting-page/components/schedule-meeting-page/schedule-meeting-page.component';
import { CheckAccessToMediaGuard } from 'app/core/guards/check-access-to-media.guard';
import { SettingPageComponent } from '../scenes/setting-page/setting-page/setting-page.component';
import { RedirectionComponent } from '../scenes/redirection-page/redirection/redirection.component';
import { LastParticipantGuard } from '../core/guards/last-participant.guard';

import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  AngularFireAuthGuard,
} from '@angular/fire/auth-guard';
import { AgendaComponent } from 'app/scenes/meeting-page/components/agenda/agenda.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/']);
const redirectLoggedToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'setting-page',
    component: SettingPageComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'meeting-page/:link',
    component: MeetingComponent,
    canActivate: [AngularFireAuthGuard],
    canDeactivate: [LastParticipantGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'redirection/:link',
    component: RedirectionComponent,
  },
  {
    path: 'room/:link',
    component: MeetingComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'profile-page',
    component: ProfilePageComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'schedule-meeting',
    component: ScheduleMeetingPageComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: '**',
    component: LandingPageComponent,
    ...canActivate(redirectLoggedToHome),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
