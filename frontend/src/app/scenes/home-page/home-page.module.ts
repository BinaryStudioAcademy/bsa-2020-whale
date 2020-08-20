import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './components/home-page/home-page.component';
import { SharedModule } from '@shared/shared.module';
import { AddContactModalComponent } from './components/add-contact-modal/add-contact-modal.component';
import { FormsModule } from '@angular/forms';
import { ContactsChatComponent } from './components/contacts-chat/contacts-chat.component';
import { CallModalComponent } from './components/call-modal/call-modal.component';
import { HistoryComponent } from './components/history/history.component';
import { MeetingNoteComponent } from './components/history/meeting-note/meeting-note.component';
import { AddGroupModalComponent } from './components/add-group-modal/add-group-modal.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  declarations: [
    HomePageComponent,
    AddContactModalComponent,
    ContactsChatComponent,
    CallModalComponent,
    HistoryComponent,
    MeetingNoteComponent,
    AddGroupModalComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule, InfiniteScrollModule],
  entryComponents: [CallModalComponent],
})
export class HomePageModule {}
