import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';

import { LandingPageModule } from './scenes/landing-page/landing-page.module';
import { MeetingPageModule } from './scenes/meeting-page/meeting-page.module';
import { ProfilePageModule } from './scenes/profile-page/profile-page.module';
import { ScheduleMeetingPageModule } from './scenes/schedule-meeting-page/schedule-meeting-page.module'

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LandingPageModule,
    MeetingPageModule,
    ProfilePageModule,
    ScheduleMeetingPageModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
