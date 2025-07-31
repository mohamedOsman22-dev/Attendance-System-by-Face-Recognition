import { Component, HostListener, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Report {
  reportId: number;
  title: string;
  date: string;
  status: 'Completed' | 'Pending';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule, MatIconModule, MatButtonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements AfterViewInit {
  reports: Report[] = [
    { reportId: 201, title: 'Monthly Attendance', date: '2024-05-01', status: 'Completed' },
    { reportId: 202, title: 'Quarterly Review', date: '2024-04-01', status: 'Pending' },
    { reportId: 203, title: 'Annual Summary', date: '2024-01-01', status: 'Completed' },
    { reportId: 204, title: 'Special Events', date: '2024-03-15', status: 'Pending' },
  ];

  displayedColumns = ['reportId', 'title', 'date', 'status', 'actions'];

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  viewReport(report: Report) {
    alert(`Viewing report: ${report.title}`);
  }

  deleteReport(report: Report) {
    if (confirm(`Delete report "${report.title}"?`)) {
      this.reports = this.reports.filter(r => r.reportId !== report.reportId);
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const elements = this.el.nativeElement.querySelectorAll('.fade-up-on-scroll');
    elements.forEach((el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        this.renderer.addClass(el, 'revealed');
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const elements = this.el.nativeElement.querySelectorAll('.fade-up-on-scroll');
      elements.forEach((el: HTMLElement) => {
        this.renderer.addClass(el, 'revealed');
      });
    }, 500);
  }
}
