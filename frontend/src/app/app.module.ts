import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';

import { LandingPageModule } from './scenes/landing-page/landing-page.module';
import { MeetingPageModule } from './scenes/meeting-page/meeting-page.module';
import { ProfilePageModule } from './scenes/profile-page/profile-page.module';
import { HttpClientModule } from '@angular/common/http';

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
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
