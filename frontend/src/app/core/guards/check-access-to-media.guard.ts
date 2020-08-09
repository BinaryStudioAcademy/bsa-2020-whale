import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckAccessToMediaGuard implements CanActivate {
  constructor(private router: Router) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {

    //return this.router.createUrlTree(['/home']);
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      return stream.active;
    }
    catch{
      return this.router.createUrlTree(['/home'])
    }
  }

  // getUserMedia(){
  //   const stream = ;
  //   console.log("This is guard", (stream));
  //   return true;
  // }

}
