import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DirectMessage } from '@shared/models/message/message';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HttpService } from 'app/core/services/http.service';
import { environment } from '@env';
import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subject, from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-contacts-chat',
  templateUrl: './contacts-chat.component.html',
  styleUrls: ['./contacts-chat.component.sass'],
})
export class ContactsChatComponent implements OnInit {
  private hubConnection: HubConnection;
  @Input() contactSelected: Contact;
  @Output() chat: EventEmitter<boolean> = new EventEmitter<boolean>();
  directMessageRecieved = new EventEmitter<DirectMessage>();
  messages: DirectMessage[] = [];
  newMessage: DirectMessage = {
    contactId: '',
    message: '',
    authorId: this.contactSelected.FirstMemberId,
    createdAt: new Date(),
    attachment: false,
  };
  constructor(
    private signalRService: SignalRService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    from(this.signalRService.registerHub(environment.apiUrl, 'chatHub'))
      .pipe(
        tap((hub) => {
          this.hubConnection = hub;
        })
      )
      .subscribe(() => {
        this.hubConnection.on('NewMessage', (message: DirectMessage) => {
          this.messages.push(message);
        });
      });
  }
  onUserClick(contact: Contact): void {
    this.contactSelected = contact;
    this.newMessage.contactId = contact.Id;
    this.newMessage.authorId = this.contactSelected.FirstMemberId;
    this.newMessage.createdAt = new Date();
    this.httpService
      .getRequest<DirectMessage[]>(
        '/api/ContactChat/' + this.contactSelected.Id
      )
      .subscribe(
        (data: DirectMessage[]) => {
          this.messages = data;
        },
        (error) => console.log(error)
      );
    this.hubConnection.invoke('JoinGroup', contact.Id);
  }
  sendMessage(): void {
    this.httpService
      .postRequest<DirectMessage, void>('/api/ContactChat/', this.newMessage)
      .subscribe((error) => console.log(error));
    this.newMessage.message = '';
  }
  close(): void {
    this.chat.emit(true);
  }
}
