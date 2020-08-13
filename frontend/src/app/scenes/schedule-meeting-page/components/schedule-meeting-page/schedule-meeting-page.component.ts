import { Component, OnInit } from '@angular/core';
import { IDatePickerConfig } from 'ng2-date-picker';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpService } from '../../../../core/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { GoogleCalendarService } from 'app/core/services/google-calendar.service';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';

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
    monthBtnCssClassCallback: (month) => 'ng2-date-picker-button',
    dayBtnCssClassCallback: (day) => 'ng2-date-picker-button',
  };

  public timeConfig: IDatePickerConfig = {
    format: 'HH:mm',
    showTwentyFourHours: true,
    minutesInterval: 10,
  };

  public isPasswordCheckboxChecked: boolean = true;
  public form: FormGroup;

  constructor(
    private httpService: HttpService,
    private toastr: ToastrService,
    private calendarService: GoogleCalendarService,
    private authService: AuthService,
    private router: Router
  ) {
    const today: Date = new Date();

    this.form = new FormGroup({
      topic: new FormControl('UserNameS meeting etc'),
      date: new FormControl(this.createStringFromDate(today)),
      time: new FormControl(`${today.getHours() + 1}:30`),
      durationHours: new FormControl(1),
      durationMinutes: new FormControl(30),
      isGeneratedMeetingID: new FormControl('true'),
      isPasswordEnabled: new FormControl(''),
      password: new FormControl(''),
      isDisableVideo: new FormControl(''),
      isDisableAudio: new FormControl(''),
      saveIntoCalendar: new FormControl(false),
    });
  }

  ngOnInit(): void {}

  public onSubmit() {
    console.log(this.form.controls.topic.value);
    console.log(
      this.createDateTime(
        this.form.controls.date.value,
        this.form.controls.time.value
      )
    );
    console.log(this.form.controls.durationHours.value);
    console.log(this.form.controls.durationMinutes.value);
    console.log(Boolean(this.form.controls.isGeneratedMeetingID.value));
    console.log(this.form.controls.isPasswordEnabled.value);
    console.log(this.form.controls.password.value);
    console.log(this.form.controls.isDisableVideo.value);
    console.log(this.form.controls.isDisableAudio.value);
    console.log(this.form.controls.saveIntoCalendar.value);
    if (this.form.controls.saveIntoCalendar.value) this.addEventToCalendar();
    // this.httpService.postRequest<ScheduledMeetingCreateDTO, ScheduledMeetingDTO>('/meetings', scheduleDto).subscribe(
    //   (resp) => console.log(resp),
    //   (error) => this.toastr.error(error, 'Error')
    // );
    this.toastr.success('saved successfuly');
    this.router.navigate(['/home']);
  }

  public cancelSchedule() {
    this.router.navigate(['/home']);
  }

  createStringFromDate(date: Date): string {
    let pieces: string[] = [];
    pieces.push(`${date.getDate()}`);
    pieces.push(`${date.getMonth()}`);
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

  public async addEventToCalendar() {
    let startTime = this.createDateTime(
      this.form.controls.date.value,
      this.form.controls.time.value
    );

    let endTime = this.getEndDate(
      startTime,
      this.form.controls.durationHours.value,
      this.form.controls.durationMinutes.value
    );

    let userName = this.authService.currentUser.displayName;
    let userEmail = this.authService.currentUser.email;

    const event = {
      summary: this.form.controls.topic.value,
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

    this.calendarService.insertEvent(event);
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
}
