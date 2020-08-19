import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Notification } from '@shared/models/notification/notification';
import { OptionsText } from '@shared/models/notification/options-text';
import { NotificationTypeEnum } from '@shared/models/notification/notification-type-enum';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass']
})
export class NotificationComponent implements OnInit {
  @Input() notification: Notification;
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  public message = '';
  public isPendingContact = false;
  public show = true;
  constructor() { }

  ngOnInit(): void {
    if (this.notification.notificationType === NotificationTypeEnum.TextNotification) {
      this.message = (JSON.parse(this.notification.options) as OptionsText).message;
      return;
    }
    if (this.notification.notificationType === NotificationTypeEnum.AddContactNotification) {
      //this.message = (JSON.parse(this.notification.options) as OptionsText).message;
      this.message = 'test';
      this.isPendingContact = true;
      return;
    }
  }

  onClose(): void {
    this.delete.emit(this.notification.id);
    this.show = false;
  }

}
