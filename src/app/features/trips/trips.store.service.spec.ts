import { TestBed } from '@angular/core/testing';

import { TripsStoreService } from './trips.store.service';

describe('TripsStoreService', () => {
  let service: TripsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
