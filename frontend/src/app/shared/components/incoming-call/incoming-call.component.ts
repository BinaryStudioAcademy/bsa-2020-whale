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
import { tap, takeUntil } from 'rxjs/operators';
import { CallDecline } from '@shared/models/call/call-decline';
import { environment } from '@env';
import { HubConnection } from '@aspnet/signalr';
import {
  WhaleSignalService,
  WhaleSignalMethods,
  BlobService,
} from 'app/core/services';
@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.sass'],
})
export class IncomingCallComponent implements OnInit, OnDestroy {
  @Input() call: Call;
  @Output() closeEvent = new EventEmitter();

  private hubConnection: HubConnection;
  audioLink = '';
  private unsubscribe$ = new Subject<void>();
  constructor(
    private whaleSignalrService: WhaleSignalService,
    private router: Router,
    private blobService: BlobService
  ) {}
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.blobService.getAudio('incoming-call').subscribe((resp) => {
      this.audioLink = resp;
    });

    this.whaleSignalrService.declineCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.close();
      });
  }

  confirm(): void {
    this.whaleSignalrService.invoke(
      WhaleSignalMethods.OnTakeCall,
      this.call.contact.firstMember.id
    );
    this.close();
    this.router.navigate([
      '/meeting-page',
      `?id=${this.call.meetingLink.id}&pwd=${this.call.meetingLink.password}`,
    ]);
  }

  decline(): void {
    this.whaleSignalrService.invoke(WhaleSignalMethods.OnDeclineCall, {
      userId: this.call.contact.firstMember.id,
      email: this.call.contact.firstMember.email,
      meetingId: this.call.meetingLink.id,
    } as CallDecline);
    this.close();
  }

  close(): void {
    this.closeEvent.emit();
  }
}
