import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolAddComponent } from './symbol-add.component';

describe('SymbolAddComponent', () => {
  let component: SymbolAddComponent;
  let fixture: ComponentFixture<SymbolAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymbolAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
