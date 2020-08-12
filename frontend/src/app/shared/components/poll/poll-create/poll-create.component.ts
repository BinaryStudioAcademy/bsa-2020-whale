import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { PollCreateDto } from '../../../models/poll/poll-create-dto';
import { HttpService } from 'app/core/services/http.service';
import { env } from 'process';
import { environment } from '@env';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-poll-create',
  templateUrl: './poll-create.component.html',
  styleUrls: ['./poll-create.component.sass'],
})
export class PollCreateComponent implements OnInit {
  @Input() meetingId: string;
  @Output() pollCreated = new EventEmitter<PollCreateDto>();

  public form: FormGroup;

  constructor(private httpService: HttpService, private toastr: ToastrService) {
    this.form = new FormGroup({
      title: new FormControl('', Validators.required),
      isAnonymous: new FormControl(false),
      isSingleChoise: new FormControl(false),

      answers: new FormArray([
        new FormControl('', Validators.required),
        new FormControl('', Validators.required),
      ]),
    });
  }

  get answers() {
    return this.form.get('answers') as FormArray;
  }

  addAnswer() {
    if (this.answers.length == 5) {
      this.toastr.warning('Maximum 5 answers', 'Warning');
      return;
    }
    this.answers.push(new FormControl(''));
  }

  removeAnswer(event: MouseEvent) {
    this.answers.removeAt(Number((<HTMLSpanElement>event.target).id));
  }

  ngOnInit(): void {}

  public onSubmit() {
    let areAnswersRepeat: boolean;

    this.answers.controls.forEach((ctrl) => {
      if (
        this.answers.controls.find((ctrlInner) => ctrlInner.value == ctrl.value)
      ) {
        areAnswersRepeat = true;
        return;
      }
    });

    if (areAnswersRepeat) {
      this.toastr.error('Answers must be unique', 'Error');
      return;
    }

    const pollCreateDto: PollCreateDto = {
      meetingId: this.meetingId,
      title: this.form.controls.title.value,
      isAnonymous: this.form.controls.isAnonymous.value,
      isSingleChoice: this.form.controls.isSingleChoise.value,
      answers: this.answers.controls.map((ctrl) => ctrl.value),
    };

    this.pollCreated.emit(pollCreateDto);
  }
}
