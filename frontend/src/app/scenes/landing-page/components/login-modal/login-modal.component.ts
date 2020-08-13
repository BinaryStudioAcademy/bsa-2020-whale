import { Component } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Route } from '@angular/compiler/src/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass'],
})
export class LoginModalComponent extends SimpleModalComponent<null, boolean> {
  constructor(public auth: AuthService, private router: Router) {
    super();
  }

  public facebookLogin(): void {
    this.auth.signInWithFacebook().then((status) => {
      this.result = status;
      this.router.navigate(['/home']);
      this.close();
    });
  }

  public googleLogin(): void {
    this.auth.signInWithGoogle().then((status) => {
      this.result = status;
      this.router.navigate(['/home']);
      this.close();
    });
  }

  public cancel(): void {
    this.result = false;
    this.close();
  }
}
