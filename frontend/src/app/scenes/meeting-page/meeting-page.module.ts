import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingComponent } from './components/meeting/meeting.component';
import { SharedModule } from '@shared/shared.module';



@NgModule({
  declarations: [MeetingComponent],
  imports: [
    SharedModule
  ]
})
export class MeetingPageModule { }
