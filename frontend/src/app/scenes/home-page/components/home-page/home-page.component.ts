import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass']
})
export class HomePageComponent implements OnInit {
  mainUser: UserModel = {
    id : 1,
    firstName: 'Daniel',
    lastName: 'Louise',
    image: 'https://img.icons8.com/color/240/000000/user-male.png'
  };
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
      }
    ];

  contactsVisibility = true;
  groupsVisibility = false;
  chatVisibility = false;

  constructor() { }

  ngOnInit(): void {
  }

  addNewGroup(): void {
    console.log('group clicked!');
  }
  addNewContact(): void {
    console.log('contact clicked!');
  }
  onUserClick(): void {
  this.chatVisibility = !this.chatVisibility;
  }
  onGroupClick(): void {
    this.chatVisibility = !this.chatVisibility;
  }

}
export interface UserModel {
    id: number;
    firstName: string;
    lastName: string;
    image: string;
}
