import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  AfterViewInit,
  QueryList,
  ElementRef,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DirectMessage } from '@shared/models/message/direct-message';
import { ReadAndUnreadMessages } from '@shared/models/message/read-and-unread-messages';
import { UnreadMessageId } from '@shared/models/message/unread-message-id';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HttpService } from 'app/core/services/http.service';
import { Subject, ReplaySubject } from 'rxjs';
import { takeUntil, take, first } from 'rxjs/operators';
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
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() contactSelected: Contact;
  @Input() loggedInUser: User;
  @Output() chat: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() messageRead = new EventEmitter<string>();

  @ViewChildren('intersectionElement') intersectionElements: QueryList<
    ElementRef<HTMLDivElement>
  >;
  @ViewChildren('chatWindow') chatBlock: QueryList<ElementRef<HTMLDivElement>>;

  public intersectionObserver: IntersectionObserver;
  chatElement: any;
  counter = 0;
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

  isMessagesLoading = true;
  isFirstLoad = true;

  private receivedMessages = new ReplaySubject<void>();
  public receivedMessages$ = this.receivedMessages.asObservable();

  private unsubscribe$ = new Subject<void>();

  constructor(
    private signalRService: SignalRService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private simpleModalService: SimpleModalService,
    private contactService: ContactService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.messageService.receivedMessage$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (newMessage) => {
          if (
            newMessage.contactId !== this.contactSelected.id ||
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
  }

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

  ngOnChanges(changes: SimpleChanges): void {
    this.httpService
      .getRequest<ReadAndUnreadMessages>(
        '/ContactChat/withUnread/' + this.contactSelected.id,
        new HttpParams().set('userId', this.loggedInUser.id)
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: ReadAndUnreadMessages) => {
        this.messages = data.readMessages.concat(data.unreadMessages);
        this.unreadMessages = data.unreadMessages;
        this.receivedMessages.next();
        this.isMessagesLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

    const newMessage: DirectMessage = {
      contactId: this.contactSelected.id,
      authorId: this.contactSelected.firstMemberId,
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
      .postRequest<DirectMessage, HttpResponse<DirectMessage>>(
        '/ContactChat/',
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

  public call(): void {
    this.simpleModalService.addModal(CallModalComponent, this.contactSelected);
  }

  public onEnterKeyPress(event: KeyboardEvent, valid: boolean): void {
    event.preventDefault();
    if (valid) {
      this.sendMessage();
    }
  }
  public splitMessage(message: string): string[] {
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
        this.contactSelected.unreadMessageCount -= 1;
        this.sendMarkReadRequest(entry.target.id, this.loggedInUser.id);
      }
    });
  }

  public sendMarkReadRequest(messageId: string, userId: string): void {
    const unreadMessageId: UnreadMessageId = {
      messageId,
      receiverId: userId,
    };

    this.httpService
      .postRequest('/ContactChat/markRead', unreadMessageId)
      .subscribe(() => {
        this.messageRead.emit(messageId);
      });
  }
}
