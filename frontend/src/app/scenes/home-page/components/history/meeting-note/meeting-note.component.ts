import { Component, OnInit, Input } from '@angular/core';
import { Meeting } from '@shared/models/meeting/meeting';

@Component({
  selector: 'app-meeting-note',
  templateUrl: './meeting-note.component.html',
  styleUrls: ['./meeting-note.component.sass'],
})
export class MeetingNoteComponent implements OnInit {
  @Input() meeting: Meeting;

  public areResultsVisible = false;
  public areParticipantsVisible = false;

  constructor() {}

  ngOnInit(): void {}

  public calculateDuration(): number {
    const start: number = new Date(this.meeting.startTime).getTime();
    const end: number = new Date(this.meeting.endTime).getTime();
    const diff: number = (end - start) / 60000;
    return diff;
  }
}
