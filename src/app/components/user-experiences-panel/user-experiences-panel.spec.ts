import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExperiencesPanel } from './user-experiences-panel';

describe('UserExperiencesPanel', () => {
  let component: UserExperiencesPanel;
  let fixture: ComponentFixture<UserExperiencesPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserExperiencesPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserExperiencesPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
