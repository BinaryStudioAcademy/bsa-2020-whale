import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service'
import { HubConnection } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { timeStamp } from 'console';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebrtcSignalService {

  public signalHub: HubConnection;
  public connectionId: string;

  private newClientConnected = new Subject<string>();
  public newClientConnected$ = this.newClientConnected.asObservable();

  private clientDisconnected = new Subject<string>();
  public clientDisconnected$ = this.clientDisconnected.asObservable();

  private signalOffer = new Subject<SignalData>();
  public signalOffer$ = this.signalOffer.asObservable();

  private signalAnswer = new Subject<SignalData>();
  public signalAnswer$ = this.signalAnswer.asObservable();

  constructor(private hubService: SignalRService) {
    hubService.registerHub(environment.meetingApiUrl, 'webrtcSignalHub').then(hub => this.signalHub = hub);

    this.signalHub.on('ThisClientConnected', (connectionId: string) => {
      console.log(`This is me: ${connectionId}`);
      this.connectionId = connectionId;
    });

    this.signalHub.on('NewClientConnected', (newConnectionId: string) => {
      this.newClientConnected.next(newConnectionId);
    });

    this.signalHub.on('ClientDisconnected', (disconnectedConnectionId: string) => {
      this.clientDisconnected.next(disconnectedConnectionId);
    });

    this.signalHub.on('SignalOffer', (fromConnectionId: string, signalOfferInfo: string /* TYPE ? */) => {
      this.signalOffer.next({ 
        fromConnectionId: fromConnectionId, 
        signalInfo: signalOfferInfo 
      });
    });

    this.signalHub.on('SignalAnswer', (fromConnectionId: string, signalAnswerInfo: string /* TYPE ? */) => {
      this.signalAnswer.next({ 
        fromConnectionId: fromConnectionId, 
        signalInfo: signalAnswerInfo 
      });
    });
  }
}

export interface SignalData {
  fromConnectionId: string;
  signalInfo: string; 
}
