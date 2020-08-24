import { Component } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
export interface ConfirmationModal {
  message: string;
}

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.sass'],
})
export class ConfirmationModalComponent
  extends SimpleModalComponent<ConfirmationModal, boolean>
  implements ConfirmationModal {
  message: string;
  constructor() {
    super();
  }
  public onButtonClick(answer: boolean): void {
    this.result = answer;
    this.close();
  }
}
