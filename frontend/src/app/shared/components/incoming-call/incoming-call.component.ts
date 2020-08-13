import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '@shared/models/contact/contact';

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.sass'],
})
export class IncomingCallComponent implements OnInit {
  @Input() contact: Contact;
  @Output() closeEvent = new EventEmitter();
  constructor() {}
  ngOnInit(): void {}

  confirm(): void {
    this.close();
  }

  close(): void {
    this.closeEvent.emit();
  }
}
