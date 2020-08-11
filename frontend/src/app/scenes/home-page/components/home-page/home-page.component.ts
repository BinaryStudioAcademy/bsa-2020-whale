import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeetingService } from 'app/core/services/meeting.service';
import { Router } from '@angular/router';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  mainUser: UserModel = {
    id: 1,
    firstName: 'Daniel',
    lastName: 'Louise',
    image: 'https://img.icons8.com/color/240/000000/user-male.png',
  };
  USERS: UserModel[] = [
    {
      id: 1,
      firstName: 'Lol',
      lastName: 'Kek',
      image: 'https://img.icons8.com/color/240/000000/user-male.png',
    },
    {
      id: 2,
      firstName: 'Scarlet',
      lastName: 'Hara',
      image: 'https://img.icons8.com/color/48/000000/kitty.png',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Posne',
      image: 'https://img.icons8.com/officel/80/000000/chatbot.png',
    },
    {
      id: 1,
      firstName: 'Lol',
      lastName: 'Kek',
      image: 'https://img.icons8.com/color/240/000000/user-male.png',
    },
    {
      id: 2,
      firstName: 'Scarlet',
      lastName: 'Hara',
      image: 'https://img.icons8.com/color/48/000000/kitty.png',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Posne',
      image: 'https://img.icons8.com/officel/80/000000/chatbot.png',
    },
    {
      id: 1,
      firstName: 'Lol',
      lastName: 'Kek',
      image: 'https://img.icons8.com/color/240/000000/user-male.png',
    },
    {
      id: 2,
      firstName: 'Scarlet',
      lastName: 'Hara',
      image: 'https://img.icons8.com/color/48/000000/kitty.png',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Posne',
      image: 'https://img.icons8.com/officel/80/000000/chatbot.png',
    },
  ];

  contactsVisibility = true;
  groupsVisibility = false;
  chatVisibility = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private meetingService: MeetingService,
    private router: Router,
    private simpleModalService: SimpleModalService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {}

  addNewGroup(): void {
    console.log('group clicked!');
  }
  addNewContact(): void {
    console.log('contact clicked!');
    this.simpleModalService
      .addModal(AddContactModalComponent)
      .subscribe((contact) => console.log(contact));
  }
  onUserClick(): void {
    this.chatVisibility = !this.chatVisibility;
  }
  onGroupClick(): void {
    this.chatVisibility = !this.chatVisibility;
  }

  createMeeting(): void {
    this.meetingService
      .createMeeting({
        settings: '',
        startTime: new Date(),
        anonymousCount: 0,
        isScheduled: false,
        isRecurrent: false,
      } as MeetingCreate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          const meetingLink = resp.body;
          this.router.navigate([
            '/meeting-page',
            `?id=${meetingLink.id}&pwd=${meetingLink.password}`,
          ]);
        },
        (error) => console.log(error.message)
      );
  }
  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
}
export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}
