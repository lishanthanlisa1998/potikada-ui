import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Banners } from './banners';

describe('Banners', () => {
  let component: Banners;
  let fixture: ComponentFixture<Banners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Banners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Banners);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
