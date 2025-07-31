import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AttendeesComponent } from '../dashboard/attendees/attendees.component';
import { InstructorsComponent } from '../dashboard/instructors/instructors.component';
import { SubjectsComponent } from '../dashboard/subjects/subjects.component';
import { NavbarAdminComponent } from "../../components/navbar/navbar-admin.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    AttendeesComponent,
    InstructorsComponent,
    SubjectsComponent
]
})
export class DashboardComponent implements AfterViewInit {
  activeTab: string = 'attendees';
  
  @ViewChild(AttendeesComponent) attendeesComp?: AttendeesComponent;
  @ViewChild(InstructorsComponent) instructorsComp?: InstructorsComponent;
  @ViewChild(SubjectsComponent) subjectsComp?: SubjectsComponent;

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateCounts(), 0);
  }

  updateCounts(): void {
    // Implementation for updating counts
  }

  getPageTitle(): string {
    switch (this.activeTab) {
      case 'attendees':
        return 'Attendees Management';
      case 'instructors':
        return 'Instructors Management';
      case 'subjects':
        return 'Subjects Management';
      default:
        return 'Dashboard';
    }
  }

  refreshData(): void {
    if (this.activeTab === 'attendees') {
      this.attendeesComp?.refreshAttendeesList();
    } else if (this.activeTab === 'instructors') {
      this.instructorsComp?.ngOnInit();
    } else if (this.activeTab === 'subjects') {
      this.subjectsComp?.ngOnInit();
    }
    setTimeout(() => this.updateCounts(), 0);
  }

  onAddNew(): void {
    if (this.activeTab === 'attendees') {
      this.attendeesComp?.openAddDialog();
    } else if (this.activeTab === 'instructors') {
      this.instructorsComp?.openAddDialog();
    } else if (this.activeTab === 'subjects') {
      this.subjectsComp?.openAddDialog();
    }
  }
}
