import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanDeactivate,
} from '@angular/router';
import { Observable } from 'rxjs';
import { MeetingComponent } from '../../scenes/meeting-page/components/meeting/meeting.component';
import { ParticipantRole } from '@shared/models/participant/participant-role';

@Injectable({
  providedIn: 'root',
})
export class LastParticipantGuard implements CanDeactivate<MeetingComponent> {
  canDeactivate(component: MeetingComponent): boolean {
    /*component.meeting.participants.findIndex(p => p.id != component.currentParticipant.id) == -1*/
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
