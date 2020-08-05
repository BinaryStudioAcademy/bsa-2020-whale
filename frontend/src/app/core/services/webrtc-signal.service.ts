import { Injectable } from '@angular/core';
import { SignalRService } from '../services/signal-r.service'
import { HubConnection } from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { timeStamp } from 'console';

@Injectable({
  providedIn: 'root'
})
export class WebrtcSignalService {

  public signalHub: HubConnection;
  public connectionId: string;

  constructor(private hubService: SignalRService) {
    this.signalHub = hubService.registerHub('webrtcSignalHub', environment.meetingApiUrl);

    this.signalHub.on('ThisClientConnected', (connectionId: string) => {
      console.log(`This is me: ${connectionId}`);
      this.connectionId = connectionId;
    });

    this.signalHub.on('NewClientConnected', (newConnectionId: string) => {
      console.log(`New user connected: ${newConnectionId}`);
      // send signal to new user here ?
      this.signalHub.send('SignalOffer', newConnectionId, "fakeOffer");
    });

    this.signalHub.on('ClientDisconnected', (disconnectedConnectionId: string) => {
      console.log(`User disconnected: ${disconnectedConnectionId}`);
      // remove tracks from disconnected user here ?
    });

    this.signalHub.on('SignalOffer', (fromConnectionId: string, signalOfferInfo: string /* TYPE ? */) => {
      console.log(`Signal OFFER from: ${fromConnectionId}`);

      // handle offer, create and send answer here ?
      this.signalHub.send('SignalAnswer', fromConnectionId, "fakeAnswer");
    });

    this.signalHub.on('SignalAnswer', (fromConnectionId: string, signalAnswerInfo: string /* TYPE ? */) => {
      console.log(`Signal ANSWER from: ${fromConnectionId}`);
      // handle answer here ?
    });
  }
}
