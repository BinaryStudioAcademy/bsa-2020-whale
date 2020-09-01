import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { filter, takeUntil, first } from 'rxjs/operators';
import { Call } from '@shared/models/call/call';
import { GroupCall } from '@shared/models/call/group-call';
import { environment } from '@env';
import { User } from 'firebase';
import { Title } from '@angular/platform-browser';
import {
  WhaleSignalService,
  WhaleSignalMethods,
} from './core/services/whale-signal.service';
import { ToastrService } from 'ngx-toastr';
import { UserRegistrationService } from './core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Whale';
  call: Call;
  groupCall: GroupCall;
  user: User;

  private getUserUrl: string = environment.apiUrl + '/api/user/email';

  private unsubscribe$ = new Subject<void>();

  constructor(
    public fireAuth: AuthService,
    private http: HttpClient,
    private authService: AuthService,
    private titleService: Title,
    private whaleSignalrService: WhaleSignalService,
    private toastr: ToastrService,
    private registrationService: UserRegistrationService
  ) {
    titleService.setTitle(this.title);
  }
  @HostListener('window:beforeunload')
  beforeunload(): void {
    if (this.authService.currentUser !== null){
      this.whaleSignalrService.invoke(
        WhaleSignalMethods.OnUserDisconnect,
        this.authService.currentUser.email
      );
    }
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

    this.whaleSignalrService.startCallOthersInGroup$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (call) => {
          if (this.user.email !== call.caller.email) {
            this.groupCall = call;
          }
        },
        (err) => {
          this.toastr.error(err.Message);
        }
      );

    this.fireAuth.user$
      .pipe(
        filter((user) => Boolean(user)),
        first()
      )
      .subscribe(
        (user) => {
          this.registrationService.userRegistered$.subscribe(
            (userFromDb) => {
              this.user = Object.assign({}, user);
              this.whaleSignalrService.invoke(
                WhaleSignalMethods.OnUserConnect,
                this.authService.currentUser.email
              );
            },
            (error) => {}
          );
        },
        (error) => {}
      );
  }

  closeIncomingCall(): void {
    this.call = null;
  }
  closeIncomingGroupCall(): void {
    this.groupCall = null;
  }
}
