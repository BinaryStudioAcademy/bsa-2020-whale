import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service'
import { HubConnection } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { Subject, from, Observable } from 'rxjs';
import { tap} from 'rxjs/operators';

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

  private conferenceStartRecording = new Subject<string>();
  public conferenceStartRecording$ = this.conferenceStartRecording.asObservable();

  private conferenceStopRecording = new Subject<string>();
  public conferenceStopRecording$ = this.conferenceStopRecording.asObservable();

  private signalAnswer = new Subject<SignalData>();
  public signalAnswer$ = this.signalAnswer.asObservable();

  private signalPeerConected = new Subject<string>();
  public signalPeerConected$ = this.signalPeerConected.asObservable();

  private signalPeerDisconected = new Subject<string>();
  public signalPeerDisconected$ = this.signalPeerDisconected.asObservable();

  constructor(private hubService: SignalRService) {
    from(hubService.registerHub(environment.meetingApiUrl, 'webrtcSignalHub')).pipe(
      tap(hub => {
        this.signalHub = hub;
      }
      )).subscribe(() => {
        
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

        this.signalHub.on('onConferenceStartRecording', (message: string) => {
          this.conferenceStartRecording.next(message);
        });

        this.signalHub.on('onConferenceStopRecording', (message: string) => {
          this.conferenceStopRecording.next(message);
        });

        this.signalHub.on('onPeerConnect', (connectedPeerId: string) => {
          this.signalPeerConected.next(connectedPeerId);
        });

        this.signalHub.on('onPeerDisconnect', (disconnectedPeerId: string) => {
          this.signalPeerDisconected.next(disconnectedPeerId);
        });
      });
  }

  public invoke(method: SignalMethods, arg: any): Observable<void>{
    return from(this.signalHub.invoke(SignalMethods[method].toString(), arg));
  }
}

export interface SignalData {
  fromConnectionId: string;
  signalInfo: string;
}

export enum SignalMethods {
  onPeerConnect,
  onPeerDisconnect,
  onConferenceStartRecording,
  onConferenceStopRecording
}
