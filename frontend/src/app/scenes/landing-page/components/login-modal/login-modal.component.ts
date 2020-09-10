import { Component } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { SimpleModalComponent } from 'ngx-simple-modal';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass'],
})
export class LoginModalComponent extends SimpleModalComponent<null, boolean> {
  constructor(public auth: AuthService) {
    super();
  }

  public facebookLogin(): void {
    this.auth.signInWithFacebook().then((status) => {
      this.result = status;
      setTimeout(() => this.close(), 200);
    });
  }

  public googleLogin(): void {
    this.auth.signInWithGoogle().then((status) => {
      this.result = status;
      setTimeout(() => this.close(), 200);
    });
  }

  public cancel(): void {
    this.result = false;
    this.close();
  }
}
