import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceAttendComponent } from './face-attend.component';

describe('FaceAttendComponent', () => {
  let component: FaceAttendComponent;
  let fixture: ComponentFixture<FaceAttendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceAttendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceAttendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
