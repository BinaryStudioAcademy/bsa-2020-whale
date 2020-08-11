import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SpinerComponent } from './components/spiner/spiner.component';
import { FormsModule } from '@angular/forms';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { ParticipantCardComponent } from './components/participant-card/participant-card.component';

@NgModule({
  declarations: [
    PageHeaderComponent,
    SpinerComponent,
    DateFormatPipe,
    ParticipantCardComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [
    CommonModule,
    PageHeaderComponent,
    SpinerComponent,
    DateFormatPipe,
    ParticipantCardComponent,
  ],
})
export class SharedModule {}
