import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService, ScheduleItem } from '../../services/student.service';

@Component({
  selector: 'app-student-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-calendar.component.html',
  styleUrls: ['./student-calendar.component.scss']
})
export class StudentCalendarComponent implements OnInit {
  calendarEvents: ScheduleItem[] = [];
  message: string = '';

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.studentService.getStudentSchedule().subscribe({
      next: (data: ScheduleItem[]) => {
        if (data.length > 0) {
          this.calendarEvents = data.map(event => ({
            ...event,
            startTime: new Date(`1970-01-01T${event.startTime}`),
            endTime: new Date(`1970-01-01T${event.endTime}`)
          }));
        } else {
          this.message = 'No scheduled subjects found.';
        }
      },
      error: () => {
        this.message = 'Failed to load schedule.';
      }
    });
  }

  getDayOfWeek(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day % 7];
  }

  getFormattedTime(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(`1970-01-01T${value}`) : value;
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }
}
