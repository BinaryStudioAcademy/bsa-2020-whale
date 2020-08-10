import { Component, OnInit, Input } from '@angular/core';
import { PollDto } from '@shared/models/poll/poll-dto';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { HttpService } from 'app/core/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { PollAnswerDto } from '../../../models/poll/poll-answer-dto'

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.sass']
})
export class PollComponent implements OnInit {

  @Input() poll: PollDto;

  public form: FormGroup;
  public answerTexts: string[] = [];

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    for(let i = 1; i < 5; i++) {
      if(this.poll[`answer${i}`]) {
        this.answerTexts.push(this.poll[`answer${i}`]);
      }
    }

    console.log(this.answerTexts);

    this.form = new FormGroup({
      title: new FormControl(''),
      answers: this.poll.isSingleChoice 
               ? new FormControl([Validators.required])
               : new FormArray([])
    });

    console.log(this.form.controls);

    if(!this.poll.isSingleChoice) {
      for(let i = 1; i < 5; i++) {
        if(this.poll[`answer${i}`]) {
          this.answers.controls.push(new FormControl(''));
        }
      }
    } 
  }

  get answers() {
    return this.form.get('answers') as FormArray;
  }

  onSubmit() {
    const pollAnswer: PollAnswerDto = {
      pollId: 'POLL ID!!!!',
      answers: this.poll.isSingleChoice  
              ? this.form.controls.answers.value
              : this.answers.controls.map(control => control.value).filter(value => value == true)
    };

    console.log(pollAnswer);
  }
}
