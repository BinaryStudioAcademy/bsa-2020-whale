import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IDatePickerConfig } from 'ng2-date-picker/date-picker/date-picker-config.model';
import { FormControl, FormGroup } from '@angular/forms';
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
  @Output() tagRemoved = new EventEmitter<string>();
  @Output() newPoint = new EventEmitter<PointAgenda>();
  constructor() {
    const today: Date = new Date();
    this.form = new FormGroup({
      time: new FormControl(`${today.getHours() + 1}:30`),
      name: new FormControl('Name'),
    });
  }

  ngOnInit(): void {}
  onSubmit() {
    this.point.name = this.form.controls.name.value;
    this.point.startTime = this.form.controls.time.value; //} as PointAgenda;
    console.log(this.point);
    //this.newPoint.emit(this.point);
  }
  removeTag(): void {}
}
