import {
  Component,
  OnInit,
  EventEmitter,
  ViewChild,
  Output,
} from '@angular/core';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HttpService } from 'app/core/services/http.service';
import { HubConnection } from '@aspnet/signalr';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { ContactsChatComponent } from '../contacts-chat/contacts-chat.component';
import { ToastrService } from 'ngx-toastr';
import { UpstateService } from 'app/core/services/upstate.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit {
  private counterComponent: ContactsChatComponent;
  contacts: Contact[];
  loggedInUser: User;
  contactsVisibility = true;
  groupsVisibility = false;
  chatVisibility = true;
  private hubConnection: HubConnection;
  contactSelected: Contact;

  constructor(
    private toastr: ToastrService,
    private stateService: UpstateService,
    private signalRService: SignalRService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService
  ) {}

  ngOnInit(): void {
    this.stateService.getLoggeInUser().subscribe(
      (usr: User) => {
        this.loggedInUser = usr;
      },
      (error) => this.toastr.error(error)
    );
    this.httpService.getRequest<Contact[]>('/api/Contacts').subscribe(
      (data: Contact[]) => {
        this.contacts = data;
      },
      (error) => this.toastr.error(error)
    );
  }

  addNewGroup(): void {
    console.log('group clicked!');
  }
  addNewContact(): void {
    this.simpleModalService.addModal(AddContactModalComponent).subscribe(
      (contact) => console.log(contact),
      (error) => this.toastr.error(error)
    );
    this.stateService.getLoggeInUser().subscribe(
      (usr: User) => {
        console.log(usr);
      },
      (error) => this.toastr.error(error)
    );
  }
  onUserClick(contact: Contact): void {
    this.contactSelected = contact;
  }
  visibilityChange(event): void {
    this.chatVisibility = event;
  }

  onGroupClick(): void {
    this.chatVisibility = !this.chatVisibility;
  }
  isContactActive(contact): boolean {
    return this.contactSelected === contact;
  }
}
