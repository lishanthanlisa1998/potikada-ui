import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellOnPotikada } from './sell-on-potikada';

describe('SellOnPotikada', () => {
  let component: SellOnPotikada;
  let fixture: ComponentFixture<SellOnPotikada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellOnPotikada]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellOnPotikada);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
