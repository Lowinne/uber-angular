import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true,
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'requested':
        return 'Demandée';
      case 'ongoing':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled_by_rider':
        return 'Annulée (rider)';
      case 'cancelled_by_driver':
        return 'Annulée (driver)';
      default:
        return value;
    }
  }
}
