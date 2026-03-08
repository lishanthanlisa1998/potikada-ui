import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateDashboard } from './affiliate-dashboard';

describe('AffiliateDashboard', () => {
  let component: AffiliateDashboard;
  let fixture: ComponentFixture<AffiliateDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffiliateDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffiliateDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
