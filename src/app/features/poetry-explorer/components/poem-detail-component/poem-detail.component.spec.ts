import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoemDetailComponentComponent } from './poem-detail.component';

describe('PoemDetailComponentComponent', () => {
  let component: PoemDetailComponentComponent;
  let fixture: ComponentFixture<PoemDetailComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoemDetailComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoemDetailComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
