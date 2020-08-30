import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingPageComponent } from './setting-page/setting-page.component';
import { SettingVideoComponent } from './setting-video/setting-video.component';
import { SettingAudioComponent } from './setting-audio/setting-audio.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '@shared/shared.module';
import { SettingMeetingComponent } from './setting-meeting/setting-meeting.component';

@NgModule({
  declarations: [
    SettingPageComponent,
    SettingVideoComponent,
    SettingAudioComponent,
    SettingMeetingComponent,
  ],
  imports: [CommonModule, FormsModule, BrowserModule, SharedModule],
  exports: [SettingMeetingComponent],
})
export class SettingPageModule {}
