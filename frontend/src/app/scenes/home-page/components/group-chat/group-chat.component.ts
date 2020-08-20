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
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DirectMessage } from '@shared/models/message/direct-message';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
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
import { CallModalComponent } from '../call-modal/call-modal.component';
import { Group } from '@shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { GroupUser } from '@shared/models/group/groupuser';
import { AddUserToGroupModalComponent } from '../add-user-to-group-modal/add-user-to-group-modal.component';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.sass'],
})
export class GroupChatComponent implements OnInit, OnChanges, OnDestroy {
  private hubConnection: HubConnection;
  counter = 0;
  private receivedMsg = new Subject<DirectMessage>();
  public receivedMsg$ = this.receivedMsg.asObservable();

  private unsubscribe$ = new Subject<void>();
  @Input() groupSelected: Group;
  @Output() chat: EventEmitter<boolean> = new EventEmitter<boolean>();
  newUserInGroup: GroupUser = {
    userEmail: '',
    groupId: this.groupSelected?.id,
  };
  groupMembers: User[] = [];
  isMembersVisible = false;
  // groupMessageRecieved = new EventEmitter<GroupMessage>();
  // messages: GroupMessage[] = [];
  // newMessage: GroupMessage = {
  //   groupId: '',
  //   message: '',
  //   authorId: '',
  //   createdAt: new Date(),
  //   attachment: false,
  // };
  constructor(
    private signalRService: SignalRService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private simpleModalService: SimpleModalService,
    private groupService: GroupService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.groupSelected);
    // this.httpService
    //   .getRequest<DirectMessage[]>(
    //     '/api/ContactChat/' + this.groupSelected.id
    //   )
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(
    //     (data: DirectMessage[]) => {
    //       this.messages = data;
    //       console.log('messages new');
    //     },
    //     (error) => console.log(error)
    //   );
    // this.hubConnection?.invoke('JoinGroup', this.groupSelected.id);
    this.groupService
      .getAllGroupUsers(this.groupSelected.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (users) => {
          this.groupMembers = users;
          console.log(users);
        },
        (err) => {
          console.log(err.message);
          this.toastr.error(err.Message);
        }
      );
  }
  ngOnInit(): void {
    // from(this.signalRService.registerHub(environment.signalrUrl, 'chatHub'))
    //   .pipe(
    //     tap((hub) => {
    //       this.hubConnection = hub;
    //     })
    //   )
    //   .subscribe(() => {
    //     this.hubConnection.on(
    //       'NewMessageReceived',
    //       (message: DirectMessage) => {
    //         this.receivedMsg.next(message);
    //       }
    //     );
    //     this.hubConnection.invoke('JoinGroup', this.groupSelected.id);
    //   });
    // this.receivedMsg$.pipe(takeUntil(this.unsubscribe$)).subscribe(
    //   (newMessage) => {
    //     this.messages.push(newMessage);
    //     console.log('received a messsage ', newMessage);
    //   },
    //   (err) => {
    //     console.log(err.message);
    //     this.toastr.error(err.Message);
    //   }
    // );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  // sendMessage(): void {
  //   console.log('Send is called');
  //   this.newMessage.contactId = this.contactSelected.id;
  //   this.newMessage.authorId = this.contactSelected.firstMemberId;
  //   this.newMessage.createdAt = new Date();
  //   console.log(this.newMessage);
  //   this.httpService
  //     .postRequest<DirectMessage, HttpResponse<DirectMessage>>(
  //       '/api/ContactChat/',
  //       this.newMessage
  //     )
  //     .pipe(take(1))
  //     .subscribe(
  //       () => (this.newMessage.message = ''),
  //       (error) => this.toastr.error(error.Message)
  //     );
  // }
  close(): void {
    this.chat.emit(false);
    this.hubConnection.invoke('Disconnect', this.groupSelected.id);
  }

  public call(): void {
    // console.log(this.groupSelected);
    // this.simpleModalService.addModal(CallModalComponent, this.groupSelected);
  }

  public onEnterKeyPress(event: KeyboardEvent, valid: boolean): void {
    event.preventDefault();
    if (valid) {
      // this.sendMessage();
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
  returnCorrectLink(user: User): string {
    return user?.avatarUrl.startsWith('http') ||
      user?.avatarUrl.startsWith('data')
      ? user?.avatarUrl
      : '';
  }
}
