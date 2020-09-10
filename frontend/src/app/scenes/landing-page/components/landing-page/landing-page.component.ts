import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { SimpleModalService } from 'ngx-simple-modal';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.sass'],
})
export class LandingPageComponent implements OnInit {
  constructor(
    public auth: AuthService,
    private simpleModalService: SimpleModalService
  ) {}

  ngOnInit(): void {}

  public logIn(): void {
    this.simpleModalService.addModal(LoginModalComponent);
  }

  public logOut(): void {
    this.auth.logout();
  }
}
