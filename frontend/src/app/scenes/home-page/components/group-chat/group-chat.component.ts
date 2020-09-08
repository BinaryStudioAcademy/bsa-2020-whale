import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  AfterContentInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  ViewChildren,
  QueryList,
  HostListener,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GroupMessage } from '@shared/models/message/group-message';
import { User } from '@shared/models/user/user';
import { HttpService } from 'app/core/services/http.service';
import { HubConnection } from '@aspnet/signalr';
import { Subject, ReplaySubject } from 'rxjs';
import { takeUntil, take, first } from 'rxjs/operators';
import { HttpResponse, HttpParams } from '@angular/common/http';
import { SimpleModalService } from 'ngx-simple-modal';
import { Group } from '@shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { GroupUser } from '@shared/models/group/groupuser';
import { AddUserToGroupModalComponent } from '../add-user-to-group-modal/add-user-to-group-modal.component';
import { UpstateService } from 'app/core/services/upstate.service';
import { GroupCallModalComponent } from '../group-call-modal/group-call-modal.component';
import { HomePageComponent } from '../home-page/home-page.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { WhaleSignalMethods, WhaleSignalService } from 'app/core/services';
import { BlobService } from 'app/core/services/blob.service';
import { EditGroupInfoModalComponent } from '../edit-group-info-modal/edit-group-info-modal.component';
import {
  UpdateGroupImageModalComponent,
  UpdateGroupImageModal,
} from '../update-group-image-modal/update-group-image-modal.component';
import { UnreadGroupMessage } from '@shared/models';
import { MessageService } from 'app/core/services/message.service';
import { ReadAndUnreadGroupMessages } from '@shared/models/message/read-and-unread-group-messages';
import { GroupMembersVisibilityService } from 'app/core/services/group-members-visibility.service';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.sass'],
})
export class GroupChatComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit, AfterViewChecked {
  private hubConnection: HubConnection;
  counter = 0;
  private receivedMessages = new ReplaySubject<void>();
  public receivedMessages$ = this.receivedMessages.asObservable();

  private unsubscribe$ = new Subject<void>();
  @Input() groupSelected: Group;
  @Input() loggedInUser: User;
  @Output() chat: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() groupUpdated: EventEmitter<Group> = new EventEmitter<Group>();
  @ViewChildren('chatWindow') chatBlock: QueryList<ElementRef<HTMLElement>>;

  @Output() messageRead = new EventEmitter<string>();

  @ViewChildren('intersectionElement') intersectionElements: QueryList<
    ElementRef<HTMLDivElement>
  >;

  @ViewChild('groupMembersButton') groupMembersButton: ElementRef;

  public intersectionObserver: IntersectionObserver;
  chatElement: any;
  groupMessageRecieved = new EventEmitter<GroupMessage>();
  messages: GroupMessage[] = [];
  unreadMessages: GroupMessage[] = [];

  newUserInGroup: GroupUser = {
    userEmail: '',
    groupId: this.groupSelected?.id,
  };
  groupMembers: User[] = [];
  isMessagesLoading = true;

  newMessage: GroupMessage = {
    groupId: '',
    message: '',
    authorId: '',
    createdAt: new Date(),
    attachment: false,
  };
  constructor(
    private whaleSignalrService: WhaleSignalService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private simpleModalService: SimpleModalService,
    private groupService: GroupService,
    private upstateSevice: UpstateService,
    private homePageComponent: HomePageComponent,
    private blobService: BlobService,
    private messageService: MessageService,
    public groupMembersVisibility: GroupMembersVisibilityService,
  ) {}

  ngAfterViewInit(): void {
    this.chatElement = this.chatBlock.first.nativeElement;
    this.intersectionElements.changes.pipe(first()).subscribe(() => {
      this.receivedMessages$.subscribe(() => {
        this.registerIntersectionObserve();
        if (this.unreadMessages.length === 0) {
          this.scrollDown();
        } else {
          const firstUnread = this.intersectionElements.find(
            (el) => el.nativeElement.id === this.unreadMessages[0].id
          );
          firstUnread.nativeElement.scrollIntoView();
        }
      });
    });
  }

  ngAfterViewChecked(): void {
    this.scrollDown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.groupMembersVisibility.isMembersVisible = false;
    this.httpService
      .getRequest<ReadAndUnreadGroupMessages>(
        '/GroupChat/withUnread/' + this.groupSelected.id,
        new HttpParams().set('userId', this.loggedInUser.id)
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ReadAndUnreadGroupMessages) => {
        this.messages = data.readMessages.concat(data.unreadMessages);
        this.unreadMessages = data.unreadMessages;
        this.receivedMessages.next();
        this.isMessagesLoading = false;
      });
    this.groupService
      .getAllGroupUsers(this.groupSelected.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (users) => {
          this.groupMembers = users;
        },
        (err) => {
          this.toastr.error(err.Message);
        }
      );
  }

  ngOnInit(): void {
    this.messageService.receivedGroupMessage$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (newMessage) => {
          if (
            newMessage.groupId !== this.groupSelected.id ||
            newMessage.authorId === this.loggedInUser.id
          ) {
            return;
          }

          this.messages.push(newMessage);
          this.intersectionElements.changes.pipe(first()).subscribe(() => {
            this.intersectionObserver.observe(
              this.intersectionElements.last.nativeElement
            );
            this.unreadMessages.push(newMessage);
            const firstUnread = this.intersectionElements.find(
              (el) => el.nativeElement.id === this.unreadMessages[0].id
            );
            firstUnread.nativeElement.scrollIntoView();
          });
        },
        (err) => {
          this.toastr.error(err.Message);
        }
      );
    this.whaleSignalrService.updatedGroup$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((group) => {
        this.groupSelected = group;
      });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  @HostListener('document:click', ['$event.target'])
  public onClickOutsidePopup(targetElement: ElementRef): void {
    if (targetElement !== this.groupMembersButton?.nativeElement) {
      this.groupMembersVisibility.isMembersVisible = false;
    }
  }

  public showGroupMembers(): void {
    this.groupMembersVisibility.isMembersVisible = !this.groupMembersVisibility.isMembersVisible;
  }

  scrollDown(): void {
    const chatHtml = this.chatElement as HTMLElement;
    const isScrolledToBottom =
      chatHtml.scrollHeight - chatHtml.clientHeight > chatHtml.scrollTop;

    if (isScrolledToBottom) {
      chatHtml.scrollTop = chatHtml.scrollHeight - chatHtml.clientHeight;
    }
  }

  sendMessage(): void {
    if (this.newMessage.message.trim().length === 0) {
      return;
    }

    const newMessage: GroupMessage = {
      groupId: this.groupSelected.id,
      authorId: this.loggedInUser.id,
      createdAt: new Date(),
      message: this.newMessage.message,
      attachment: false,
      author: this.loggedInUser,
    };

    this.newMessage.message = '';
    this.messages.push(newMessage);
    this.chatBlock.changes.pipe(first()).subscribe(() => {
      this.scrollDown();
    });

    this.httpService
      .postRequest<GroupMessage, HttpResponse<GroupMessage>>(
        '/GroupChat/',
        newMessage
      )
      .pipe(take(1))
      .subscribe(
        () => {},
        (error) => this.toastr.error(error.Message)
      );
  }
  close(): void {
    this.chat.emit(false);
  }

  public changeImage(): void {
    if (this.groupSelected.creatorEmail === this.loggedInUser.email) {
      this.simpleModalService.addModal(UpdateGroupImageModalComponent, {
        group: this.groupSelected,
      });
    }
  }

  public call(): void {
    this.simpleModalService.addModal(
      GroupCallModalComponent,
      this.groupSelected
    );
  }

  public leaveGroup(): void {
    if (this.groupSelected.creatorEmail === this.loggedInUser.email) {
      this.toastr.error(
        'You cannot leave the group because you are administrator. Please, assign someone else to this role.'
      );
    } else {
      this.simpleModalService
        .addModal(ConfirmationModalComponent, {
          message: `Are you sure you want to leave ${this.groupSelected.label}?`,
        })
        .subscribe((isConfirm) => {
          if (isConfirm) {
            this.groupService
              .leaveGroup(this.groupSelected.id, this.loggedInUser.email)
              .subscribe(
                () => {
                  this.toastr.success(
                    `You successfully left ${this.groupSelected.label}`
                  );
                },
                (error) => this.toastr.error(error.Message)
              );

            this.hubConnection?.invoke('LeaveGroup', this.groupSelected.id);
            this.close();
            this.homePageComponent.leftGroup(this.groupSelected);
          }
        });
    }
  }

  public onEnterKeyPress(event: KeyboardEvent, valid: boolean): void {
    event.preventDefault();
    if (valid) {
      this.sendMessage();
    }
  }
  addNewMember(): void {
    this.simpleModalService
      .addModal(AddUserToGroupModalComponent, {
        id: this.groupSelected.id,
        label: this.groupSelected.label,
        description: this.groupSelected.description,
        participantsEmails: this.groupMembers.map((u) => u.email),
      })
      .subscribe((user) => {
        if (user !== undefined) {
          Array.prototype.push.apply(this.groupMembers, user);
          this.toastr.success('User added successfully');
        }
      });
  }
  public deleteUserFromGroup(user: User): void {
    this.simpleModalService
      .addModal(ConfirmationModalComponent, {
        message: `Are you sure want to delete ${user.firstName ? user.firstName : ''}  ${user.secondName ? user.secondName : ''} from the group ${this.groupSelected.label}?`,
      })
      .subscribe((t) => {
        if (t) {
          this.groupService
            .leaveGroup(this.groupSelected.id, user.email)
            .subscribe(
              () => {
                this.removeUser(user.id);
                this.toastr.info(
                  `You successfully deleted ${user.firstName ? user.firstName : ''} ${user.secondName ? user.secondName : ''} from the group "${this.groupSelected.label}"`
                );
                this.whaleSignalrService.invoke(
                  WhaleSignalMethods.OnRemovedFromGroup,
                  { groupId: this.groupSelected.id, userEmail: user.email }
                );
              },
              (error) => this.toastr.error(error.Message)
            );
        }
      });
  }
  removeUser(userId: string): void {
    this.groupMembers = this.groupMembers.filter((c) => c.id !== userId);
  }
  returnCorrectLink(user: User): string {
    return user?.avatarUrl.startsWith('http') ||
      user?.avatarUrl.startsWith('data')
      ? user?.avatarUrl
      : '';
  }
  public splitMessage(message: string): string[] {
    return message.split(/\n/gi);
  }

  public isImageHere(): boolean {
    return (
      this.groupSelected.photoUrl !== null &&
      this.groupSelected.photoUrl !== undefined &&
      this.groupSelected.photoUrl !== ''
    );
  }

  public editGroupInfo(): void {
    this.simpleModalService
      .addModal(EditGroupInfoModalComponent, this.groupSelected)
      .subscribe(
        (group) => {
          if (group !== undefined) {
            this.groupSelected = group;
            this.whaleSignalrService.invoke(
              WhaleSignalMethods.OnGroupUpdate,
              this.groupSelected
            );
          }
        },
        (error) => this.toastr.error(error)
      );
  }

  public registerIntersectionObserve(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.0,
    };

    this.intersectionObserver = new IntersectionObserver(
      this.onIntersection.bind(this),
      options
    );

    this.unreadMessages.forEach((message) => {
      const element = this.intersectionElements.find(
        (el) => el.nativeElement.id === message.id
      );
      this.intersectionObserver.observe(element.nativeElement);
    });
  }

  public onIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.intersectionObserver.unobserve(entry.target);
        this.unreadMessages.splice(
          this.unreadMessages.findIndex((um) => um.id === entry.target.id),
          1
        );
        this.groupSelected.unreadMessageCount -= 1;
        this.sendMarkReadRequest(entry.target.id, this.loggedInUser.id);
      }
    });
  }

  public sendMarkReadRequest(msgId: string, userId: string): void {
    const unreadMessageId: UnreadGroupMessage = {
      messageId: msgId,
      receiverId: userId,
      groupId: this.groupSelected.id,
    };
    this.httpService
      .postRequest('/GroupChat/markRead', unreadMessageId)
      .subscribe(() => {
        this.messageRead.emit(msgId);
      });
  }
}
