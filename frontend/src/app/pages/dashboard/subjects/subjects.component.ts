import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpHeaders } from '@angular/common/http';
import { DataService, Subject } from '../../../shared/data.service';
import { Instructor } from '../../../shared/data.service';
import { SubjectService } from '../../../services/subject.service';

interface SubjectDate {
  id?: string;
  day?: string;
  dayOfWeek?: number;
  from?: string;
  to?: string;
  startTime?: string;
  endTime?: string;
}

@Component({
  selector: 'app-subjects',
  standalone: true,
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule]
})
export class SubjectsComponent implements OnInit {
  @Output() subjectsChanged = new EventEmitter<number>();
  subjects: Subject[] = [];
  selectedSubject: Subject | null = null;

  editMode = false;
  showDialog = false;
  editSubject: Subject = { id: '', name: '', instructorIds: [], dates: [] };

  editNameMode = false;

  showDateDialog = false;
  editDateMode = false;
  editDate: SubjectDate = {};
  editingDateIndex: number | null = null;
  daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedInstructor: Instructor | null = null;

  constructor(private dataService: DataService, private subjectService: SubjectService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const instructorId = payload.sub;

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.subjectService.getInstructorSubjects(instructorId, headers).subscribe((subjects: any[]) => {
        this.subjects = (Array.isArray(subjects) ? subjects : []).map(subj => ({
          ...subj,
          id: subj.id || subj.name || '',
          dates: subj.dates || subj.subjectDates || []
        }));

        this.subjectsChanged.emit(this.subjects.length);
        if (!this.selectedSubject && this.subjects.length > 0) {
          this.selectedSubject = this.subjects[0];
        }
      });
    } else {
      console.error('No token found in localStorage');
    }
  }

  selectSubject(subj: Subject) {
    if (!subj.id) return;
    this.dataService.getSubjectById(subj.id).subscribe((apiSubj: any) => {
      this.selectedSubject = {
        ...apiSubj,
        dates: apiSubj.dates || apiSubj.subjectDates || []
      };
      this.editNameMode = false;
    });
  }

  openAddDialog() {
    this.editMode = false;
    this.editSubject = { id: '', name: '', instructorIds: [], dates: [] };
    this.showDialog = true;
  }

  openEditDialog(subj: Subject) {
    if (!subj.id) return;
    this.editMode = true;
    this.dataService.getSubjectById(subj.id).subscribe((apiSubj: any) => {
      this.editSubject = {
        id: apiSubj?.id || subj.id,
        name: apiSubj?.name || subj.name,
        description: apiSubj?.description || subj.description || '',
        instructorId: apiSubj?.instructorId || subj.instructorId || '',
        instructorIds: apiSubj?.instructorIds || subj.instructorIds || [],
        dates: apiSubj?.dates || apiSubj?.subjectDates || subj.dates || [],
      };
      this.selectedSubject = this.editSubject;
      this.showDialog = true;
    });
  }

  saveSubject() {
    if (this.editMode && this.selectedSubject) {
      this.editSubject.id = this.selectedSubject.id;
      this.dataService.patchSubject(this.editSubject.id, this.editSubject).subscribe(() => {
        this.refreshSubjects();
      });
    } else if (!this.editMode) {
      this.dataService.addSubject({ ...this.editSubject }).subscribe(() => {
        this.refreshSubjects();
      });
    }
    this.showDialog = false;
  }

  refreshSubjects() {
    this.dataService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
      this.selectedSubject = this.subjects.find(s => s.id === this.editSubject.id) || this.subjects[0] || null;
    });
  }

  deleteSubject(subj: Subject) {
    if (!subj.id) return;
    this.dataService.deleteSubject(subj.id).subscribe(() => {
      this.refreshSubjects();
    });
  }

  openAddDateDialog(subject: Subject) {
    this.editDateMode = false;
    this.editDate = {
      day: 'Sunday',
      from: '00:00',
      to: '00:00'
    };
    this.editingDateIndex = null;
    this.showDateDialog = true;
  }

  openEditDateDialog(subject: Subject, index: number) {
    this.editDateMode = true;
    const date = subject.dates[index];
    this.editDate = {
      id: date.id, // <-- الآن ممكن لأنه اختياري
      day: typeof date.dayOfWeek === 'number'
        ? this.daysOfWeek[date.dayOfWeek]
        : date.day || 'Sunday',
      from: date.startTime?.substring(0, 5) || date.from || '00:00',
      to: date.endTime?.substring(0, 5) || date.to || '00:00'
    };
    this.editingDateIndex = index;
    this.showDateDialog = true;
  }

  saveDate() {
    if (!this.selectedSubject) return;

    const from = this.editDate.from || '';
    const to = this.editDate.to || '';
    if (!from || !to || from === '00:00' || to === '00:00') {
      alert('يرجى اختيار وقت بداية ونهاية صحيحين');
      return;
    }

    if (this.editDateMode && this.editingDateIndex !== null) {
this.selectedSubject.dates![this.editingDateIndex] = { id: '', ...this.editDate };
    } else if (this.selectedSubject.id) {
      this.dataService.postSubjectDates(this.selectedSubject.id, this.editDate).subscribe(() => {
        this.selectSubject(this.selectedSubject!);
      });
    }

    this.showDateDialog = false;
  }

  deleteDate(subject: Subject, index: number) {
const dateId = (subject.dates[index] as any)?.id;
    if (dateId && subject.id) {
      this.dataService.deleteSubjectDate(subject.id, dateId).subscribe(() => {
        this.selectSubject(subject);
      });
    } else {
      subject.dates.splice(index, 1);
    }
  }

  deleteAllSubjects() {
    this.dataService.deleteAllSubjects().subscribe(() => {
      this.subjects = [];
      this.selectedSubject = null;
    });
  }

  getSubjectAttendees(subjectId: string) {
    if (!subjectId) return;
    this.dataService.getSubjectAttendees(subjectId).subscribe(attendees => {
      // handle attendees
    });
  }

  getDayName(day: number | string | undefined): string {
    const days = this.daysOfWeek;
    if (typeof day === 'number' && day >= 0 && day <= 6) return days[day];
    if (!isNaN(Number(day))) return days[Number(day)] || '';
    return String(day || '');
  }

  selectInstructor(person: Instructor) {
    this.selectedInstructor = person;
    this.dataService.getSubjectsByInstructorId(person.id).subscribe((subjects: any[]) => {
      this.selectedInstructor!.subjects = subjects.map(s => s.id);
    });
  }
}
