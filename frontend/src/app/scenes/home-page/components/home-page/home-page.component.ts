import { Component, OnInit, EventEmitter } from '@angular/core';
import { DirectMessage } from '@shared/models/message/message';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HttpService } from 'app/core/services/http.service';
import { HubConnection } from '@aspnet/signalr';
import { environment } from '@env';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit {
  mainUser: User = {
    id: '07e0ab30-ddfb-4510-b831-df749e927bff',
    firstName: 'Daniel',
    secondName: 'Louise',
    avatarUrl: 'https://img.icons8.com/color/240/000000/user-female.png',
    email: 'newEmal@gmail.com',
    phone: 'meow',
    registrationDate: new Date(),
  };
  contacts: Contact[];

  contactsVisibility = true;
  groupsVisibility = false;
  chatVisibility = false;
  private hubConnection: HubConnection;
  directMessageRecieved = new EventEmitter<DirectMessage>();
  messages: DirectMessage[] = [];
  newMessage: DirectMessage = {
    contactId: '',
    message: '',
    authorId: this.mainUser.id,
    createdAt: new Date(),
    attachment: false,
  };
  contactSelected: Contact;
  constructor(
    private signalRService: SignalRService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.httpService
      .getRequest<Contact[]>('/api/Contacts/' + this.mainUser.id)
      .subscribe(
        (data: Contact[]) => {
          this.contacts = data;
        },
        (error) => console.log(error)
      );
    this.signalRService
      .registerHub(environment.apiUrl, 'chatHub')
      .then((conn) => (this.hubConnection = conn))
      .catch((err) => console.log(err));
  }

  addNewGroup(): void {
    console.log('group clicked!');
  }
  addNewContact(): void {
    console.log('contact clicked!');
  }
  onUserClick(contact: Contact): void {
    this.directMessageRecieved = this.signalRService.registerEvent<
      DirectMessage
    >(this.hubConnection, 'NewMessage');
    this.directMessageRecieved.subscribe((message: DirectMessage) => {
      this.messages.push(message);
    });
    this.chatVisibility = !this.chatVisibility;
    if (this.chatVisibility === true) {
      this.contactSelected = contact;
      this.newMessage.contactId = contact.id;
      this.newMessage.authorId = this.mainUser.id;
      this.newMessage.createdAt = new Date();
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
      this.hubConnection.invoke('JoinGroup', contact.id);
    }
  }

  onGroupClick(): void {
    this.chatVisibility = !this.chatVisibility;
  }
  sendMessage(): void {
    this.httpService
      .postRequest<DirectMessage, void>('/api/ContactChat/', this.newMessage)
      .subscribe((error) => console.log(error));
    this.newMessage.message = '';
  }
  isContactActive(contact): boolean {
    return this.contactSelected === contact;
  }
}
