import { NgModule } from '@angular/core';

import { ScheduleMeetingPageComponent } from './components/schedule-meeting-page/schedule-meeting-page.component';
import { SharedModule } from '@shared/shared.module';
import { DpDatePickerModule } from 'ng2-date-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgendaComponent } from './components/agenda/agenda.component';

@NgModule({
  declarations: [ScheduleMeetingPageComponent, AgendaComponent],
  imports: [SharedModule, DpDatePickerModule, FormsModule, ReactiveFormsModule],
})
export class ScheduleMeetingPageModule {}
