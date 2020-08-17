import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingPageModule } from './setting-page/setting-page.module';
import { RedirectionComponent } from './redirection-page/redirection/redirection.component';

@NgModule({
  declarations: [RedirectionComponent],
  imports: [CommonModule, SettingPageModule],
})
export class PagesModule {}
