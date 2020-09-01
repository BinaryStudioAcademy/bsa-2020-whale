import { Component, OnInit, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PointAgenda } from '@shared/models/agenda/agenda';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.sass'],
})
export class AgendaComponent implements OnInit {
  public agenda = [
    { name: 'Introduction in Silver Age', time: '10:20' },
    {
      name: 'Creativity of Anna Akhmatova',
      time: '10:40',
    },
    { name: 'Poetry by Marina Tsvetaeva', time: '11:50' },
  ];
  toastRef;
  constructor(private toastr: ToastrService) {
  }

  ngOnInit(): void {
  }
  finishedPoint(event, a: PointAgenda){
    if (event.target.checked){
      this.toastr.info(a.name + " was finished");
    }
  }
}
