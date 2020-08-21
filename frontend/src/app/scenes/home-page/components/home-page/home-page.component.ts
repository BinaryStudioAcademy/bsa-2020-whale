import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { HttpService } from 'app/core/services/http.service';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { AddGroupModalComponent } from '../add-group-modal/add-group-modal.component';
import { ContactsChatComponent } from '../contacts-chat/contacts-chat.component';
import { ToastrService } from 'ngx-toastr';
import { MeetingService } from 'app/core/services/meeting.service';
import { Router } from '@angular/router';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { BlobService } from '../../../../core/services/blob.service';
import { Group } from '@shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { environment } from '@env';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HubConnection } from '@aspnet/signalr';
import { WhaleSignalService } from 'app/core/services/whale-signal.service';
import { UserOnline } from '@shared/models/user/user-online';
import { UpstateService } from 'app/core/services/upstate.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  contacts: Contact[];
  groups: Group[];
  loggedInUser: User;
  actionsVisibility = true;
  contactsVisibility = false;
  groupsVisibility = false;
  chatVisibility = false;
  historyVisibility = false;

  ownerEmail: string;
  contactSelected: Contact;
  private hubConnection: HubConnection;
  private receivedContact = new Subject<Contact>();
  public receivedContact$ = this.receivedContact.asObservable();

  public isContactsLoading = true;
  public isUserLoadig = true;
  public isMeetingLoading = false;
  public isGroupsLoading = true;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private toastr: ToastrService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService,
    private meetingService: MeetingService,
    private router: Router,
    private authService: AuthService,
    private groupService: GroupService,
    private blobService: BlobService,
    private upstateService: UpstateService,
    private signalRService: SignalRService,
    private whaleSignalrService: WhaleSignalService
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

                this.whaleSignalrService.signalUserConected$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (onlineUser) => {
                      console.log('whalesignalr user connected:', onlineUser);
                      this.userConnected(onlineUser);
                    },
                    (err) => {
                      this.toastr.error(err.Message);
                    }
                  );

                this.whaleSignalrService.signalUserDisconected$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (userEmail) => {
                      this.userDisconnected(userEmail);
                    },
                    (err) => {
                      this.toastr.error(err.Message);
                    }
                  );

                this.whaleSignalrService.signalUserDisconectedError$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (userId) => {
                      this.userDisconnectedError(userId);
                    },
                    (err) => {
                      this.toastr.error(err.Message);
                    }
                  );
              },
              (error) => this.toastr.error(error.Message)
            );

          this.subscribeContacts();
        },
        (error) => this.toastr.error(error.Message)
      );
    this.groupService
      .getAllGroups()
      .pipe(tap(() => (this.isGroupsLoading = false)))
      .subscribe(
        (data: Group[]) => {
          this.groups = data;
        },
        (error) => this.toastr.error(error.Message)
      );
  }
  userConnected(onlineUser: UserOnline): void {
    const index = this.contacts.findIndex(
      (c) => c.secondMember?.id === onlineUser.id
    );
    if (index >= 0) {
      this.contacts[index].secondMember.connectionId = onlineUser.connectionId;
    }
  }

  userDisconnected(userEmail: string): void {
    const index = this.contacts.findIndex(
      (c) => c.secondMember?.email === userEmail
    );
    if (index >= 0) {
      this.contacts[index].secondMember.connectionId = null;
    }
  }

  userDisconnectedError(userId: string): void {
    const index = this.contacts.findIndex((c) => c.secondMember?.id === userId);
    if (index >= 0) {
      this.contacts[index].secondMember.connectionId = null;
    }
  }

  addNewGroup(): void {
    this.simpleModalService
      .addModal(AddGroupModalComponent)
      .subscribe((group) => {
        if (group !== undefined) {
          this.groups.push(group);
          this.toastr.success('Group created successfuly');
        }
      });
  }

  deleteGroup(group: Group): void {
    if (
      confirm('Are you sure want to delete the group ' + group.label + ' ?')
    ) {
      this.groupService.deleteGroup(group).subscribe(
        (response) => {
          if (response.status === 204) {
            this.toastr.success(`${group.label} deleted successfuly`);
            this.groups.splice(this.groups.indexOf(group), 1);
            if (!this.groups.length) {
              this.groupsVisibility = !this.groupsVisibility;
            }
          }
        },
        (error) => this.toastr.error(error.Message)
      );
    }
  }

  addNewContact(): void {
    this.simpleModalService.addModal(AddContactModalComponent).subscribe();
  }

  onGroupClick(group: Group): void {}

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

  public falseAllBooleans() {
    this.chatVisibility = false;
    this.groupsVisibility = false;
    this.contactsVisibility = false;
    this.actionsVisibility = false;
    this.historyVisibility = false;
  }

  visibilityChange(event): void {
    this.chatVisibility = event;
    this.contactSelected = undefined;
    this.actionsVisibility = true;
  }

  onContactClick(contact: Contact): void {
    //this.falseAllBooleans();
    this.actionsVisibility = false;
    this.historyVisibility = false;
    this.chatVisibility = true;
    this.contactSelected = contact;
  }

  public closeHistory() {
    this.falseAllBooleans();
    this.historyVisibility = false;
    this.actionsVisibility = true;
  }

  public onMeetingHistoryClick() {
    this.chatVisibility = false;
    this.actionsVisibility = false;

    this.historyVisibility = !this.historyVisibility;

    if (!this.historyVisibility) {
      this.actionsVisibility = true;
    }
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
        this.hubConnection.on('onNewContact', (contact: Contact) => {
          this.receivedContact.next(contact);
        });
        this.hubConnection.invoke('onConect', this.loggedInUser.email);
      });
    this.receivedContact$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (contact) => {
        this.contacts.push(contact);
        this.contactsVisibility = true;
      },
      (err) => {
        console.log(err.message);
      }
    );
  }

  public onContactsClick(): void {
    console.log('open/close');
    if (this.contacts.length) {
      this.contactsVisibility = !this.contactsVisibility;
    }
  }
  public onGroupsClick(): void {
    if (this.groups.length) {
      this.groupsVisibility = !this.groupsVisibility;
    }
  }
}
export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}
