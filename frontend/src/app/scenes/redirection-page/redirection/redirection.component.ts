import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-redirection',
  templateUrl: './redirection.component.html',
  styleUrls: ['./redirection.component.sass'],
})
export class RedirectionComponent implements OnInit {
  notActiveLink = 'not-active';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const invite: string = params[`link`];

      this.redirectToMeeting(invite);
    });
  }

  public findMeetingByShortLink(shortLink: string): Observable<string> {
    const baseUrl: string = environment.apiUrl;

    return this.http.get(`${baseUrl}/api/meeting/shortInvite/${shortLink}`, {
      responseType: 'text',
    });
  }

  private redirectToMeeting(invite: string): void {
    this.findMeetingByShortLink(invite).subscribe(
      (resp) => {
        if (resp === this.notActiveLink) {
          this.toastr.info(`Meeting isn't started yet`);
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/meeting-page', resp]);
        }
      },
      (err) => {
        this.toastr.error(err.Message);
        this.router.navigate(['/home']);
      }
    );
  }
}
