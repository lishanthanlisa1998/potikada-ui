import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantFamilies } from './variant-families';

describe('VariantFamilies', () => {
  let component: VariantFamilies;
  let fixture: ComponentFixture<VariantFamilies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantFamilies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantFamilies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
