import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '@shared/models';
import { sortBy } from 'sort-by-typescript';

@Pipe({
  name: 'sortContacts'
})
export class SortContactsPipe implements PipeTransform {

  transform(contacts: Contact[]): Contact[] {
    if (contacts !== undefined) {
      contacts.sort(sortBy('-isAccepted'));
    }

    return contacts;
  }

}
