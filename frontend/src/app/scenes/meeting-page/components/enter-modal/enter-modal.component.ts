import { Component } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

@Component({
  selector: 'app-enter-modal',
  templateUrl: './enter-modal.component.html',
  styleUrls: ['./enter-modal.component.sass']
})
export class EnterModalComponent extends SimpleModalComponent<void, {microOff: boolean, cameraOff: boolean, leave: boolean}>
{
  message: string;
  public webcam = true;
  public microphone = true;
  private leave = false;
  constructor() {
    super();
  }

  public onProceed(): void {
    this.result = { microOff: !this.microphone, cameraOff: !this.webcam, leave: this.leave};
    this.close();
  }

  public onLeave(): void {
    this.leave = true;
    this.onProceed();
  }
}
