import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Contact } from '@shared/models/contact/contact';
import { User } from '@shared/models/user/user';
import { ChatSignalrService } from './core/services/chat-signalr.service';
import { SignalRService } from './core/services/signal-r.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Call } from '@shared/models/call/call';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  call: Call;
  private chatSignalrService: ChatSignalrService;

  private unsubscribe$ = new Subject<void>();
  constructor(
    public fireAuth: AuthService,
    private http: HttpClient,
    private signalRService: SignalRService
  ) {
    this.chatSignalrService = new ChatSignalrService(this.signalRService);
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this.chatSignalrService.startCallOthers$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (call) => {
          this.call = call;
        },
        (err) => {
          this.closeIncomingCall();
        }
      );
  }

  closeIncomingCall(): void {
    this.call = null;
  }
}
