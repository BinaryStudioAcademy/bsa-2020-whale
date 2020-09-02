import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PointAgenda } from '@shared/models/agenda/agenda';
import { HttpService } from 'app/core/services';
import { environment } from '@env';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.sass'],
})
export class AgendaComponent implements OnInit {
  public agenda: PointAgenda[] = [];
  toastRef;
  @Input() meetingId;
  constructor(private toastr: ToastrService, private httpServie: HttpService) {
  }


  ngOnInit(): void {
    this.httpServie.getRequest<PointAgenda[]>(`${environment.apiUrl}/api/meeting/agenda/${this.meetingId}`)
    .subscribe((res) =>
    {
      this.agenda = res;

    });

  }
  finishedPoint(event, a: PointAgenda){
    if (event.target.checked){
      this.toastr.info(a.name + ' was finished');
    }
  }
}
