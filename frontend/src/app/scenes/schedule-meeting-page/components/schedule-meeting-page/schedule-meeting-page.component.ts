import { Component, OnInit } from '@angular/core';
import { IDatePickerConfig } from 'ng2-date-picker';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../../core/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { GoogleCalendarService } from 'app/core/services/google-calendar.service';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import { MeetingService, UpstateService, MeetingSettingsService } from 'app/core/services';
import { takeUntil } from 'rxjs/operators';
import { MeetingCreate, Recurrence } from '@shared/models';
import { Subject } from 'rxjs';
import { User } from '@shared/models/user';
import { PointAgenda } from '@shared/models/agenda/agenda';
import { AgendaComponent } from '../agenda/agenda.component';
import {
  MeetingInviteComponent,
  ScheduleMeetingInviteModalData,
} from '@shared/components/meeting-invite/meeting-invite.component';
import { SimpleModalService } from 'ngx-simple-modal';

@Component({
  selector: 'app-schedule-meeting-page',
  templateUrl: './schedule-meeting-page.component.html',
  styleUrls: ['./schedule-meeting-page.component.sass'],
})
export class ScheduleMeetingPageComponent implements OnInit {
  public config: IDatePickerConfig = {
    weekDayFormat: 'dd',
    format: 'DD/MM/YYYY',
    firstDayOfWeek: 'mo',
    showNearMonthDays: false,
    min: this.createStringFromDate(new Date()),
    monthBtnCssClassCallback: (month) => 'ng2-date-picker-button',
    dayBtnCssClassCallback: (day) => 'ng2-date-picker-button',
  };

  public timeConfig: IDatePickerConfig = {
    format: 'HH:mm',
    showTwentyFourHours: true,
    minutesInterval: 1,
    min: `${new Date().getHours()}:${new Date().getMinutes()}`,
  };
  public pointList: PointAgenda[] = [{ name: '', startTime: new Date() }];
  public isPasswordCheckboxChecked = true;
  public form: FormGroup;
  private unsubscribe$ = new Subject<void>();
  private loggedInUser: User;
  public isAgenda = true;
  public isRecurrent = false;
  public recurrence = 'Never';

  public recognitionLanguage = 'English';
  point: PointAgenda;
  agendaValidate = false;
  constructor(
    private toastr: ToastrService,
    private calendarService: GoogleCalendarService,
    private authService: AuthService,
    private router: Router,
    private meetingService: MeetingService,
    private upstateService: UpstateService,
    private simpleModalService: SimpleModalService,
    meetingSettingsService: MeetingSettingsService
  ) {
    const minutes = new Date().getMinutes();
    this.form = new FormGroup({
      topic: new FormControl('', [Validators.required]),
      description: new FormControl(),
      date: new FormControl(this.createStringFromDate(new Date()), [Validators.required]),
      time: new FormControl(
        `${new Date().getHours() + 1}:${new Date().getMinutes() + 10 - (minutes % 10)}`, [Validators.required]
      ),
      durationHours: new FormControl(1),
      durationMinutes: new FormControl(30),
      isMeetingRecurrent: new FormControl(true),
      isGeneratedMeetingID: new FormControl('true'),
      isPasswordEnabled: new FormControl(''),
      password: new FormControl(''),
      isDisableAudio: new FormControl(
        meetingSettingsService.getSettings().isAudioDisabled
      ),
      isDisableVideo: new FormControl(
        meetingSettingsService.getSettings().isVideoDisabled
      ),
      saveIntoCalendar: new FormControl(false),
    });
  }

  ngOnInit(): void {
    this.getUser();
    this.point = this.pointList[0];
  }

  public isDateValid(): boolean {
    const todayDateString = this.createStringFromDate(new Date());
    const todayParts = todayDateString.split('/');
    const todayDate = new Date(
      Number(todayParts[2]),
      Number(todayParts[1]) - 1,
      Number(todayParts[0]),
      new Date().getHours(),
      new Date().getMinutes()
    );

    const userTimeString = this.form.get('time').value as string;
    const userTimeParts = userTimeString.split(':');
    const userDateString = this.form.get('date').value as string;
    const userDateParts = userDateString.split('/');
    const userDate = new Date(Number(userDateParts[2]), Number(userDateParts[1]) - 1, Number(userDateParts[0]));
    userDate.setHours(Number(userTimeParts[0]));
    userDate.setMinutes(Number(userTimeParts[1]));

    return userDate > todayDate;
  }

  public async sendMeeting(): Promise<void> {
    if (this.form.controls.saveIntoCalendar.value) {
      await this.addEventToCalendar();
    }
    if (this.pointList[0].name === ''){
      this.pointList.splice(0, 1);
    }
    const dateParts = this.form.controls.date.value.split('/');
    const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    const time = this.form.controls.time.value.match(
      /(\d+)(?::(\d\d))?\s*(p?)/
    );
    date.setHours(parseInt(time[1], 10) + (time[3] ? 12 : 0));
    date.setMinutes(parseInt(time[2], 10) || 0);

    let meetingLanguage: string;
    switch (this.recognitionLanguage) {
      case 'Russian':
        meetingLanguage = 'ru';
        break;
      case 'Ukrainian':
        meetingLanguage = 'uk';
        break;
      default:
        meetingLanguage = 'en-US';
    }
    let meetingRecurrence: Recurrence;
    switch (this.recurrence) {
      case 'Every day':
        meetingRecurrence = Recurrence.EveryDay;
        this.isRecurrent = true;
        break;
      case 'Every week':
        meetingRecurrence = Recurrence.EveryWeek;
        this.isRecurrent = true;
        break;
      case 'Every month':
        meetingRecurrence = Recurrence.EveryMonth;
        this.isRecurrent = true;
        break;
      default:
        meetingRecurrence = Recurrence.Never;
        this.isRecurrent = false;
    }

    this.simpleModalService
      .addModal(MeetingInviteComponent, {
        participantEmails: [this.loggedInUser.email],
        isScheduled: true,
      } as ScheduleMeetingInviteModalData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((participantEmails) => {
        this.meetingService
          .createScheduledMeeting({
            topic: this.form.get('topic').value,
            description: this.form.get('description').value,
            settings: '',
            startTime: date,
            anonymousCount: 0,
            isScheduled: true,
            isRecurrent: this.isRecurrent,
            recurrence: meetingRecurrence,
            isAudioAllowed: this.form.controls.isDisableAudio.value,
            isVideoAllowed: this.form.controls.isDisableVideo.value,
            creatorEmail: this.loggedInUser.email,
            participantsEmails: participantEmails as string[],
            agendaPoints: this.pointList,
            recognitionLanguage: meetingLanguage,
          } as MeetingCreate)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((resp) => {
            this.toastr.success('Meeting scheduled!');
            this.router.navigate(['/home']);
          });
      });
  }

  getUser(): void {
    this.upstateService.getLoggedInUser().subscribe((userFromDB: User) => {
      this.loggedInUser = userFromDB;
    });
  }

  public cancelSchedule(): void {
    this.router.navigate(['/home']);
  }

  createStringFromDate(date: Date): string {
    let pieces: string[] = [];
    pieces.push(`${date.getDate()}`);
    pieces.push(`${date.getMonth() + 1}`);
    pieces.push(`${date.getFullYear()}`);
    pieces = pieces.map((piece) => {
      if (piece.length === 1) {
        return '0' + piece;
      } else {
        return piece;
      }
    });

    return pieces.join('/');
  }

  public createDateTime(stringDate: string, stringTime: string): Date {
    const dateParts = stringDate.split('/');
    const date: Date = new Date(
      +dateParts[2],
      +dateParts[1] - 1,
      +dateParts[0]
    );
    const timePieces: number[] = stringTime
      .split(':')
      .map((piece) => Number(piece));

    date.setHours(timePieces.shift());
    date.setMinutes(timePieces.shift());

    return date;
  }

  public async addEventToCalendar(): Promise < void > {
    const startTime = this.createDateTime(
      this.form.controls.date.value,
      this.form.controls.time.value
    );

    const endTime = this.getEndDate(
      startTime,
      this.form.controls.durationHours.value,
      this.form.controls.durationMinutes.value
    );

    const userName = this.authService.currentUser.displayName;
    const userEmail = this.authService.currentUser.email;

    const event = {
      summary: this.form.controls.topic.value,
      description: this.form.controls.description.value,
      start: ({
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      } as unknown) as gapi.client.calendar.EventDateTime,
      end: ({
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      } as unknown) as gapi.client.calendar.EventDateTime,
      creator: {
        displayName: userName,
        email: userEmail,
      },
    } as gapi.client.calendar.Event;

    const result = await this.calendarService.insertEvent(event);
    if (!result) {
      this.toastr.error('Error ocured while adding event into calendar');
    }
  }

  private getEndDate(
    startDate: Date,
    durationHours: number,
    durationMinutes: number
  ): Date {
    return moment(startDate)
      .add(durationHours, 'h')
      .add(durationMinutes, 'm')
      .toDate();
  }
  public addNewPoint() {
    const newPoint = { name: this.point.name, startTime: this.point.startTime };
    this.pointList.push(newPoint);
  }
  public removeTag(event) {
    this.pointList.splice(this.pointList.indexOf(event), 1);
  }
  public agendaValid(event){
    this.agendaValidate = event;
    console.log(event)
  }
}

