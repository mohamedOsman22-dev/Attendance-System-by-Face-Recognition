import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-account',
  standalone: true,
  templateUrl: './manage-attend.component.html',
  styleUrls: ['./manage-attend.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ManageAccountComponent {
  // مؤقتًا هنعرض بيانات محفوظة في localStorage
  user = JSON.parse(localStorage.getItem('user') || '{}');
}
