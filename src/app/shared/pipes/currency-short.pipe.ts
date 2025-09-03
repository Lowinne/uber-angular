import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyShort',
})
export class CurrencyShortPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
