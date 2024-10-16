import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleSelectorComponent } from './title-selector.component';

describe('TitleSelectorComponent', () => {
  let component: TitleSelectorComponent;
  let fixture: ComponentFixture<TitleSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
