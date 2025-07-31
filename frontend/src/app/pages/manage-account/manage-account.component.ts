import { Component, AfterViewInit, HostListener, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-manage-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './manage-account.component.html',
  styleUrls: ['./manage-account.component.scss'],
})
export class ManageAccountComponent implements AfterViewInit {
  account = {
    fullName: 'Ahmed Mahmoud',
    email: 'ahmed@gmail.com',
    phone: '0123456789',
  };

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  saveAccount() {
    alert('Changes saved successfully!');
    // هنا ممكن تضيف منطق حفظ البيانات مع API لاحقًا
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
