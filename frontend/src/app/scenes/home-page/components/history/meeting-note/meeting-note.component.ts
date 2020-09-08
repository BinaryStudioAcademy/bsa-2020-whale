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

  public calculateMeetingDuration(): number | string {
    if (!this.meeting.endTime) {
      return 'N/A';
    }
    const start: number = new Date(this.meeting.startTime).getTime();
    const end: number = new Date(this.meeting.endTime).getTime();
    return end - start;
  }

  msToTime(val: number | string): string {
    if (typeof val === 'string'){
      return val;
    }
    let temp = Math.floor(val / 1000);
    const hours = Math.floor(temp / 3600);
    const hoursString = hours > 0 ? `${hours}h ` : '';
    temp %= 3600;
    const minutes = Math.floor(temp / 60);
    const minutesString = minutes > 0 ? `${minutes}m ` : '';
    const seconds = temp % 60;
    const secondsString = seconds > 0 ? `${seconds}s` : (hours === 0 && minutes === 0 ? `${seconds}s` : '');
    return `${hoursString}${minutesString}${secondsString}`;
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
