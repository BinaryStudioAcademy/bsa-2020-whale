import { Component } from '@angular/core';
import { WebrtcSignalService } from './core/services/webrtc-signal.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'frontend';

  constructor(private signalHubService: WebrtcSignalService) {
    
  }

}
