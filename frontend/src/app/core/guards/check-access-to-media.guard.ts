import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable, from } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class CheckAccessToMediaGuard implements CanActivate {
  constructor(private router: Router, private toastr: ToastrService) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      return stream.active;
    } catch {
      window.location.reload();
      alert('Cannot access the camera and microphone');
      return this.router.createUrlTree(['/home']);
    }
  }
}
