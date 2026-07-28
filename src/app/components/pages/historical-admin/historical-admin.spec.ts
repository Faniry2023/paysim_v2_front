import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalAdmin } from './historical-admin';

describe('HistoricalAdmin', () => {
  let component: HistoricalAdmin;
  let fixture: ComponentFixture<HistoricalAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricalAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricalAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
