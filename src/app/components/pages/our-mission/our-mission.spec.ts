import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurMission } from './our-mission';

describe('OurMission', () => {
  let component: OurMission;
  let fixture: ComponentFixture<OurMission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurMission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurMission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
