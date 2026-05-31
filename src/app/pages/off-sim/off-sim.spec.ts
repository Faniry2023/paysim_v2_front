import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffSim } from './off-sim';

describe('OffSim', () => {
  let component: OffSim;
  let fixture: ComponentFixture<OffSim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffSim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffSim);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
