import { Component, OnInit, Input } from '@angular/core';
import { Meeting } from '@shared/models/meeting/meeting';
import { Duration } from '@shared/models/other/duration';

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

  public calculateDuration(): Duration {
    if (!this.meeting.endTime) {
      return null;
    }
    const start: number = new Date(this.meeting.startTime).getTime();
    const end: number = new Date(this.meeting.endTime).getTime();

    const durationMinutes: number = (end - start) / 60_000;
    let hours = 0;
    let minutes = 0;

    hours = Math.floor(durationMinutes / 60);
    minutes = Math.round(durationMinutes % 60);

    return {
      hours: hours,
      minutes: minutes,
    };
  }

  public stringifyDuration(duration: Duration): string {
    if (!duration) {
      return 'No data';
    }
    const hourString = duration.hours == 0 ? '' : `${duration.hours} hours `;
    const minuteString =
      duration.minutes == 0 && duration.hours != 0
        ? ''
        : `${duration.minutes} minutes`;

    return hourString + minuteString;
  }
}
