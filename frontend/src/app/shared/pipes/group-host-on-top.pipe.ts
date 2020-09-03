import { Pipe, PipeTransform } from '@angular/core';
import { User } from '@shared/models';

@Pipe({
  name: 'groupHostOnTop'
})
export class GroupHostOnTopPipe implements PipeTransform {

  transform(users: User[], args: string[]): User[] {
    const creatorEmail = args[0];

    const temp = users[0];
    const host = users.find((u) => u.email === creatorEmail);
    const hostIndex = users.indexOf(host);
    users[0] = host;
    users[hostIndex] = temp;

    return users;
  }

}
