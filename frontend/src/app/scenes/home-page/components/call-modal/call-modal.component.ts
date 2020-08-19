import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from '@shared/models/contact/contact';
import { User } from '@shared/models/user/user';
import { DirectMessage } from '@shared/models/message/direct-message';
import { SignalRService } from '../../../../core/services/signal-r.service';
import { from } from 'rxjs';
import { MeetingLink } from '@shared/models/meeting/meeting-link';
import { Router } from '@angular/router';
import { CallStart } from '@shared/models/call/call-start';
import { CallDecline } from '@shared/models/call/call-decline';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { HubConnection } from '@aspnet/signalr';
import { environment } from '@env';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-call-modal',
  templateUrl: './call-modal.component.html',
  styleUrls: ['./call-modal.component.sass'],
})
export class CallModalComponent extends SimpleModalComponent<Contact, null>
  implements Contact, OnInit {
  id: string;
  firstMemberId: string;
  firstMember?: User;
  secondMemberId: string;
  secondMember?: User;
  pinnedMessage: DirectMessage;
  settings: any;
  contactnerSettings: any;

  link: MeetingLink;
  private hubConnection: HubConnection;

  constructor(private signalRService: SignalRService, private router: Router) {
    super();
  }
  ngOnInit(): void {
    from(this.signalRService.registerHub(environment.signalrUrl, 'chatHub'))
      .pipe(
        tap((hub) => {
          this.hubConnection = hub;
        })
      )
      .subscribe(() => {
        this.hubConnection.on('OnStartCallCaller', (link: MeetingLink) => {
          this.link = link;
        });

        this.hubConnection.on('OnDeclineCall', () => {
          this.close();
        });

        this.hubConnection.on('OnTakeCall', () => {
          this.router.navigate([
            '/meeting-page',
            `?id=${this.link.id}&pwd=${this.link.password}`,
          ]);
          this.close();
        });

        this.hubConnection.invoke('OnStartCall', {
          contactId: this.id,
          meeting: {
            settings: '',
            startTime: new Date(),
            anonymousCount: 0,
            isScheduled: false,
            isRecurrent: false,
            creatorEmail: this.firstMember.email,
          } as MeetingCreate,
        } as CallStart);
      });
  }

  decline(): void {
    this.hubConnection.invoke('OnDeclineCall', {
      contactId: this.id,
      email: this.firstMember.email,
      meetingId: this.link.id,
    } as CallDecline);
    this.close();
  }
}
