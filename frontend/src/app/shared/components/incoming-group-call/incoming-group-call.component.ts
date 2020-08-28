import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { GroupCall } from '@shared/models/call/group-call';
import { SignalRService } from 'app/core/services/signal-r.service';
import { Router } from '@angular/router';
import { Subject, from } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { CallDecline } from '@shared/models/call/call-decline';
import { environment } from '@env';
import { HubConnection } from '@aspnet/signalr';
import {
  WhaleSignalService,
  WhaleSignalMethods,
  UpstateService,
} from 'app/core/services';
import { User, GroupCallDecline } from '@shared/models';

@Component({
  selector: 'app-incoming-group-call',
  templateUrl: './incoming-group-call.component.html',
  styleUrls: ['./incoming-group-call.component.sass'],
})
export class IncomingGroupCallComponent implements OnInit, OnDestroy {
  @Input() groupCall: GroupCall;
  @Output() closeEvent = new EventEmitter();
  currentUser: User;

  private hubConnection: HubConnection;
  private unsubscribe$ = new Subject<void>();
  constructor(
    private whaleSignalrService: WhaleSignalService,
    private router: Router,
    private upstateService: UpstateService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.upstateService.getLoggedInUser().subscribe((user) => {
      this.currentUser = user;
      this.whaleSignalrService.declineGroupCall$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((t) => {
          if (t.userId === this.groupCall.caller.id) {
            this.close();
          }
        });
    });
  }

  confirm(): void {
    this.whaleSignalrService.invoke(
      WhaleSignalMethods.OnTakeGroupCall,
      this.groupCall.group.id
    );
    this.close();
    this.router.navigate([
      '/meeting-page',
      `?id=${this.groupCall.meetingLink.id}&pwd=${this.groupCall.meetingLink.password}`,
    ]);
  }

  decline(): void {
    this.whaleSignalrService.invoke(WhaleSignalMethods.OnDeclineGroupCall, {
      userId: this.currentUser.id,
      callCreator: this.groupCall.caller,
      meetingId: this.groupCall.meetingLink.id,
      groupId: this.groupCall.group.id,
    } as GroupCallDecline);
    this.close();
  }

  close(): void {
    this.closeEvent.emit();
  }

  public isImageHere(): boolean {
    return (
      this.groupCall.group.photoUrl !== null &&
      this.groupCall.group.photoUrl !== undefined &&
      this.groupCall.group.photoUrl !== ''
    );
  }
}
