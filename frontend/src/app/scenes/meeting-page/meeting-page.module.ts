import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingComponent } from './components/meeting/meeting.component';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';
import { CanvasWhiteboardModule } from 'ng2-canvas-whiteboard';
import { EnterModalComponent } from './components/enter-modal/enter-modal.component';
@NgModule({
  declarations: [MeetingComponent, EnterModalComponent],
  imports: [
    SharedModule,
    FormsModule,
    AngularDraggableModule,
    CanvasWhiteboardModule,
  ],
})
export class MeetingPageModule {}
