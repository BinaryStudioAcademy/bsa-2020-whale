import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { takeUntil, tap, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Group } from '@shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { WhaleSignalService } from 'app/core/services/whale-signal.service';
import { UserOnline } from '@shared/models/user/user-online';
import { UpstateService } from 'app/core/services/upstate.service';
import { ContactService } from 'app/core/services';
import { MessageService } from 'app/core/services/message.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MeetingSettingsService } from '../../../../core/services/meeting-settings.service';
import { CurrentChatService } from 'app/core/services/currentChat.service';
import {PushNotificationsService} from '../../../../core/services/push-notification.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  @ViewChild(PageHeaderComponent, { static: false })
  pageHeader: PageHeaderComponent;

  contacts: Contact[];
  groups: Group[];
  loggedInUser: User;
  actionsVisibility = true;
  contactsVisibility = false;
  groupsVisibility = false;
  contactChatVisibility = false;
  historyVisibility = false;
  upcomingVisibility = false;
  groupChatVisibility = false;
  statisticsVisibility = false;

  ownerEmail: string;
  contactSelected: Contact;
  groupSelected: Group;

  public isContactsLoading = true;
  public isUserLoadig = true;
  public isMeetingLoading = false;
  public isGroupsLoading = true;
  public isChatHubLoading = true;

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
    private contactService: ContactService,
    private messageService: MessageService,
    private meetingSettingsService: MeetingSettingsService,
    private currentChat: CurrentChatService,
    private pushNotificationService: PushNotificationsService
  ) {
    this.pushNotificationService.requestPermission();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.contacts.forEach((contact) => {
      this.messageService.leaveGroup(contact.id);
    });
  }

  ngOnInit(): void {
    this.openCurrentChat();

    this.upstateService
      .getLoggedInUser()
      .pipe(tap(() => (this.isUserLoadig = false)))
      .subscribe(
        (userFromDB: User) => {
          this.loggedInUser = userFromDB;
          this.ownerEmail = this.loggedInUser?.email;

          this.httpService
            .getRequest<Contact[]>('/contacts')
            .pipe(tap(() => (this.isContactsLoading = false)))
            .subscribe(
              (data: Contact[]) => {
                this.contacts = data;

                this.messageService.registerHub().subscribe(
                  () => {
                    data.forEach((contact) => {
                      this.messageService.joinGroup(contact.id);
                    });

                    this.isChatHubLoading = false;

                    this.messageService.receivedMessage$
                      .pipe(takeUntil(this.unsubscribe$))
                      .subscribe((newMessage) => {
                        if (this.loggedInUser.id === newMessage.authorId) {
                          return;
                        }
                        const contact = this.contacts.find(
                          (messageContact) =>
                            messageContact.id === newMessage.contact.id
                        );
                        contact.unreadMessageCount += 1;
                      });

                    this.groupService
                      .getAllGroups()
                      .pipe(tap(() => (this.isGroupsLoading = false)))
                      .subscribe(
                        (groups: Group[]) => {
                          this.groups = groups;
                          this.groupsVisibility =
                            this.groups.length === 0 ? false : true;
                          groups.forEach((groupElemnt) => {
                            this.messageService.joinGroup(groupElemnt.id);
                          });
                          this.isChatHubLoading = false;
                          this.messageService.receivedGroupMessage$
                            .pipe(takeUntil(this.unsubscribe$))
                            .subscribe((newMessage) => {
                              if (
                                this.loggedInUser.id === newMessage.authorId
                              ) {
                                return;
                              }
                              const groupOfMessage = this.groups.find(
                                (messageGroup) =>
                                  messageGroup.id === newMessage.group.id
                              );
                              groupOfMessage.unreadMessageCount += 1;
                            });
                        },
                        (error) => {
                          this.toastr.error(error.Message);
                        }
                      );
                  },
                  (error) => {
                    this.isChatHubLoading = false;
                  }
                );

                this.onContactsClick();

                this.whaleSignalrService.signalUserConected$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (onlineUser) => {
                      this.userConnected(onlineUser);
                    },
                    (err) => {
                      this.toastr.error(err.Message);
                    }
                  );

                this.whaleSignalrService.signalUserUpdated$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    (onlineUser) => {
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
                  .subscribe((contact) => {
                    this.contactAdd(contact);
                    this.messageService.joinGroup(contact.id);
                  });

                this.whaleSignalrService.removeContact$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((contactId) => {
                    this.removeContact(contactId);
                  });

                this.whaleSignalrService.receiveGroup$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((newGroup) => {
                    this.toastr.success(
                      'You were added to ' + newGroup.label + ' group'
                    );
                    this.addGroup(newGroup);
                  });

                this.whaleSignalrService.removeGroup$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((groupId) => {
                    this.removeGroup(groupId);
                  });
                this.whaleSignalrService.removedFromGroup$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((groupId) => {
                    this.removeGroup(groupId);
                  });

                this.whaleSignalrService.updatedGroup$
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((updatedGroup) => {
                    this.updateGroup(updatedGroup);
                  });
              },
              (error) => {
                this.toastr.error(error.Message);
              }
            );
        },
        (error) => {
          this.toastr.error(error.Message);
        }
      );
  }
  userConnected(onlineUser: UserOnline): void {
    const index = this.contacts.findIndex(
      (c) => c.secondMember?.id === onlineUser?.id
    );
    if (index >= 0) {
      this.contacts[index].secondMember.connectionId = onlineUser.connectionId;
      this.contacts[index].secondMember.isSpeaking = onlineUser.isSpeaking;
    }
  }

  userDisconnected(userEmail: string): void {
    const index = this.contacts.findIndex(
      (c) => c.secondMember?.email === userEmail
    );
    if (index >= 0) {
      this.contacts[index].secondMember.connectionId = null;
      this.contacts[index].secondMember.isSpeaking = false;
    }
  }

  userDisconnectedError(userId: string): void {
    const index = this.contacts.findIndex((c) => c.secondMember?.id === userId);
    if (index >= 0) {
      this.contacts[index].secondMember.connectionId = null;
      this.contacts[index].secondMember.isSpeaking = false;
    }
  }

  addNewGroup(): void {
    this.simpleModalService
      .addModal(AddGroupModalComponent)
      .subscribe((newGroup) => {
        if (newGroup !== undefined) {
          this.addGroup(newGroup);
          this.toastr.success('Group created successfully');
        }
      });
  }

  async openCurrentChat(): Promise<void> {
    await new Promise((r) => setTimeout(r, 2000));

    if (this.currentChat.currentChatId !== undefined) {
      this.onOpenChat(this.currentChat.currentChatId);
    } else if (this.currentChat.currentGroupChatId !== undefined) {
      this.onOpenGroupChat(this.currentChat.currentGroupChatId);
    }

    this.currentChat.currentChatId = undefined;
    this.currentChat.currentGroupChatId = undefined;
  }

  public leftGroup(leftGroup: Group): void {
    this.groups.splice(this.groups.indexOf(leftGroup), 1);
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
                this.toastr.info(
                  `${selectedGroup.label} deleted successfully`
                );
                this.removeGroup(selectedGroup.id);
                if (!this.groups.length) {
                  this.groupsVisibility = !this.groupsVisibility;
                }
              }
            },
            (error) => {
              this.toastr.error(error.Message);
            }
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
  isGroupActive(activeGroup): boolean {
    return this.groupSelected === activeGroup;
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
        isAudioAllowed: !this.meetingSettingsService.getSettings()
          .isAudioDisabled,
        isVideoAllowed: !this.meetingSettingsService.getSettings()
          .isVideoDisabled,
        isWhiteboard: this.meetingSettingsService.getSettings().isWhiteboard,
        isAllowedToChooseRoom: this.meetingSettingsService.getSettings().isAllowedToChooseRoom,
        isPoll: this.meetingSettingsService.getSettings().isPoll,
        creatorEmail: this.ownerEmail,
        participantsEmails: [],
      } as MeetingCreate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((resp) => {
        const meetingLink = resp.body;
        this.router.navigate([
          '/meeting-page',
          `?id=${meetingLink.id}&pwd=${meetingLink.password}`,
        ]);
      });
  }

  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }

  public falseAllBooleans(): void {
    this.contactChatVisibility = false;
    this.groupChatVisibility = false;
    this.actionsVisibility = false;
    this.historyVisibility = false;
    this.upcomingVisibility = false;
    this.statisticsVisibility = false;
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
                () => {
                  this.toastr.success('Canceled');
                },
                (error) => {
                  this.toastr.error(error.Message);
                }
              );
          }
        });
      return;
    }

    if (contact === this.contactSelected) {
      return;
    }

    this.falseAllBooleans();
    this.groupSelected = undefined;
    this.contactSelected = contact;
    setTimeout(() => {
      this.contactChatVisibility = true;
    }, 1);
  }

  onGroupClick(selectedGroup: Group): void {
    if (selectedGroup === this.groupSelected) {
      return;
    }
    this.falseAllBooleans();
    this.groupChatVisibility = true;
    this.contactSelected = undefined;
    this.groupSelected = selectedGroup;
    setTimeout(() => {
      this.groupChatVisibility = true;
    }, 1);
  }

  public closeHistory(): void {
    this.falseAllBooleans();
    this.historyVisibility = false;
    this.actionsVisibility = true;
  }

  public closeUpcoming(): void {
    this.falseAllBooleans();
    this.upcomingVisibility = false;
    this.actionsVisibility = true;
  }

  public closeStatistics(): void {
    this.statisticsVisibility = false;
    this.actionsVisibility = true;
  }

  public onMeetingHistoryClick(): void {
    if (!this.historyVisibility){
    this.contactChatVisibility = false;
    this.actionsVisibility = false;
    this.groupChatVisibility = false;
    this.upcomingVisibility = false;
    this.statisticsVisibility = false;
    this.contactSelected = undefined;
    this.groupSelected = undefined;
    this.historyVisibility = !this.historyVisibility;
    if (!this.historyVisibility) {
      this.actionsVisibility = true;
    }
  }
  }

  public onUpcomingMeetingsClick(): void {
    this.contactChatVisibility = false;
    this.actionsVisibility = false;
    this.groupChatVisibility = false;
    this.historyVisibility = false;
    this.statisticsVisibility = false;
    this.contactSelected = undefined;
    this.groupSelected = undefined;
    this.upcomingVisibility = !this.upcomingVisibility;

    if (!this.upcomingVisibility) {
      this.actionsVisibility = true;
    }
  }

  public onStatisticsClick(): void {
    this.contactChatVisibility = false;
    this.actionsVisibility = false;
    this.groupChatVisibility = false;
    this.historyVisibility = false;
    this.upcomingVisibility = false;
    this.contactSelected = undefined;
    this.groupSelected = undefined;
    this.statisticsVisibility = !this.statisticsVisibility;

    if (!this.statisticsVisibility) {
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

  addGroup(newGroup: Group): void {
    if (newGroup) {
      this.removeContact(newGroup.id);
      this.groups.push(newGroup);
      this.messageService.joinGroup(newGroup.id);
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
    if (this.contacts.length) {
      this.contactsVisibility = !this.contactsVisibility;
    }
  }
  public onGroupsClick(): void {
    if (this.groups.length) {
      this.groupsVisibility = !this.groupsVisibility;
    }
  }
  public isImageHere(currentGroup: Group): boolean {
    return (
      currentGroup.photoUrl !== null &&
      currentGroup.photoUrl !== undefined &&
      currentGroup.photoUrl !== ''
    );
  }
  public updateGroup(updatedGroup: Group): void {
    const updateItem = this.groups.find((x) => x.id === updatedGroup.id);
    const index = this.groups.indexOf(updateItem);
    this.groups[index] = updatedGroup;
  }

  public onOpenChat(id: string): void {
    const contact = this.contacts.find((c) => (c.id === id));
    this.onContactClick(contact);
  }
  public onOpenGroupChat(id: string): void {
    const groupa = this.groups.find((g) => g.id === id);
    this.onGroupClick(groupa);
  }
  public renderClass(array: any[]): string {
    switch (array?.length){
      case 0:
        return '';
      case 1:
        return 'one-height';
      case 2:
        return 'two-height';
      default:
        return 'three-height';
    }
  }
}
export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}
