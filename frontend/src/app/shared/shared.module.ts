import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

import { PollCreateComponent } from './components/poll/poll-create/poll-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PollComponent } from './components/poll/poll/poll.component';

import { SpinerComponent } from './components/spiner/spiner.component';
import { PollResultsComponent } from './components/poll/poll-results/poll-results.component';

@NgModule({
  declarations: [
    ChatComponent,
    PageHeaderComponent,
    SpinerComponent,
    PollCreateComponent,
    PollComponent,
    PollResultsComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [
    CommonModule,
    ChatComponent,
    PageHeaderComponent,
    PollCreateComponent,
    PollComponent,
    PollResultsComponent,
    SpinerComponent,
  ],
})
export class SharedModule {}
