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

  public calculateDuration(): Date {
    const start: number = new Date(this.meeting.startTime).getTime();
    const end: number = new Date(this.meeting.endTime).getTime();

    return new Date(end - start);
  }

  public stringifyDuration(duration: Date): string {
    const hours = duration.getUTCHours();
    const minutes = duration.getUTCMinutes();

    const hourString = hours == 0 ? '' : `${hours} hours `;
    const minuteString = minutes == 0 ? '' : `${minutes} minutes`;

    return hourString + minuteString;
  }
}
