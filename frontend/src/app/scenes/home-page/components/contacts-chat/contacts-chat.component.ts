import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  AfterContentInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
import { Console } from 'console';
import { stringify } from 'querystring';
import { SimpleModalService } from 'ngx-simple-modal';
import { CallModalComponent } from '../call-modal/call-modal.component';

@Component({
  selector: 'app-contacts-chat',
  templateUrl: './contacts-chat.component.html',
  styleUrls: ['./contacts-chat.component.sass'],
})
export class ContactsChatComponent implements OnInit, OnChanges {
  private hubConnection: HubConnection;
  currContactId: string;
  @Input() contactSelected: Contact;
  @Output() chat: EventEmitter<boolean> = new EventEmitter<boolean>();
  directMessageRecieved = new EventEmitter<DirectMessage>();
  messages: DirectMessage[] = [];
  newMessage: DirectMessage = {
    contactId: '',
    message: '',
    authorId: '',
    createdAt: new Date(),
    attachment: false,
  };
  constructor(
    private signalRService: SignalRService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.httpService
      .getRequest<DirectMessage[]>(
        '/api/ContactChat/' + this.contactSelected.id
      )
      .subscribe(
        (data: DirectMessage[]) => {
          this.messages = data;
        },
        (error) => console.log(error)
      );
    this.hubConnection?.invoke('JoinGroup', this.contactSelected.id);
  }
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
        this.hubConnection.invoke('JoinGroup', this.contactSelected.id);
      });
  }

  sendMessage(): void {
    this.newMessage.contactId = this.contactSelected.id;
    this.newMessage.authorId = this.contactSelected.firstMemberId;
    this.newMessage.createdAt = new Date();
    console.log('newMsg');
    console.log(this.newMessage);
    this.httpService
      .postRequest<DirectMessage, void>('/api/ContactChat/', this.newMessage)
      .subscribe(
        () => {
          this.newMessage.message = '';
        },
        (error) => console.log(error)
      );
  }
  close(): void {
    this.chat.emit(true);
  }

  public call(): void {
    console.log(this.contactSelected);
    this.simpleModalService.addModal(CallModalComponent, this.contactSelected);
  }

  public onEnterKeyPress(event: KeyboardEvent, valid: boolean): void {
    event.preventDefault();
    if (valid) {
      this.sendMessage();
    }
  }
}
