import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date): string {
    const dateOptions = {
      day: 'numeric',
      month: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };

    return new Date(value).toLocaleDateString('uk', dateOptions);
  }
}
