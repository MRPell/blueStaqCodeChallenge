import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorSelectorComponent } from './author-selector.component';

describe('AuthorSelector', () => {
  let component: AuthorSelectorComponent;
  let fixture: ComponentFixture<AuthorSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
