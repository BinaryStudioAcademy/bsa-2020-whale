import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass']
})
export class ConfirmModalComponent {
  @Output() Login = new EventEmitter<boolean>();
  constructor(public auth: AuthService) {}

  public facebookLogin(): void
  {
    this.auth.signInWithFacebook().then( status => this.Login.emit(status));
  }

  public googleLogin(): void {
    this.auth.signInWithGoogle().then( status => this.Login.emit(status));
  }

  public close(): void {
    this.Login.emit(false);
  }
}
