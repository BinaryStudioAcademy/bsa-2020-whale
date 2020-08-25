import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '../../../models/contact/contact';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.sass'],
})
export class ContactComponent implements OnInit {
  @Input() contact: Contact;
  @Output() contactClicked = new EventEmitter<Contact>();
  public isContactSelected = false;

  constructor() {}

  ngOnInit(): void {}

  returnCorrectLink(): string {
    return this.contact?.secondMember.avatarUrl.startsWith('http') ||
      this.contact?.secondMember.avatarUrl.startsWith('data')
      ? this.contact?.secondMember.avatarUrl
      : '';
  }

  public onContactClick() {
    this.isContactSelected = !this.isContactSelected;
    this.contactClicked.emit(this.contact);
  }
}
