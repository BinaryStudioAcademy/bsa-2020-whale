import { Component, OnInit } from '@angular/core';
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
    private titleService: Title
  ) {
    titleService.setTitle(this.title);
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
        /*this.http
          .get<User>(this.getUserUrl + `/${user.email}`, {
            observe: 'response',
          })
          .subscribe((user) => {
            this.httpService
              .getRequest<Contact[]>('/api/contacts')
              .pipe()
              .subscribe((data: Contact[]) => {
                data.forEach((contact) => {
                  this.hubConnection.invoke('JoinGroup', contact.id);
                });
              });
          });*/
      });
  }

  closeIncomingCall(): void {
    this.call = null;
  }
}
