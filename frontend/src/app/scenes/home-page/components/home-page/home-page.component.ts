import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { HttpService } from 'app/core/services/http.service';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { ToastrService } from 'ngx-toastr';
import { MeetingService } from 'app/core/services/meeting.service';
import { Router } from '@angular/router';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { BlobService } from '../../../../core/services/blob.service';
import { UpstateService } from '../../../../core/services/upstate.service';
import { environment } from '@env';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  contacts: Contact[];
  loggedInUser: User;
  contactsVisibility = false;
  groupsVisibility = false;
  chatVisibility = true;
  ownerEmail: string;
  contactSelected: Contact;
  private hubConnection: HubConnection;
  private receivedContact = new Subject<Contact>();
  public receivedContact$ = this.receivedContact.asObservable();

  public isContactsLoading = true;
  public isUserLoadig = true;
  public isMeetingLoading = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private toastr: ToastrService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService,
    private meetingService: MeetingService,
    private router: Router,
    private authService: AuthService,
    private blobService: BlobService,
    private upstateService: UpstateService,
    private signalRService: SignalRService,
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.upstateService
      .getLoggedInUser()
      .pipe(tap(() => (this.isUserLoadig = false)))
      .subscribe(
        (userFromDB: User) => {
          this.loggedInUser = userFromDB;
          this.ownerEmail = this.loggedInUser?.email;

          this.httpService
            .getRequest<Contact[]>('/api/contacts')
            .pipe(tap(() => (this.isContactsLoading = false)))
            .subscribe(
              (data: Contact[]) => {
                this.contacts = data;
                this.onContactsClick();
              },
              (error) => this.toastr.error(error.Message)
            );

          this.subscribeContacts();
        },
        (error) => this.toastr.error(error.Message)
      );
  }

  addNewGroup(): void {
    console.log('group clicked!');
  }
  addNewContact(): void {
    this.simpleModalService
      .addModal(AddContactModalComponent)
      .subscribe();
  }
  visibilityChange(event): void {
    this.chatVisibility = event;
    this.contactSelected = undefined;
  }
  onContactClick(contact: Contact): void {
    this.chatVisibility = false;
    this.contactSelected = contact;
  }

  onGroupClick(): void {
    this.chatVisibility = !this.chatVisibility;
  }
  isContactActive(contact): boolean {
    return this.contactSelected === contact;
  }
  createMeeting(): void {
    this.isMeetingLoading = true;
    this.meetingService
      .createMeeting({
        settings: '',
        startTime: new Date(),
        anonymousCount: 0,
        isScheduled: false,
        isRecurrent: false,
        creatorEmail: this.ownerEmail,
      } as MeetingCreate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          const meetingLink = resp.body;
          this.router.navigate([
            '/meeting-page',
            `?id=${meetingLink.id}&pwd=${meetingLink.password}`,
          ]);
        },
        (error) => console.log(error.message)
      );
  }
  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
  returnCorrectLink(contact: Contact): string {
    return contact?.secondMember.avatarUrl.startsWith('http') ||
      contact?.secondMember.avatarUrl.startsWith('data')
      ? contact?.secondMember.avatarUrl
      : '';
  }

  subscribeContacts(): void {
    from(this.signalRService.registerHub(environment.signalrUrl, 'contactsHub'))
      .pipe(
        tap((hub) => {
          this.hubConnection = hub;
        })
      )
      .subscribe(() => {
        this.hubConnection.on(
          'onNewContact',
          (contact: Contact) => {
            this.receivedContact.next(contact);
          }
        );
        console.log(this.loggedInUser.email);
        this.hubConnection.invoke('onConect', this.loggedInUser.email);
      });
    this.receivedContact$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (contact) => {
        this.contacts.push(contact);
        console.log('received a contact ', contact);
      },
      (err) => {
        console.log(err.message);
      }
    );
  }

  public onContactsClick(): void {
    if (this.contacts.length) {
      this.contactsVisibility = !this.contactsVisibility;
    }
  }
}
export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}
