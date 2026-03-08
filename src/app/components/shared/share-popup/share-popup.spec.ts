import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePopup } from './share-popup';

describe('SharePopup', () => {
  let component: SharePopup;
  let fixture: ComponentFixture<SharePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
