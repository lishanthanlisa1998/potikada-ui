import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateRegister } from './affiliate-register';

describe('AffiliateRegister', () => {
  let component: AffiliateRegister;
  let fixture: ComponentFixture<AffiliateRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffiliateRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffiliateRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
