import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MeetingComponent } from '../../scenes/meeting-page/components/meeting/meeting.component';

@Injectable({
  providedIn: 'root',
})
export class LastParticipantGuard implements CanDeactivate<MeetingComponent> {
  canDeactivate(component: MeetingComponent): boolean {
    if (
      component.meeting?.participants?.findIndex(
        (p) => p.id != component.currentParticipant?.id
      ) == -1
    ) {
      return confirm('You will end current meeting.');
    }

    return true;
  }
}
