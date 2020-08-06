import { Component, OnInit } from '@angular/core';
import { Message } from '../../models/message/message';
import { User } from '../../models/user/user';
import { SignalRService } from 'app/core/services/signal-r.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.sass']
})
export class ChatComponent implements OnInit {
  messages: Message[];
  newMessage: Message;
  currentUser: User;

  constructor(private signalRService: SignalRService) { }

  ngOnInit(): void {
  }

}
