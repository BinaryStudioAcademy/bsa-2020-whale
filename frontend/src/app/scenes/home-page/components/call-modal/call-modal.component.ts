import { Component, Input } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from '@shared/models/contact/contact';
import { User } from '@shared/models/user/user';
import { DirectMessage } from '@shared/models/message/message';

@Component({
  selector: 'app-call-modal',
  templateUrl: './call-modal.component.html',
  styleUrls: ['./call-modal.component.sass'],
})
export class CallModalComponent extends SimpleModalComponent<Contact, null>
  implements Contact {
  id: string;
  firstMemberId: string;
  firstMember?: User;
  secondMemberId: string;
  secondMember?: User;
  pinnedMessage: DirectMessage;
  settings: any;
  contactnerSettings: any;

  constructor() {
    super();
  }
}
