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
import { PollService } from 'app/core/services/poll.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.sass'],
})
export class PollComponent implements OnInit {
  @Input() poll: PollDto;
  @Input() user: User;
  @Output() pollAnswered = new EventEmitter<PollDto>();

  public isLoading = false;

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

  get answers(): FormArray {
    return this.form.get('answers') as FormArray;
  }

  onSubmit(): void {
    this.isLoading = true;
    const choosedOptions = this.poll.isSingleChoice
      ? [this.poll.options[Number(this.form.controls.answers.value)]]
      : this.getMuptipleAnswers();

    if (choosedOptions.length === 0 || choosedOptions[0] === undefined) {
      this.toastr.error('No options were selected!');
      this.isLoading = false;
      return;
    }

    this.pollAnswered.emit(this.poll);

    const voter: VoterDto = {
      id: this.user.id,
      firstName: this.user.firstName,
      secondName: this.user.secondName,
      email: this.user.email,
      avatarUrl: this.user.avatarUrl,
    };

    const voteDto: VoteDto = {
      pollId: this.poll.id,
      meetingId: this.poll.meetingId,
      user: voter,
      choosedOptions,
    };

    this.httpService
      .postRequest<VoteDto, PollResultDto>(
        environment.meetingApiUrl + '/api/polls/answers',
        voteDto
      )
      .subscribe(
        () => {
          this.isLoading = false;
          this.toastr.success('Answer saved!');
        },
        (error) => {
          this.isLoading = false;
          this.toastr.error(error.Message);
        }
      );
  }

  public getMuptipleAnswers(): string[] {
    const choosedOptions: string[] = [];

    this.answers.controls.forEach((ctrl, index) => {
      if (ctrl.value) {
        choosedOptions.push(this.poll.options[index]);
      }
    });

    return choosedOptions;
  }
}
