import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Call } from '@shared/models/call/call';
import { SignalRService } from 'app/core/services/signal-r.service';
import { Router } from '@angular/router';
import { Subject, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CallDecline } from '@shared/models/call/call-decline';
import { environment } from '@env';
import { HubConnection } from '@aspnet/signalr';
@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.sass'],
})
export class IncomingCallComponent implements OnInit, OnDestroy {
  @Input() call: Call;
  @Output() closeEvent = new EventEmitter();

  private hubConnection: HubConnection;
  private unsubscribe$ = new Subject<void>();
  constructor(private signalRService: SignalRService, private router: Router) {}
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    from(this.signalRService.registerHub(environment.apiUrl, 'chatHub'))
      .pipe(
        tap((hub) => {
          this.hubConnection = hub;
        })
      )
      .subscribe(() => {
        this.hubConnection.on('OnDeclineCall', () => {
          this.close();
        });

        this.hubConnection.invoke('JoinGroup', this.call.contact.id);
      });
  }

  confirm(): void {
    this.hubConnection.invoke('OnTakeCall', this.call.contact.id);
    this.close();
    this.router.navigate([
      '/meeting-page',
      `?id=${this.call.meetingLink.id}&pwd=${this.call.meetingLink.password}`,
    ]);
  }

  decline(): void {
    this.hubConnection.invoke('OnDeclineCall', {
      contactId: this.call.contact.id,
      email: this.call.contact.firstMember.email,
      meetingId: this.call.meetingLink.id,
    } as CallDecline);
    this.close();
  }

  close(): void {
    this.closeEvent.emit();
  }
}
