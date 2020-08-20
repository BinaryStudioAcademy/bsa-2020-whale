import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { SignalRService } from '../services/signal-r.service';
import { from, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserOnline } from '../../shared/models/user/user-online';

@Injectable({
  providedIn: 'root',
})
export class WhaleSignalService {
  public signalHub: HubConnection;

  private signalUserConected = new Subject<UserOnline>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  private signalUserDisconected = new Subject<string>();
  public signalUserDisconected$ = this.signalUserDisconected.asObservable();

  constructor(private hubService: SignalRService) {
    from(hubService.registerHub(environment.signalrUrl, 'whale'))
      .pipe(
        tap((hub) => {
          this.signalHub = hub;
        })
      )
      .subscribe(() => {
        this.signalHub.on('OnUserConnect', (userOnline: UserOnline) => {
          this.signalUserConected.next(userOnline);
        });

        this.signalHub.on('OnUserDisconnect', (userEmail: string) => {
          this.signalUserDisconected.next(userEmail);
        });
      });
  }

  public invoke(method: SignalMethods, arg: any): Observable<void> {
    return from(this.signalHub.invoke(SignalMethods[method].toString(), arg));
  }
}

export enum SignalMethods {
  OnUserConnect,
  OnUserDisconnect,
}
