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
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GroupMessage } from '@shared/models/message/group-message';
import { User } from '@shared/models/user/user';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HttpService } from 'app/core/services/http.service';
import { environment } from '@env';
import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subject, from, Observable } from 'rxjs';
import { tap, takeUntil, take } from 'rxjs/operators';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Console } from 'console';
import { stringify } from 'querystring';
import { HttpResponse } from '@angular/common/http';
import { SimpleModalService } from 'ngx-simple-modal';
import { Group } from '@shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { GroupUser } from '@shared/models/group/groupuser';
import { AddUserToGroupModalComponent } from '../add-user-to-group-modal/add-user-to-group-modal.component';
import { UpstateService } from 'app/core/services/upstate.service';
import { AuthService } from 'app/core/auth/auth.service';
import { GroupCallModalComponent } from '../group-call-modal/group-call-modal.component';
import { HomePageComponent } from '../home-page/home-page.component';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { WhaleSignalMethods, WhaleSignalService } from 'app/core/services';
import { BlobService } from 'app/core/services/blob.service';
import {
  UpdateGroupImageModalComponent,
  UpdateGroupImageModal,
} from '../update-group-image-modal/update-group-image-modal.component';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.sass'],
})
export class GroupChatComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit, AfterViewChecked {
  private hubConnection: HubConnection;
  counter = 0;
  private receivedMsg = new Subject<GroupMessage>();
  public receivedMsg$ = this.receivedMsg.asObservable();

  private unsubscribe$ = new Subject<void>();
  @Input() groupSelected: Group;
  @Input() loggedInUser: User;
  @Output() chat: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('chatWindow', { static: false }) chatBlock: ElementRef<
    HTMLElement
  >;
  chatElement: any;
  newUserInGroup: GroupUser = {
    userEmail: '',
    groupId: this.groupSelected?.id,
  };
  groupMembers: User[] = [];
  currentUser: User;
  isMessagesLoading = true;
  isMembersVisible = false;
  groupMessageRecieved = new EventEmitter<GroupMessage>();
  messages: GroupMessage[] = [];
  newMessage: GroupMessage = {
    groupId: '',
    message: '',
    authorId: '',
    createdAt: new Date(),
    attachment: false,
  };
  constructor(
    private signalRService: SignalRService,
    private whaleSignalrService: WhaleSignalService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private simpleModalService: SimpleModalService,
    private groupService: GroupService,
    private upstateSevice: UpstateService,
    private homePageComponent: HomePageComponent,
    private blobService: BlobService
  ) {}

  ngAfterViewInit(): void {
    this.chatElement = this.chatBlock.nativeElement;
  }

  ngAfterViewChecked(): void {
    this.scrollDown();
  }

  scrollDown(): void {
    const chatHtml = this.chatElement as HTMLElement;
    const isScrolledToBottom =
      chatHtml.scrollHeight - chatHtml.clientHeight > chatHtml.scrollTop;

    if (isScrolledToBottom)
      chatHtml.scrollTop = chatHtml.scrollHeight - chatHtml.clientHeight;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isMembersVisible = false;
    this.upstateSevice
      .getLoggedInUser()
      .pipe(tap())
      .subscribe((userFromDB: User) => {
        this.currentUser = userFromDB;
      });
    this.httpService
      .getRequest<GroupMessage[]>('/api/GroupChat/' + this.groupSelected.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: GroupMessage[]) => {
          this.messages = data;
          this.isMessagesLoading = false;
        },
        (error) => console.log(error)
      );
    this.hubConnection?.invoke('JoinGroup', this.groupSelected.id);
    this.groupService
      .getAllGroupUsers(this.groupSelected.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (users) => {
          this.groupMembers = users;
        },
        (err) => {
          console.log(err.message);
          this.toastr.error(err.Message);
        }
      );
  }
  ngOnInit(): void {
    from(this.signalRService.registerHub(environment.signalrUrl, 'chatHub'))
      .pipe(
        tap((hub) => {
          this.hubConnection = hub;
        })
      )
      .subscribe(() => {
        this.hubConnection.on(
          'NewGroupMessageReceived',
          (message: GroupMessage) => {
            this.receivedMsg.next(message);
          }
        );
        this.hubConnection.invoke('JoinGroup', this.groupSelected.id);
      });
    this.receivedMsg$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (newMessage) => {
        this.messages.push(newMessage);
        console.log('received a messsage ', newMessage);
      },
      (err) => {
        console.log(err.message);
        this.toastr.error(err.Message);
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  sendMessage(): void {
    console.log('Send is called');
    this.newMessage.groupId = this.groupSelected.id;
    this.newMessage.authorId = this.currentUser.id;
    this.newMessage.createdAt = new Date();
    console.log(this.newMessage);
    this.httpService
      .postRequest<GroupMessage, HttpResponse<GroupMessage>>(
        '/api/GroupChat/',
        this.newMessage
      )
      .pipe(take(1))
      .subscribe(
        (response) => {
          console.log(response.body);
          this.newMessage.message = '';
        },
        (error) => this.toastr.error(error.Message)
      );
  }
  close(): void {
    this.chat.emit(false);
    this.hubConnection.invoke('Disconnect', this.groupSelected.id);
  }

  public changeImage(): void {
    this.simpleModalService.addModal(UpdateGroupImageModalComponent, {
      group: this.groupSelected,
    });
  }

  public call(): void {
    console.log(this.groupSelected);
    this.simpleModalService.addModal(
      GroupCallModalComponent,
      this.groupSelected
    );
  }

  public leaveGroup(): void {
    this.simpleModalService
      .addModal(ConfirmationModalComponent, {
        message: `Are you sure you want to leave ${this.groupSelected.label}?`,
      })
      .subscribe((isConfirm) => {
        if (isConfirm) {
          this.groupService
            .leaveGroup(this.groupSelected.id, this.currentUser.email)
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
      })
      .subscribe((user) => {
        if (user !== undefined) {
          this.groupMembers.push(user.user);
          this.toastr.success('User added successfuly');
        }
      });
  }
  public deleteUserFromGroup(user: User): void {
    this.simpleModalService
      .addModal(ConfirmationModalComponent, {
        message: `Are you sure want to delete ${user.firstName}  ${user.secondName} from the group ${this.groupSelected.label}?`,
      })
      .subscribe((t) => {
        if (t) {
          this.groupService
            .leaveGroup(this.groupSelected.id, user.email)
            .subscribe(
              () => {
                this.removeUser(user.id);
                this.toastr.success(
                  `You successfully deleted ${user.firstName} ${user.secondName} from the group "${this.groupSelected.label}"`
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
  removeUser(userId: string) {
    this.groupMembers = this.groupMembers.filter((c) => c.id !== userId);
  }
  returnCorrectLink(user: User): string {
    return user?.avatarUrl.startsWith('http') ||
      user?.avatarUrl.startsWith('data')
      ? user?.avatarUrl
      : '';
  }
  public splitMessage(message: string) {
    return message.split(/\n/gi);
  }
  public isImageHere(): boolean {
    return (
      this.groupSelected.photoUrl !== null &&
      this.groupSelected.photoUrl !== undefined &&
      this.groupSelected.photoUrl !== ''
    );
  }
}
