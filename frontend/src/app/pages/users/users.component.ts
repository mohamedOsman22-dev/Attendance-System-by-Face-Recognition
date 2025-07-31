import { Component, HostListener, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements AfterViewInit {
  users = [
    { id: 1, name: 'Ahmed Mahmoud', email: 'ahmed@gmail.com', role: 'Admin' },
    { id: 2, name: 'Sarah Ali', email: 'sarah@yahoo.com', role: 'User' },
    { id: 3, name: 'Mohamed Samir', email: 'mohamed@company.com', role: 'User' },
    { id: 4, name: 'Omar Hesham', email: 'omar@gmail.com', role: 'Manager' },
  ];

  displayedColumns = ['id', 'name', 'email', 'role', 'actions'];

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  editUser(user: any) {
    alert(`Edit user: ${user.name}`);
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
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
