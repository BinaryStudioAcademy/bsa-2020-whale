import { Component } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from 'app/shared/models/contact/contact';
import { ToastrService } from 'ngx-toastr';
export interface CopyModal {
  message: string;
}

@Component({
  selector: 'app-copy-clipboard',
  templateUrl: './copy-clipboard.component.html',
  styleUrls: ['./copy-clipboard.component.sass'],
})
export class CopyClipboardComponent
  extends SimpleModalComponent<CopyModal, Contact>
  implements CopyModal {
  message: string;
  constructor(private toastr: ToastrService) {
    super();
  }

  onCopy(inputElement: HTMLInputElement): void {
    console.log(inputElement);
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, -1);
    this.toastr.success('Copied');
    this.close();
  }
}
