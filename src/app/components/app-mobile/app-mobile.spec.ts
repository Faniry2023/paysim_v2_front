import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMobile } from './app-mobile';

describe('AppMobile', () => {
  let component: AppMobile;
  let fixture: ComponentFixture<AppMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMobile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
