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
import { GroupChatComponent } from './components/group-chat/group-chat.component';
import { AddUserToGroupModalComponent } from './components/add-user-to-group-modal/add-user-to-group-modal.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { GroupCallModalComponent } from './components/group-call-modal/group-call-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { EditGroupInfoModalComponent } from './components/edit-group-info-modal/edit-group-info-modal.component';
import { UpdateGroupImageModalComponent } from './components/update-group-image-modal/update-group-image-modal.component';
import { UpcomingMeetingsComponent } from './components/upcoming-meetings/upcoming-meetings.component';
import { ScheduleMeetingNoteComponent } from './components/upcoming-meetings/schedule-meeting-note/schedule-meeting-note.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ChartModule, DateTimeService, LineSeriesService, TooltipService } from '@syncfusion/ej2-angular-charts';

@NgModule({
  declarations: [
    HomePageComponent,
    AddContactModalComponent,
    ContactsChatComponent,
    CallModalComponent,
    HistoryComponent,
    MeetingNoteComponent,
    AddGroupModalComponent,
    GroupChatComponent,
    AddUserToGroupModalComponent,
    GroupCallModalComponent,
    EditGroupInfoModalComponent,
    UpdateGroupImageModalComponent,
    UpcomingMeetingsComponent,
    ScheduleMeetingNoteComponent,
    StatisticsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    InfiniteScrollModule,
    ReactiveFormsModule,
    ImageCropperModule,
    ChartModule
  ],
  providers: [DateTimeService, LineSeriesService, TooltipService],
  entryComponents: [CallModalComponent, GroupCallModalComponent],
})
export class HomePageModule {}
