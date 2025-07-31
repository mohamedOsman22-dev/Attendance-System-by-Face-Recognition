import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { CalendarSetupModule } from './calendar-setup.module';
import { CalendarComponent } from './components/calendar/calendar.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    CalendarSetupModule,
    CalendarComponent
  ]
})
export class AppModule { } 