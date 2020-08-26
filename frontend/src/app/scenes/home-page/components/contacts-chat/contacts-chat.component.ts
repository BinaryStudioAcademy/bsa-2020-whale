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
  ViewChildren,
  AfterViewInit,
  ViewChild,
  QueryList,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DirectMessage } from '@shared/models/message/direct-message';
import { ReadAndUnreadMessages } from '@shared/models/message/read-and-unread-messages';
import { UnreadMessageId } from '@shared/models/message/unread-message-id';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HttpService } from 'app/core/services/http.service';
import { environment } from '@env';
import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subject, from, Observable, ReplaySubject } from 'rxjs';
import { tap, takeUntil, take } from 'rxjs/operators';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Console } from 'console';
import { stringify } from 'querystring';
import { HttpResponse, HttpParams } from '@angular/common/http';
import { SimpleModalService } from 'ngx-simple-modal';
import { CallModalComponent } from '../call-modal/call-modal.component';
import { ContactService } from 'app/core/services';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-contacts-chat',
  templateUrl: './contacts-chat.component.html',
  styleUrls: ['./contacts-chat.component.sass'],
})
export class ContactsChatComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit, AfterViewChecked {
  @ViewChildren('intersectionElement') intersectionElements: QueryList<
    ElementRef<HTMLDivElement>
  >;
  public intersectionObserver: IntersectionObserver;

  private hubConnection: HubConnection;
  counter = 0;
  isMessagesLoading = true;
  isFirstLoad = true;

  private receivedMsg = new Subject<DirectMessage>();
  public receivedMsg$ = this.receivedMsg.asObservable();

  private receivedMessages = new ReplaySubject<void>();
  public receivedMessages$ = this.receivedMessages.asObservable();

  private unsubscribe$ = new Subject<void>();

  @ViewChild('chatWindow', { static: false }) chatBlock: ElementRef<
    HTMLElement
  >;
  chatElement: any;

  @Input() contactSelected: Contact;
  @Input() loggedInUser: User;
  @Output() chat: EventEmitter<boolean> = new EventEmitter<boolean>();
  //@Output() messageRead = new EventEmitter<string>();
  directMessageRecieved = new EventEmitter<DirectMessage>();
  messages: DirectMessage[] = [];
  unreadMessages: DirectMessage[] = [];
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
    private toastr: ToastrService,
    private simpleModalService: SimpleModalService,
    private contactService: ContactService,
    private messageService: MessageService
  ) {
    console.log(messageService.creationDate);
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
          'NewMessageReceived',
          (message: DirectMessage) => {
            this.receivedMsg.next(message);
          }
        );
        this.hubConnection.invoke('JoinGroup', this.contactSelected.id);
      });
    this.receivedMsg$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (newMessage) => {
        this.messages.push(newMessage);
        if (newMessage.authorId == this.contactSelected?.secondMember.id) {
          this.contactSelected.unreadMessageCount += 1;
          this.intersectionElements.changes.subscribe(() => {
            this.intersectionObserver.observe(
              this.intersectionElements.last.nativeElement
            );
          });
        }
        console.log('received a messsage ', newMessage);
      },
      (err) => {
        console.log(err.message);
        this.toastr.error(err.Message);
      }
    );
  }

  ngAfterViewInit(): void {
    this.chatElement = this.chatBlock.nativeElement;
    this.intersectionElements.changes.subscribe(() => {
      this.receivedMessages$.subscribe(() => {
        this.registerIntersectionObserve();
      });
    });
  }

  ngAfterViewChecked(): void {
    //console.log('after view checked');
    //this.scrollDown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.httpService
      .getRequest<ReadAndUnreadMessages>(
        '/api/ContactChat/withUnread/' + this.contactSelected.id,
        new HttpParams().set('userId', this.loggedInUser.id)
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: ReadAndUnreadMessages) => {
          this.messages = data.readMessages.concat(data.unreadMessages);
          this.unreadMessages = data.unreadMessages;
          this.receivedMessages.next();
          console.log('messages new', data);
          this.isMessagesLoading = false;
        },
        (error) => console.log(error)
      );
    this.hubConnection?.invoke('JoinGroup', this.contactSelected.id);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  scrollDown(): void {
    const chatHtml = this.chatElement as HTMLElement;
    const isScrolledToBottom =
      chatHtml.scrollHeight - chatHtml.clientHeight > chatHtml.scrollTop;

    if (isScrolledToBottom)
      chatHtml.scrollTop = chatHtml.scrollHeight - chatHtml.clientHeight;
  }

  sendMessage(): void {
    console.log('Send is called');
    this.newMessage.contactId = this.contactSelected.id;
    this.newMessage.authorId = this.contactSelected.firstMemberId;
    this.newMessage.createdAt = new Date();
    console.log(this.newMessage);
    this.httpService
      .postRequest<DirectMessage, HttpResponse<DirectMessage>>(
        '/api/ContactChat/',
        this.newMessage
      )
      .pipe(take(1))
      .subscribe(
        () => {
          this.newMessage.message = '';
          this.scrollDown();
        },
        (error) => this.toastr.error(error.Message)
      );
  }

  close(): void {
    this.chat.emit(false);
    this.hubConnection.invoke('Disconnect', this.contactSelected.id);
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
  public splitMessage(message: string) {
    return message.split(/\n/gi);
  }

  public onDelete(): void {
    this.simpleModalService
      .addModal(ConfirmationModalComponent, {
        message: 'Are you sure you want to delete the contact?',
      })
      .subscribe((isConfirm) => {
        if (isConfirm) {
          this.contactService.DeleteContact(this.contactSelected.id).subscribe(
            (resp) => {
              if (resp.status === 204) {
                this.close();
              }
            },
            (error) => this.toastr.error(error.Message)
          );
        }
      });
  }

  public registerIntersectionObserve() {
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
        (el) => el.nativeElement.id == message.id
      );
      this.intersectionObserver.observe(element.nativeElement);
    });
  }

  public onIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log(entry.target);
        this.intersectionObserver.unobserve(entry.target);
        this.unreadMessages.splice(
          this.unreadMessages.findIndex((um) => um.id == entry.target.id),
          1
        );
        this.contactSelected.unreadMessageCount -= 1;
        const unreadMessageId: UnreadMessageId = {
          messageId: entry.target.id,
          receiverId: this.loggedInUser.id,
        };
        console.log(unreadMessageId);
        this.httpService
          .postRequest('/api/ContactChat/markRead', unreadMessageId)
          .subscribe(
            () => {},
            (error) => console.error(error)
          );
      }
    });
  }
}
