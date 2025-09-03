import { TestBed } from '@angular/core/testing';

import { SocketMockService } from './socket-mock.service';

describe('SocketMockService', () => {
  let service: SocketMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
