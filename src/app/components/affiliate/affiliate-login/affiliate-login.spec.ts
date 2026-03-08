import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateLogin } from './affiliate-login';

describe('AffiliateLogin', () => {
  let component: AffiliateLogin;
  let fixture: ComponentFixture<AffiliateLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffiliateLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffiliateLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
