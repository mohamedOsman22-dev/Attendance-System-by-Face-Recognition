import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class NavbarComponent implements OnInit {
  navLinks: any[] = [];
  role: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    let user = null;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      user = localStorage.getItem('user');
    }
    if (user) {
      this.role = JSON.parse(user).role;
      this.setNavLinks();
    }
  }

  setNavLinks() {
    if (this.role === 'Attendee') {
      this.navLinks = [
        { label: 'Home', route: '/home' },
        { label: 'Calendar', route: '/student-calendar' },
        { label: 'Manage Account', route: '/manage-account' },
        { label: 'Logout', route: '/login', logout: true }
      ];
    } else if (this.role === 'Instructor') {
      this.navLinks = [
        { label: 'Home', route: '/home' },
        { label: 'Take Attendance', route: '/face-attend' },
        { label: 'Manage Account', route: '/manage-account' },
        { label: 'Logout', route: '/login', logout: true }
      ];
    } else if (this.role === 'Admin') {
      this.navLinks = [
        { label: 'Home', route: '/home' },
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Manage Account', route: '/manage-account' },
        { label: 'Logout', route: '/login', logout: true }
      ];
    }
  }

  handleNav(link: any) {
    if (link.logout) {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  }
}
