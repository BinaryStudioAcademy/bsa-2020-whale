import { Component, OnInit, OnDestroy } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from '@shared/models/contact/contact';
import { User } from '@shared/models/user/user';
import { DirectMessage } from '@shared/models/message/direct-message';
import { Subject } from 'rxjs';
import { MeetingLink } from '@shared/models/meeting/meeting-link';
import { Router } from '@angular/router';
import { CallStart } from '@shared/models/call/call-start';
import { CallDecline } from '@shared/models/call/call-decline';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { takeUntil } from 'rxjs/operators';
import { WhaleSignalService, WhaleSignalMethods } from 'app/core/services';

@Component({
  selector: 'app-call-modal',
  templateUrl: './call-modal.component.html',
  styleUrls: ['./call-modal.component.sass'],
})
export class CallModalComponent extends SimpleModalComponent<Contact, null>
  implements Contact, OnInit, OnDestroy {
  id: string;
  firstMemberId: string;
  firstMember?: User;
  secondMemberId: string;
  secondMember?: User;
  pinnedMessage: DirectMessage;
  isAccepted: boolean;
  link: MeetingLink;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private whaleSignalrService: WhaleSignalService,
    private router: Router
  ) {
    super();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.whaleSignalrService.startCallCaller$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((link) => {
        this.link = link;
      });

    this.whaleSignalrService.declineCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.close();
      });

    this.whaleSignalrService.takeCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigate([
          '/meeting-page',
          `?id=${this.link.id}&pwd=${this.link.password}`,
        ]);
        this.close();
      });

    this.whaleSignalrService.invoke(WhaleSignalMethods.OnStartCall, {
      contactId: this?.id,
      meeting: {
        settings: '',
        startTime: new Date(),
        anonymousCount: 0,
        isScheduled: false,
        isRecurrent: false,
        creatorEmail: this?.firstMember?.email,
      } as MeetingCreate,
    } as CallStart);
  }

  decline(): void {
    this.whaleSignalrService.invoke(WhaleSignalMethods.OnDeclineCall, {
      userId: this?.secondMember?.id,
      email: this?.firstMember?.email,
      meetingId: this?.link?.id,
    } as CallDecline);
    this.close();
  }
}
