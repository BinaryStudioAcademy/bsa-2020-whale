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
import { HttpResponse } from '@angular/common/http';
import { SimpleModalService } from 'ngx-simple-modal';
import { CallModalComponent } from '../call-modal/call-modal.component';
import { ContactService } from 'app/core/services';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-contacts-chat',
  templateUrl: './contacts-chat.component.html',
  styleUrls: ['./contacts-chat.component.sass'],
})
export class ContactsChatComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit, AfterViewChecked {
  //@ViewChild('intersectionRoot') intersectionRoot: ElementRef<HTMLDivElement>;
  @ViewChildren('intersectionElement') intersectionElements: QueryList<
    ElementRef<HTMLDivElement>
  >;
  public intersectionObserver: IntersectionObserver;

  private hubConnection: HubConnection;
  counter = 0;
  isMessagesLoading = true;

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
  directMessageRecieved = new EventEmitter<DirectMessage>();
  messages: DirectMessage[] = [];
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
    private contactService: ContactService
  ) {}

  ngAfterViewInit(): void {
    this.chatElement = this.chatBlock.nativeElement;
    setTimeout(() => {
      console.log(this.intersectionElements.first.nativeElement);
      this.receivedMessages$.subscribe(() => {
        this.registerIntersectionObserve();
      });
    }, 5000);

    //this.registerIntersectionObserve();
    // const options = {
    //   root: null,
    //   rootMargin: "0px",
    //   threshold: 0.0
    // };
    // this.intersectionObserver = new IntersectionObserver(this.onIntersection, options);
    // this.messages.forEach(message => {
    //   const element = this.intersectionElements.find(el => el.nativeElement.id == message.id);
    //   this.intersectionObserver.observe(element.nativeElement);
    // });
  }

  public registerIntersectionObserve() {
    console.log(this.chatBlock);
    console.log(this.intersectionElements);
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.0,
    };
    this.intersectionObserver = new IntersectionObserver(
      this.onIntersection,
      options
    );
    console.log(this.messages);
    this.messages.forEach((message) => {
      const element = this.intersectionElements.find(
        (el) => el.nativeElement.id == message.id
      );
      console.log('element', element);
      this.intersectionObserver.observe(element.nativeElement);
    });
  }

  public onIntersection(entry) {
    console.log(entry);
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
    this.httpService
      .getRequest<DirectMessage[]>(
        '/api/ContactChat/' + this.contactSelected.id
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: DirectMessage[]) => {
          this.messages = data;
          this.receivedMessages.next();
          console.log('messages new', data);
          this.isMessagesLoading = false;
        },
        (error) => console.log(error)
      );
    this.hubConnection?.invoke('JoinGroup', this.contactSelected.id);
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
}
