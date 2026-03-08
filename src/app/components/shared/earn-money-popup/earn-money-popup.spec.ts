import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarnMoneyPopup } from './earn-money-popup';

describe('EarnMoneyPopup', () => {
  let component: EarnMoneyPopup;
  let fixture: ComponentFixture<EarnMoneyPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarnMoneyPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarnMoneyPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
