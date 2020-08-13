import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PollDto } from '@shared/models/poll/poll-dto';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { HttpService } from 'app/core/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { PollAnswerDto } from '../../../models/poll/poll-answer-dto';
import { PollResultsDto } from '../../../models/poll/poll-results-dto';
import { environment } from '@env';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.sass'],
})
export class PollComponent implements OnInit {
  @Input() poll: PollDto;
  @Output() pollAnswered = new EventEmitter<void>();

  public form: FormGroup;
  public answerTexts: string[] = [];

  constructor(
    private httpService: HttpService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(''),
      answers: this.poll.isSingleChoice
        ? new FormControl([Validators.required])
        : new FormArray([]),
    });

    if (!this.poll.isSingleChoice) {
      this.poll.answers.forEach((answer) => {
        this.answers.controls.push(new FormControl(''));
      });
    }
  }

  get answers() {
    return this.form.get('answers') as FormArray;
  }

  onSubmit() {
    const answers: number[] = [];
    if (!this.poll.isSingleChoice) {
      this.answers.controls.forEach((control, index) => {
        if (control.value) {
          answers.push(index);
        }
      });
    }

    this.pollAnswered.emit();

    const pollAnswerDto: PollAnswerDto = {
      pollId: this.poll.id,
      userId: 'user',
      answers: this.poll.isSingleChoice
        ? [Number(this.form.controls.answers.value)]
        : answers,
    };

    this.httpService
      .postRequest<PollAnswerDto, PollResultsDto>(
        environment.meetingApiUrl + '/api/polls/answers',
        pollAnswerDto
      )
      .subscribe((response: PollResultsDto) => {
        this.toastr.success('Answer saved!');
      });
  }
}
