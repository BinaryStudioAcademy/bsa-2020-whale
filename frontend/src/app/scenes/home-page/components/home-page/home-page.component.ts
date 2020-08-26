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
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Group } from '@shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { WhaleSignalService } from 'app/core/services/whale-signal.service';
import { UserOnline } from '@shared/models/user/user-online';
import { UpstateService } from 'app/core/services/upstate.service';
import { ContactService } from 'app/core/services';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { group } from 'console';

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
  contactChatVisibility = false;
  historyVisibility = false;
  groupChatVisibility = false;

  ownerEmail: string;
  contactSelected: Contact;
  groupSelected: Group;

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
    private groupService: GroupService,
    private upstateService: UpstateService,
    private whaleSignalrService: WhaleSignalService,
    private contactService: ContactService
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

                this.whaleSignalrService.receiveContact$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (contact) => {
                      this.contactAdd(contact);
                    },
                    (err) => {
                      console.log(err.message);
                    }
                  );

                this.whaleSignalrService.removeContact$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (contactId) => {
                      this.removeContact(contactId);
                    },
                    (err) => {
                      console.log(err.message);
                    }
                  );

                this.whaleSignalrService.receiveGroup$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (group) => {
                      this.toastr.success(
                        'You were added to ' + group.label + ' group'
                      );
                      this.addGroup(group);
                    },
                    (err) => {
                      console.log(err.message);
                    }
                  );

                this.whaleSignalrService.removeGroup$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (groupId) => {
                      this.removeGroup(groupId);
                    },
                    (err) => {
                      console.log(err.message);
                    }
                  );
                this.whaleSignalrService.removedFromGroup$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (groupId) => {
                      this.removeGroup(groupId);
                    },
                    (err) => {
                      console.log(err.message);
                    }
                  );
              },
              (error) => this.toastr.error(error.Message)
            );
        },
        (error) => this.toastr.error(error.Message)
      );
    this.groupService
      .getAllGroups()
      .pipe(tap(() => (this.isGroupsLoading = false)))
      .subscribe(
        (data: Group[]) => {
          this.groups = data;
          this.groupsVisibility = this.groups.length == 0 ? false : true;
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
          this.addGroup(group);
          this.toastr.success('Group created successfuly');
        }
      });
  }

  public leftGroup(group: Group): void {
    this.groups.splice(this.groups.indexOf(group), 1);
    if (!this.groups.length) {
      this.groupsVisibility = !this.groupsVisibility;
    }
  }

  deleteGroup(selectedGroup: Group): void {
    this.simpleModalService
      .addModal(ConfirmationModalComponent, {
        message: `Are you sure you want to delete ${selectedGroup.label}?`,
      })
      .subscribe((isConfirm) => {
        if (isConfirm) {
          this.groupService.deleteGroup(selectedGroup).subscribe(
            (response) => {
              if (response.status === 204) {
                this.toastr.success(
                  `${selectedGroup.label} deleted successfuly`
                );
                this.removeGroup(selectedGroup.id);
                if (!this.groups.length) {
                  this.groupsVisibility = !this.groupsVisibility;
                }
              }
            },
            (error) => this.toastr.error(error.Message)
          );
        }
      });
  }

  addNewContact(): void {
    this.simpleModalService
      .addModal(AddContactModalComponent)
      .subscribe((contact) => this.contactAdd(contact));
  }

  isContactActive(contact): boolean {
    return this.contactSelected === contact;
  }
  isGroupActive(group): boolean {
    return this.groupSelected === group;
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

  public falseAllBooleans(): void {
    this.contactChatVisibility = false;
    this.groupChatVisibility = false;
    this.actionsVisibility = false;
    this.historyVisibility = false;
  }

  contactVisibilityChange(event): void {
    this.contactChatVisibility = event;
    this.contactSelected = undefined;
    this.actionsVisibility = true;
  }
  groupVisibilityChange(event): void {
    this.groupChatVisibility = event;
    this.groupSelected = undefined;
    this.actionsVisibility = true;
  }

  onContactClick(contact: Contact): void {
    if (!contact.isAccepted) {
      this.simpleModalService
        .addModal(ConfirmationModalComponent, {
          message: 'Are you sure you want to cancel the request?',
        })
        .subscribe((isConfirm) => {
          if (isConfirm) {
            this.contactService
              .DeletePendingContact(contact.secondMember.email)
              .subscribe(
                (resp) => {
                  this.toastr.success('Canceled');
                },
                (error) => this.toastr.error(error.Message)
              );
          }
        });
      return;
    }
    this.falseAllBooleans();
    this.contactChatVisibility = true;
    this.groupSelected = undefined;
    this.contactSelected = contact;
  }

  onGroupClick(group: Group): void {
    this.falseAllBooleans();
    this.groupChatVisibility = true;
    this.contactSelected = undefined;
    this.groupSelected = group;
  }

  public closeHistory(): void {
    this.falseAllBooleans();
    this.historyVisibility = false;
    this.actionsVisibility = true;
  }

  public onMeetingHistoryClick(): void {
    this.contactChatVisibility = false;
    this.actionsVisibility = false;
    this.groupChatVisibility = false;
    this.contactSelected = undefined;
    this.groupSelected = undefined;
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

  contactAdd(contact: Contact): void {
    if (contact) {
      this.removeContact(contact.id);
      this.contacts.push(contact);
      this.contactsVisibility = true;
    }
  }
  removeContact(contactId: string): void {
    if (this.contactSelected?.id === contactId) {
      this.contactVisibilityChange(false);
    }
    this.contacts = this.contacts.filter((c) => c.id !== contactId);
    if (!this.contacts.length) {
      this.contactsVisibility = false;
    }
  }

  addGroup(group: Group): void {
    if (group) {
      this.removeContact(group.id);
      this.groups.push(group);
      this.groupsVisibility = true;
    }
  }
  removeGroup(groupId: string): void {
    if (this.groupSelected?.id === groupId) {
      this.groupChatVisibility = false;
      this.actionsVisibility = true;
    }
    this.groups = this.groups.filter((c) => c.id !== groupId);
    if (!this.groups.length) {
      this.groupsVisibility = false;
    }
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
  public isImageHere(group: Group): boolean {
    return (
      group.photoUrl !== null &&
      group.photoUrl !== undefined &&
      group.photoUrl !== ''
    );
  }
  updateGroup(event) {
    const updateItem = this.groups.find((x) => x.id === event.id);
    const index = this.groups.indexOf(updateItem);
    this.groups[index] = event;
  }
}
export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}
