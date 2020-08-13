import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from '@shared/models/contact/contact';
import { User } from '@shared/models/user/user';
import { DirectMessage } from '@shared/models/message/message';
import {
  ChatSignalrService,
  SignalMethods,
} from '../../../../core/services/chat-signalr.service';
import { SignalRService } from '../../../../core/services/signal-r.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MeetingLink } from '@shared/models/meeting/meeting-link';
import { Router } from '@angular/router';
import { CallStart } from '@shared/models/call/call-start';
import { CallDecline } from '@shared/models/call/call-decline';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';

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
  settings: any;
  contactnerSettings: any;

  private chatSignalrService: ChatSignalrService;
  link: MeetingLink;

  private unsubscribe$ = new Subject<void>();
  constructor(
    private signalRService: SignalRService,
    private toastr: ToastrService,
    private router: Router
  ) {
    super();
    this.chatSignalrService = new ChatSignalrService(this.signalRService);
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this.chatSignalrService.startCallCaller$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (link) => {
          this.link = link;
        },
        (err) => {
          this.toastr.error(err.message);
          this.decline();
        }
      );

    this.chatSignalrService.declineCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.close());

    this.chatSignalrService.takeCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigate([
          '/meeting-page',
          `?id=${this.link.id}&pwd=${this.link.password}`,
        ]);
        this.close();
      });

    this.chatSignalrService.invoke(SignalMethods.OnStartCall, {
      contactId: this.id,
      meeting: {
        settings: '',
        startTime: new Date(),
        anonymousCount: 0,
        isScheduled: false,
        isRecurrent: false,
      } as MeetingCreate,
      emails: [this.firstMember.email, this.secondMember.email],
    } as CallStart);
  }

  decline(): void {
    this.chatSignalrService.invoke(SignalMethods.OnDeclineCall, {
      contactId: this.id,
      email: this.firstMember.email,
    } as CallDecline);
    this.close();
  }
}
