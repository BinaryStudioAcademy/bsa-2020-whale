import { Component } from '@angular/core';
import { WebrtcSignalService, SignalData } from './core/services/webrtc-signal.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'frontend';

  constructor(private signalHubService: WebrtcSignalService) {
    this.signalHubService.newClientConnected$.subscribe((newConnectionId) => {
      console.log(`New user connected: ${newConnectionId}`);
      // send signal to new user here ?
      this.signalHubService.signalHub.send('SignalOffer', newConnectionId, "fakeOffer");
    });

    this.signalHubService.clientDisconnected$.subscribe((disconnectedConnectionId) => {
      console.log(`User disconnected: ${disconnectedConnectionId}`);
      // remove tracks from disconnected user here ?
    });

    this.signalHubService.signalOffer$.subscribe((signalData: SignalData) => {
      console.log(`Signal OFFER from: ${signalData.fromConnectionId}`);
      // handle offer, create and send answer here ?
      this.signalHubService.signalHub.send('SignalAnswer', signalData.fromConnectionId, "fakeAnswer");
    });

    this.signalHubService.signalAnswer$.subscribe((signalData: SignalData) => {
      console.log(`Signal ANSWER from: ${signalData.fromConnectionId}`);
      // handle answer here ?
    });
  }

}
