import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PollDto } from '@shared/models/poll/poll-dto';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { HttpService } from 'app/core/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { VoteDto } from '../../../models/poll/vote-dto';
import { PollResultDto } from '../../../models/poll/poll-result-dto';
import { environment } from '@env';
import { User } from '@shared/models/user/user';
import { VoterDto } from '@shared/models/poll/voter-dto';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.sass'],
})
export class PollComponent implements OnInit {
  @Input() poll: PollDto;
  @Input() user: User;
  @Output() pollAnswered = new EventEmitter<PollDto>();

  public form: FormGroup;

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
      this.poll.options.forEach(() => {
        this.answers.controls.push(new FormControl(''));
      });
    }
  }

  get answers() {
    return this.form.get('answers') as FormArray;
  }

  onSubmit() {
    let choosedOptions = this.poll.isSingleChoice
      ? [this.poll.options[Number(this.form.controls.answers.value)]]
      : this.answers.controls
          .filter((ctrl) => ctrl.value)
          .map((ctrl, index) => this.poll.options[index]);

    console.log(choosedOptions);
    if (choosedOptions.length == 0 || choosedOptions[0] === undefined) {
      this.toastr.error('No options were selected!');
      return;
    }

    this.pollAnswered.emit(this.poll);

    const voter: VoterDto = {
      firstName: this.user.firstName,
      secondName: this.user.secondName,
      email: this.user.email,
      avatarUrl: this.user.avatarUrl,
    };

    const voteDto: VoteDto = {
      poll: this.poll,
      meetingId: this.poll.meetingId,
      user: voter,
      choosedOptions: choosedOptions,
    };

    this.httpService
      .postRequest<VoteDto, PollResultDto>(
        environment.meetingApiUrl + '/api/polls/answers',
        voteDto
      )
      .subscribe(() => {
        this.toastr.success('Answer saved!');
      });
  }
}
