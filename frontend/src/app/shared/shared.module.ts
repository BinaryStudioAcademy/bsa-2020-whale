import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PollCreateComponent } from './components/poll/poll-create/poll-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PollComponent } from './components/poll/poll/poll.component';
import { SpinerComponent } from './components/spiner/spiner.component';
import { PollResultsComponent } from './components/poll/poll-results/poll-results.component';
import { FormsModule } from '@angular/forms';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { ParticipantCardComponent } from './components/participant-card/participant-card.component';
import { MeetingStatisticsComponent } from './components/meeting-statistics/meeting-statistics.component';
import { CopyClipboardComponent } from './components/copy-clipboard/copy-clipboard.component';
import { IncomingCallComponent } from './components/incoming-call/incoming-call.component';
import { AngularDraggableModule } from 'angular2-draggable';

@NgModule({
  declarations: [
    PageHeaderComponent,
    SpinerComponent,
    DateFormatPipe,
    ParticipantCardComponent,
    PollCreateComponent,
    PollComponent,
    PollResultsComponent,
    MeetingStatisticsComponent,
    CopyClipboardComponent,
    IncomingCallComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularDraggableModule,
  ],
  exports: [
    CommonModule,
    PageHeaderComponent,
    PollCreateComponent,
    PollComponent,
    PollResultsComponent,
    SpinerComponent,
    DateFormatPipe,
    ParticipantCardComponent,
    MeetingStatisticsComponent,
    IncomingCallComponent,
  ],
})
export class SharedModule {}
