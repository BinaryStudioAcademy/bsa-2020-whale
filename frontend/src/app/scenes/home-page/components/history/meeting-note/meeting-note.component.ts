import { Component, OnInit, Input } from '@angular/core';
import { Duration } from '@shared/models/other/duration';
import { MeetingScript, Meeting } from '@shared/models';
import { environment } from '@env';
import { HttpService } from 'app/core/services';

@Component({
  selector: 'app-meeting-note',
  templateUrl: './meeting-note.component.html',
  styleUrls: ['./meeting-note.component.sass'],
})
export class MeetingNoteComponent implements OnInit {
  @Input() meeting: Meeting;
  public route = environment.apiUrl + '/meetingHistory/script/';
  public areResultsVisible = false;
  public areParticipantsVisible = false;
  public areScriptVisible = false;
  public isScriptLoading = false;
  public script: MeetingScript[];

  constructor(private httpService: HttpService) {}

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
      hours,
      minutes,
    };
  }

  public stringifyDuration(duration: Duration): string {
    if (!duration) {
      return 'N/A';
    }
    const hourString = duration.hours === 0 ? '' : `${duration.hours} hours `;
    const minuteString =
      duration.minutes === 0 && duration.hours !== 0
        ? ''
        : `${duration.minutes} minutes`;

    return hourString + minuteString;
  }

  public loadScript(): void {
    if (!this.script)
    {
      this.isScriptLoading = true;
      this.httpService.getRequest<MeetingScript[]>(this.route + this.meeting.id).subscribe(
        (response) => {
          this.script = response;
          this.isScriptLoading = false;
        },
        (error) => {
          this.isScriptLoading = false;
          this.script = [];
          }
        );
    }
    this.areScriptVisible = !this.areScriptVisible;
  }
}
