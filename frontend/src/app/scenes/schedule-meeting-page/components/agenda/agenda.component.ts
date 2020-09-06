import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IDatePickerConfig } from 'ng2-date-picker/date-picker/date-picker-config.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PointAgenda } from '@shared/models/agenda/agenda';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.sass'],
})
export class AgendaComponent implements OnInit {
  today: Date = new Date();
  public form: FormGroup;
  public timeConfig: IDatePickerConfig = {
    format: 'HH:mm',
    showTwentyFourHours: true,
    minutesInterval: 10,
  };
  @Input() point: PointAgenda;
  @Output() tagRemoved = new EventEmitter<PointAgenda>();
  constructor() {
    const today: Date = new Date();
    this.form = new FormGroup({
      time: new FormControl(`${today.getHours() + 1}:30`),
      name: new FormControl('', Validators.required),
    });
  }
  public name = '';
  public startTime = new Date();
  ngOnInit(): void {}
  onSubmit() {
    this.point.name = this.form.controls.name.value;
    this.point.startTime = this.form.controls.time.value;
  }
  removeTag(point): void {
    this.tagRemoved.emit(point);
  }
}
