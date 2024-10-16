import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoemSearchFormComponent } from './poem-search-form.component';

describe('PoemSearchFormComponent', () => {
  let component: PoemSearchFormComponent;
  let fixture: ComponentFixture<PoemSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoemSearchFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoemSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
