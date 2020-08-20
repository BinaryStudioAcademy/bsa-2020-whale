import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Notification } from '@shared/models/notification/notification';
import { OptionsText } from '@shared/models/notification/options-text';
import { OptionsAddContact } from '@shared/models/notification/options-add-contact';
import { NotificationTypeEnum } from '@shared/models/notification/notification-type-enum';
import { ContactService } from 'app/core/services/contact.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass']
})
export class NotificationComponent implements OnInit {
  @Input() notification: Notification;
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  public message = '';
  public contactEmail = '';
  public isPendingContact = false;
  public show = true;
  constructor(
    private contactCervice: ContactService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.notification.notificationType === NotificationTypeEnum.TextNotification) {
      this.message = (JSON.parse(this.notification.options) as OptionsText).message;
      return;
    }
    if (this.notification.notificationType === NotificationTypeEnum.AddContactNotification) {
      this.contactEmail = (JSON.parse(this.notification.options) as OptionsAddContact).contactEmail;
      this.message = `${this.contactEmail} wants add you to contacts.`;
      this.isPendingContact = true;
      return;
    }
  }

  onClose(): void {
    this.delete.emit(this.notification.id);
    this.show = false;
  }
  onAddContact(): void {
    this.contactCervice.createContactByEmail(this.contactEmail).subscribe(
      (resp) => {
          this.toastr.success('Contact Add');
      },
      (error) => this.toastr.error(error.Message)
    );
    this.onClose();
  }
}
