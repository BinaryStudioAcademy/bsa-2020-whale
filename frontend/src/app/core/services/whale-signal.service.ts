import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { SignalRService } from '../services/signal-r.service';
import { from, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserOnline } from '../../shared/models/user/user-online';
import { Call } from '@shared/models/call/call';
import { MeetingLink } from '@shared/models/meeting/meeting-link';

@Injectable({
  providedIn: 'root',
})
export class WhaleSignalService {
  public signalHub: HubConnection;

  private signalUserConected = new Subject<UserOnline>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  private signalUserDisconected = new Subject<string>();
  public signalUserDisconected$ = this.signalUserDisconected.asObservable();

  private startCallOthers = new Subject<Call>();
  public startCallOthers$ = this.startCallOthers.asObservable();

  private startCallCaller = new Subject<MeetingLink>();
  public startCallCaller$ = this.startCallCaller.asObservable();

  private takeCall = new Subject<void>();
  public takeCall$ = this.takeCall.asObservable();

  private declineCall = new Subject<void>();
  public declineCall$ = this.declineCall.asObservable();

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

        this.signalHub.on('OnStartCallOthers', (call: Call) => {
          this.startCallOthers.next(call);
        });

        this.signalHub.on('OnStartCallCaller', (link: MeetingLink) => {
          this.startCallCaller.next(link);
        });

        this.signalHub.on('OnTakeCall', () => {
          this.takeCall.next();
        });

        this.signalHub.on('OnDeclineCall', () => {
          this.declineCall.next();
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
  OnStartCall,
  OnTakeCall,
  OnDeclineCall,
}
