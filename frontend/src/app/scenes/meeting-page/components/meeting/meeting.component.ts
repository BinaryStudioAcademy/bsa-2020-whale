import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.sass']
})
export class MeetingComponent implements OnInit {

  isShowChat = false;

  users = ['user 1', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6', 'user 7', 'user 8'];

  constructor() { }

  ngOnInit(): void {
  }

  showChat(): void {
    this.isShowChat = !this.isShowChat;
  }
}
