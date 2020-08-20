import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Contact } from '@shared/models/contact/contact';
import { SignalRService } from './core/services/signal-r.service';
import { from } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { Call } from '@shared/models/call/call';
import { environment } from '@env';
import { HubConnection } from '@aspnet/signalr';
import { HttpService } from './core/services/http.service';
import { User } from 'firebase';
import { Title } from '@angular/platform-browser';
import {
  WhaleSignalService,
  SignalMethods,
} from './core/services/whale-signal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  title = 'Whale';
  call: Call;
  user: User;

  private hubConnection: HubConnection;
  private getUserUrl: string = environment.apiUrl + '/api/user/email';

  constructor(
    public fireAuth: AuthService,
    private http: HttpClient,
    private signalRService: SignalRService,
    private httpService: HttpService,
    private authService: AuthService,
    private titleService: Title,
    private whaleSignalrService: WhaleSignalService
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

  ngOnInit(): void {
    from(this.signalRService.registerHub(environment.signalrUrl, 'chatHub'))
      .pipe(
        tap((hub) => {
          this.hubConnection = hub;
        })
      )
      .subscribe(() => {
        this.hubConnection.on('OnStartCallOthers', (call: Call) => {
          if (this.user.email !== call.callerEmail) {
            this.call = call;
          }
        });
      });

    this.authService.user$
      .pipe(filter((user) => Boolean(user)))
      .subscribe((user) => {
        this.user = Object.assign({}, user);
        this.http
          .get<User>(this.getUserUrl + `/${user.email}`, {
            observe: 'response',
          })
          .subscribe((user) => {
            console.log(
              'whalesignalr email:',
              this.authService.currentUser.email
            );
            this.whaleSignalrService.invoke(
              SignalMethods.OnUserConnect,
              this.authService.currentUser.email
            );

            this.httpService
              .getRequest<Contact[]>('/api/contacts')
              .pipe()
              .subscribe((data: Contact[]) => {
                data.forEach((contact) => {
                  this.hubConnection.invoke('JoinGroup', contact.id);
                });
              });
          });
      });
  }

  closeIncomingCall(): void {
    this.call = null;
  }
}
