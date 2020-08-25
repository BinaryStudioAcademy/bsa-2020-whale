import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-record-modal',
  templateUrl: './record-modal.component.html',
  styleUrls: ['./record-modal.component.sass'],
})
export class RecordModalComponent
  extends SimpleModalComponent<RecordModal, void>
  implements RecordModal {
  link: string;
  constructor(private toastr: ToastrService) {
    super();
  }

  onCopy(): void {
    const tempInput = document.createElement('input');
    tempInput.value = this.link;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    this.toastr.success('Copied');
    this.close();
  }
  onDownload(): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', this.link);
    link.setAttribute('download', this.link);
    document.body.appendChild(link);
    link.click();
    link.remove();
    this.close();
  }
}

export interface RecordModal {
  link: string;
}
