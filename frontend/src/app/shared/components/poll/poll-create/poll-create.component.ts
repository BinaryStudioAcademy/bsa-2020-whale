import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { PollDto } from '../../../models/poll/poll-dto'
import { HttpService } from 'app/core/services/http.service';
import { env } from 'process';
import { environment } from '@env';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-poll-create',
  templateUrl: './poll-create.component.html',
  styleUrls: ['./poll-create.component.sass']
})
export class PollCreateComponent implements OnInit {

  @Input() meetingId: string;
  @Output() pollCreated = new EventEmitter();

  public form: FormGroup;

  constructor(
    private httpService: HttpService,
    private toastr: ToastrService) {
    this.form = new FormGroup({
      title: new FormControl(''),
      isAnonymous: new FormControl(false),
      isSingleChoise: new FormControl(false),
      
      answers: new FormArray([
        new FormControl('', Validators.required),
        new FormControl('', Validators.required)
      ])   
    });
  }

  get answers() {
    return this.form.get('answers') as FormArray;
  }

  addAnswer() {
    if(this.answers.length == 5) {
      this.toastr.warning('Maximum 5 answers', 'Warning');
      return;
    }
    this.answers.push(new FormControl(''));
  }

  removeAnswer(event: MouseEvent) {
    this.answers.removeAt(Number((<HTMLSpanElement>event.target).id));
  }

  ngOnInit(): void {
  }

  public onSubmit() {
    const pollDto: PollDto = {
      meetingId: this.meetingId,
      title: this.form.controls.title.value,
      isAnonymous: this.form.controls.isAnonymous.value,
      isSingleChoice: this.form.controls.isSingleChoise.value,
      answer1: this.answers.controls[0].value,
      answer2: this.answers.controls[1].value,
      answer3: this.answers.controls[2]?.value
    }

    this.httpService.postRequest<PollDto, PollDto>(environment.meetingApiUrl + "/api/polls", pollDto)
      .subscribe(
        (response: PollDto) => {
          this.toastr.success('Poll was created!', 'Success');
          this.pollCreated.emit();
        },
        (error) => {
          this.toastr.error(error);
        }
      )
  }
}
