import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
import { startOfDay } from 'date-fns';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    MatButtonModule
  ]
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  CalendarView = CalendarView;

  constructor() {}

  ngOnInit(): void {
    // Initialize with some sample events
    this.events = [
      {
        start: startOfDay(new Date()),
        title: 'Sample Event',
        color: {
          primary: '#ad2121',
          secondary: '#FAE3E3'
        }
      }
    ];
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked(event: any): void {
    // For month view
    if (event.day) {
      const date = event.day.date;
      const events = event.day.events;
      console.log(date, events);
      // Add your logic here
    }
    // For week/day view, handle accordingly if needed
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log(event);
    // Here you can add logic to handle event clicks
  }
} 