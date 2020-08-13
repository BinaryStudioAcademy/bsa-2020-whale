import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Call } from '@shared/models/call/call';
import {
  ChatSignalrService,
  SignalMethods,
} from 'app/core/services/chat-signalr.service';
import { SignalRService } from 'app/core/services/signal-r.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CallDecline } from '@shared/models/call/call-decline';

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.sass'],
})
export class IncomingCallComponent implements OnInit, OnDestroy {
  @Input() call: Call;
  @Output() closeEvent = new EventEmitter();

  private chatSignalrService: ChatSignalrService;

  private unsubscribe$ = new Subject<void>();
  constructor(private signalRService: SignalRService, private router: Router) {
    this.chatSignalrService = new ChatSignalrService(this.signalRService);
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.chatSignalrService.declineCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.close());
  }

  confirm(): void {
    this.chatSignalrService.invoke(
      SignalMethods.OnTakeCall,
      this.call.contact.id
    );
    this.close();
    this.router.navigate([
      '/meeting-page',
      `?id=${this.call.link.id}&pwd=${this.call.link.password}`,
    ]);
  }

  decline(): void {
    this.chatSignalrService.invoke(SignalMethods.OnDeclineCall, {
      contactId: this.call.contact.id,
      email: this.call.contact.firstMember.email,
    } as CallDecline);
    this.close();
  }

  close(): void {
    this.closeEvent.emit();
  }
}
