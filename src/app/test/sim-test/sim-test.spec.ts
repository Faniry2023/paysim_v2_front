import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimTest } from './sim-test';

describe('SimTest', () => {
  let component: SimTest;
  let fixture: ComponentFixture<SimTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
