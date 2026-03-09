import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateProfile } from './affiliate-profile';

describe('AffiliateProfile', () => {
  let component: AffiliateProfile;
  let fixture: ComponentFixture<AffiliateProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffiliateProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffiliateProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
