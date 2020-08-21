import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Call } from '@shared/models/call/call';
import { environment } from '@env';
import { User } from 'firebase';
import { Title } from '@angular/platform-browser';
import {
  WhaleSignalService,
  SignalMethods,
} from './core/services/whale-signal.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Whale';
  call: Call;
  user: User;

  private getUserUrl: string = environment.apiUrl + '/api/user/email';

  private unsubscribe$ = new Subject<void>();

  constructor(
    public fireAuth: AuthService,
    private http: HttpClient,
    private authService: AuthService,
    private titleService: Title,
    private whaleSignalrService: WhaleSignalService,
    private toastr: ToastrService
  ) {
    titleService.setTitle(this.title);
  }
  @HostListener('window:beforeunload')
  beforeunload(): void {
    this.whaleSignalrService.invoke(
      SignalMethods.OnUserDisconnect,
      this.authService.currentUser.email
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.whaleSignalrService.startCallOthers$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (call) => {
          if (this.user.email !== call.callerEmail) {
            this.call = call;
          }
        },
        (err) => {
          this.toastr.error(err.Message);
        }
      );

    this.authService.user$
      .pipe(filter((user) => Boolean(user)))
      .subscribe((user) => {
        this.user = Object.assign({}, user);
        this.http
          .get<User>(this.getUserUrl + `/${user.email}`, {
            observe: 'response',
          })
          .subscribe((user) => {
            this.whaleSignalrService.invoke(
              SignalMethods.OnUserConnect,
              this.authService.currentUser.email
            );
          });
      });
  }

  closeIncomingCall(): void {
    this.call = null;
  }
}
