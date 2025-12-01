import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolCategoryAddComponent } from './symbol-category-add.component';

describe('SymbolCategoryAddComponent', () => {
  let component: SymbolCategoryAddComponent;
  let fixture: ComponentFixture<SymbolCategoryAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolCategoryAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymbolCategoryAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
