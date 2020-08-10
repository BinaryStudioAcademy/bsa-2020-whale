import { Component, OnInit } from '@angular/core';
import { Message } from '../../models/message/message';
import { User } from '../../models/user/user';
import { SignalRService } from 'app/core/services/signal-r.service';
import { UserModel } from 'app/scenes/home-page/components/home-page/home-page.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.sass']
})
export class ChatComponent implements OnInit {
  USERS: UserModel[] = [
    {
      id : 1,
      firstName: 'Lol',
      lastName: 'Kek',
      image: 'https://img.icons8.com/color/240/000000/user-male.png'
    },
    {
      id : 2,
      firstName: 'Scarlet',
      lastName: 'Hara',
      image: 'https://img.icons8.com/color/48/000000/kitty.png'
    },
    {
      id : 3,
      firstName: 'Mike',
      lastName: 'Posne',
      image: 'https://img.icons8.com/officel/80/000000/chatbot.png'
    },
    {
      id : 1,
      firstName: 'Lol',
      lastName: 'Kek',
      image: 'https://img.icons8.com/color/240/000000/user-male.png'
    },
    {
      id : 2,
      firstName: 'Scarlet',
      lastName: 'Hara',
      image: 'https://img.icons8.com/color/48/000000/kitty.png'
    },
    {
      id : 3,
      firstName: 'Mike',
      lastName: 'Posne',
      image: 'https://img.icons8.com/officel/80/000000/chatbot.png'
    },
    {
      id : 1,
      firstName: 'Lol',
      lastName: 'Kek',
      image: 'https://img.icons8.com/color/240/000000/user-male.png'
    },
    {
      id : 2,
      firstName: 'Scarlet',
      lastName: 'Hara',
      image: 'https://img.icons8.com/color/48/000000/kitty.png'
    },
    {
      id : 3,
      firstName: 'Mike',
      lastName: 'Posne',
      image: 'https://img.icons8.com/officel/80/000000/chatbot.png'
    },
    {
      id : 1,
      firstName: 'Lol',
      lastName: 'Kek',
      image: 'https://img.icons8.com/color/240/000000/user-male.png'
    },
    {
      id : 2,
      firstName: 'Scarlet',
      lastName: 'Hara',
      image: 'https://img.icons8.com/color/48/000000/kitty.png'
    },
    {
      id : 3,
      firstName: 'Mike',
      lastName: 'Posne',
      image: 'https://img.icons8.com/officel/80/000000/chatbot.png'
    }
  ];

  constructor(private signalRService: SignalRService) { }

  ngOnInit(): void {
  }

}
