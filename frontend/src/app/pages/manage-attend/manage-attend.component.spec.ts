import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAttendComponent } from './manage-attend.component';

describe('ManageAttendComponent', () => {
  let component: ManageAttendComponent;
  let fixture: ComponentFixture<ManageAttendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAttendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAttendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
