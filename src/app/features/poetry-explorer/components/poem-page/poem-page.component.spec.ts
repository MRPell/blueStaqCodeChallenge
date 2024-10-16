import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoemPageComponent } from './poem-page.component';

describe('PoemPageComponent', () => {
  let component: PoemPageComponent;
  let fixture: ComponentFixture<PoemPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoemPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoemPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
