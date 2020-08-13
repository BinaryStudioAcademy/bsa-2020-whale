import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';
import { Observable, from, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MeetingLink } from '../../shared/models/meeting/meeting-link';
import { Call } from '../../shared/models/call/call';

@Injectable({
  providedIn: 'root',
})
export class ChatSignalrService {
  public signalHub: HubConnection;

  private startCallCaller = new Subject<MeetingLink>();
  public startCallCaller$ = this.startCallCaller.asObservable();

  private startCallOthers = new Subject<Call>();
  public startCallOthers$ = this.startCallOthers.asObservable();

  private takeCall = new Subject<void>();
  public takeCall$ = this.takeCall.asObservable();

  private declineCall = new Subject<void>();
  public declineCall$ = this.declineCall.asObservable();

  constructor(private hubService: SignalRService) {
    from(hubService.registerHub(environment.apiUrl, 'chatHub'))
      .pipe(
        tap((hub) => {
          this.signalHub = hub;
        })
      )
      .subscribe(() => {
        this.signalHub.on('OnStartCallCaller', (link: MeetingLink) => {
          this.startCallCaller.next(link);
        });

        this.signalHub.on('OnStartCallOthers', (call: Call) => {
          this.startCallOthers.next(call);
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
  OnStartCall,
  OnTakeCall,
  OnDeclineCall,
}
