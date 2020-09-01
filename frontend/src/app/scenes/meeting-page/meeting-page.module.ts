import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingComponent } from './components/meeting/meeting.component';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';
import { CanvasWhiteboardModule } from 'ng2-canvas-whiteboard';
import { EnterModalComponent } from './components/enter-modal/enter-modal.component';
import { DivisionByRoomsModalComponent } from './components/division-by-rooms-modal/division-by-rooms-modal.component';
import { RecordModalComponent } from './components/record-modal/record-modal.component';
import { SettingPageModule } from '../setting-page/setting-page.module';
import { ReactionsComponent } from './components/reactions/reactions.component';

@NgModule({
  declarations: [
    MeetingComponent,
    EnterModalComponent,
    RecordModalComponent,
    DivisionByRoomsModalComponent,
    ReactionsComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    AngularDraggableModule,
    CanvasWhiteboardModule,
    SettingPageModule,
  ],
})
export class MeetingPageModule {}
