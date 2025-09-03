import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackRideComponent } from './track-ride.component';

describe('TrackRideComponent', () => {
  let component: TrackRideComponent;
  let fixture: ComponentFixture<TrackRideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackRideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
