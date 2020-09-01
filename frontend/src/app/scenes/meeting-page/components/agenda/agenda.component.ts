import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.sass'],
})
export class AgendaComponent implements OnInit {
  public agenda = [
    { name: 'introduction in Silver Age', time: '9:30' },
    {
      name: 'creativity of Anna Akhmatova',
      time: '10:10',
    },
    { name: 'poetry of Marina Tsvetaeva', time: '10:40' },
  ];
  constructor() {
    this.agenda = [
      { name: 'introduction in Silver Age', time: '9:30' },
      {
        name: 'creativity of Anna Akhmatova',
        time: '10:10',
      },
      { name: 'poetry of Marina Tsvetaeva', time: '10:40' },
    ];
  }

  ngOnInit(): void {
    this.agenda = [
      { name: 'introduction in Silver Age', time: '9:30' },
      {
        name: 'creativity of Anna Akhmatova',
        time: '10:10',
      },
      { name: 'poetry of Marina Tsvetaeva', time: '10:40' },
    ];
  }
}
