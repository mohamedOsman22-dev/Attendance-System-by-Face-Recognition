import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { DataService, Student as Attendee, Subject, Instructor } from '../../../shared/data.service';

@Component({
  selector: 'app-attendees',
  standalone: true,
  templateUrl: './attendees.component.html',
  styleUrls: ['./attendees.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule]
})
export class AttendeesComponent implements OnInit {
  @Output() attendeesChanged = new EventEmitter<number>();
  attendees: Attendee[] = [];
  subjects: Subject[] = [];
  instructors: Instructor[] = [];

  searchValue: string = '';
  filteredAttendees: Attendee[] = [];
  selectedAttendee: Attendee | null = null;

  showDialog = false;
  editMode = false;
  editAttendee: Attendee = { id: '', name: '', email: '', avatar: '', number: '', password: '', assignedSubjects: [] };

  showSubjectDialog = false;
  subjectSelection: string[] = [];

  successMsg: string = '';
  errorMsg: string = '';
  pendingAvatarFile: File | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.dataService.getStudents().subscribe((attendees) => {
      const arr = attendees as any[];
      this.attendees = (Array.isArray(arr) ? arr : []).map(a => ({
        ...a,
        name: a.name || a.fullName || a.userName || a.mail || a.email || '',
        avatar: a.avatar || a.imagePath || '',
        assignedSubjects: Array.isArray(a.assignedSubjects) ? a.assignedSubjects : []
      }));
      this.filteredAttendees = this.filterAttendees();
      this.selectedAttendee = this.filteredAttendees[0] || null;
      if (this.selectedAttendee && !Array.isArray(this.selectedAttendee.assignedSubjects)) {
        this.selectedAttendee.assignedSubjects = [];
      }
      this.attendeesChanged.emit(this.attendees.length);
    });

    this.dataService.getSubjects().subscribe((subjects: any[]) => {
      this.subjects = Array.isArray(subjects) ? subjects : [];
    });

    this.dataService.getInstructors().subscribe((instructors: any[]) => {
      this.instructors = Array.isArray(instructors) ? instructors : [];
    });
  }

  onSearchChange() {
    this.filteredAttendees = this.filterAttendees();
    if (!this.filteredAttendees.includes(this.selectedAttendee!)) {
      this.selectedAttendee = this.filteredAttendees[0] || null;
    }
  }

  filterAttendees(): Attendee[] {
    const val = this.searchValue.trim().toLowerCase();
    return val
      ? this.attendees.filter(p => p.name.toLowerCase().includes(val) || p.email.toLowerCase().includes(val))
      : [...this.attendees];
  }

  selectAttendee(person: Attendee) {
    this.selectedAttendee = person;
  }

  openAddDialog() {
    this.editMode = false;
    this.editAttendee = { id: '', name: '', email: '', avatar: '', number: '', password: '', assignedSubjects: [] };
    this.successMsg = '';
    this.errorMsg = '';
    this.pendingAvatarFile = null;
    this.showDialog = true;
  }

  openEditDialog(person: Attendee) {
    this.editMode = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.dataService.getStudentById(person.id).subscribe((apiPerson: any) => {
      this.editAttendee = {
        ...apiPerson,
        name: apiPerson.name || apiPerson.fullName || apiPerson.userName || apiPerson.mail || apiPerson.email || '',
        assignedSubjects: Array.isArray(apiPerson.assignedSubjects) ? [...apiPerson.assignedSubjects] : []
      };
      this.showDialog = true;
    });
  }

  saveAttendee() {
    this.successMsg = '';
    this.errorMsg = '';
    if (this.editMode && this.selectedAttendee) {
      this.editAttendee.id = this.selectedAttendee.id;
      this.dataService.editStudent({ ...this.editAttendee }).subscribe({
        next: () => {
          const attendeeId = this.editAttendee.id;
          if (attendeeId) {
            this.dataService.autoRegisterUser(attendeeId).subscribe({
              next: () => {},
              error: () => {
                this.errorMsg = 'تم تحديث الطالب لكن حدث خطأ في تسجيل الحساب.';
                setTimeout(() => this.errorMsg = '', 3000);
              }
            });
          }
          this.refreshAttendeesList(this.editAttendee.id, () => {
            if (this.pendingAvatarFile) {
              this.uploadPendingAvatar(this.editAttendee.id);
            } else {
              this.selectedAttendee = this.attendees.find(a => a.id === this.editAttendee.id) || null;
            }
          });
          this.showDialog = false;
          this.successMsg = 'تم تحديث بيانات الطالب بنجاح.';
        },
        error: () => {
          this.errorMsg = 'حدث خطأ أثناء تحديث بيانات الطالب.';
        }
      });
    } else {
      this.dataService.addStudent({ ...this.editAttendee }).subscribe({
        next: (res: any) => {
          const newId = res?.id || res?._id || res?.Id;
          if (newId) {
            this.dataService.autoRegisterUser(newId).subscribe({
              next: () => {},
              error: () => {
                this.errorMsg = 'تم إضافة الطالب لكن حدث خطأ في تسجيل الحساب.';
                setTimeout(() => this.errorMsg = '', 3000);
              }
            });
          }
          this.refreshAttendeesList(newId, () => {
            if (this.pendingAvatarFile && newId) {
              this.uploadPendingAvatar(newId);
            }
          });
          this.showDialog = false;
          this.successMsg = 'تم إضافة الطالب بنجاح.';
        },
        error: () => {
          this.errorMsg = 'حدث خطأ أثناء إضافة الطالب.';
        }
      });
    }
  }

  uploadPendingAvatar(studentId: string) {
    if (!this.pendingAvatarFile) return;
    this.dataService.uploadAttendeeImage(studentId, this.pendingAvatarFile).subscribe({
      next: () => {
        this.successMsg = 'تم رفع الصورة بنجاح.';
        this.pendingAvatarFile = null;
        // بعد رفع الصورة، أعد جلب بيانات الطالب من السيرفر لتحديث الصورة
        this.dataService.getStudentById(studentId).subscribe((apiPerson: any) => {
          const idx = this.attendees.findIndex(a => a.id === studentId);
          if (idx !== -1) {
            this.attendees[idx].avatar = apiPerson.imagePath || '';
          }
          if (this.selectedAttendee && this.selectedAttendee.id === studentId) {
            this.selectedAttendee.avatar = apiPerson.imagePath || '';
          }
        });
        this.refreshAttendeesList(studentId);
      },
      error: () => {
        this.errorMsg = 'حدث خطأ أثناء رفع الصورة.';
      }
    });
  }
  

  refreshAttendeesList(selectId?: string, cb?: () => void) {
    this.dataService.getStudents().subscribe((attendees) => {
      const arr = attendees as any[];
      this.attendees = (Array.isArray(arr) ? arr : []).map(a => ({
        ...a,
        name: a.name || a.fullName || a.userName || a.mail || a.email || '',
        avatar: a.avatar || a.imagePath || '',
        assignedSubjects: Array.isArray(a.assignedSubjects) ? a.assignedSubjects : []
      }));
      this.filteredAttendees = this.filterAttendees();
      this.selectedAttendee = selectId
        ? this.attendees.find(a => a.id === selectId) || this.filteredAttendees[0] || null
        : this.filteredAttendees[0] || null;
      if (this.selectedAttendee && !Array.isArray(this.selectedAttendee.assignedSubjects)) {
        this.selectedAttendee.assignedSubjects = [];
      }
      this.attendeesChanged.emit(this.attendees.length);
      if (cb) cb();
    });
  }

  deleteAttendee(person: Attendee) {
    if (!person.id) return;
    this.dataService.deleteStudent(person.id).subscribe({
      next: () => {
        this.refreshAttendeesList();
        if (this.selectedAttendee?.id === person.id) {
          this.selectedAttendee = this.filteredAttendees[0] || null;
        }
        this.successMsg = 'تم حذف الطالب بنجاح';
      },
      error: () => {
        this.errorMsg = 'حدث خطأ أثناء حذف الطالب';
      }
    });
  }

  deleteAllAttendees() {
    if (!confirm('هل أنت متأكد أنك تريد حذف جميع الطلاب؟')) return;
    this.dataService.deleteAllAttendees().subscribe({
      next: () => {
        this.attendees = [];
        this.filteredAttendees = [];
        this.selectedAttendee = null;
        this.successMsg = 'تم حذف جميع الطلاب بنجاح';
      },
      error: () => {
        this.errorMsg = 'حدث خطأ أثناء حذف جميع الطلاب';
      }
    });
  }

  openSubjectDialog() {
    this.subjectSelection = [...this.editAttendee.assignedSubjects];
    this.showSubjectDialog = true;
  }

  onSubjectCheckboxChange(event: Event, subjId: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked && !this.subjectSelection.includes(subjId)) {
      this.subjectSelection.push(subjId);
    } else if (!checked && this.subjectSelection.includes(subjId)) {
      this.subjectSelection = this.subjectSelection.filter(id => id !== subjId);
    }
  }

  saveSelectedSubjects() {
    if (!this.editAttendee.id) {
      this.editAttendee.assignedSubjects = [...this.subjectSelection];
      this.showSubjectDialog = false;
      return;
    }

    const attendeeId = this.editAttendee.id;
    // Get current assigned subjects
    const currentSubjects = Array.isArray(this.editAttendee.assignedSubjects) ? this.editAttendee.assignedSubjects : [];
    // Remove subjects that are unchecked
    const removeCalls = currentSubjects
      .filter(subjId => !this.subjectSelection.includes(subjId))
      .map(subjId => this.dataService.removeSubjectFromAttendee(attendeeId, subjId).toPromise());
    // Assign new subjects
    const assignCalls = this.subjectSelection
      .filter(subjId => !currentSubjects.includes(subjId))
      .map(subjId => this.dataService.assignSubjectToAttendee(attendeeId, subjId).toPromise());

    Promise.all([...removeCalls, ...assignCalls]).then(() => {
      this.dataService.getSubjectsByAttendeeId(attendeeId).subscribe((subjects) => {
        const subjectArr = Array.isArray(subjects as any[]) ? (subjects as any[]) : [];
        this.editAttendee.assignedSubjects = subjectArr.map((s: any) => s.id);
        this.refreshAttendeesList(attendeeId);
        this.successMsg = 'تم تحديث المواد بنجاح';
      }, () => {
        this.errorMsg = 'حدث خطأ أثناء جلب المواد.';
      });
      this.showSubjectDialog = false;
    });
  }

  getInstructorNameForSubject(subjId: string): string {
    const subj = this.subjects.find(s => s.id === subjId);
    if (!subj || !subj.instructorIds || !subj.instructorIds.length) return '';
    return subj.instructorIds.map(id => this.dataService.getInstructorName(id)).join(', ');
  }

  getSubjectName(subjId: string): string {
    const found = this.subjects.find((s: any) => s.id === subjId);
    return found ? found.name : '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadImagesForTraining(input.files);
    }
  }

  uploadImagesForTraining(fileList: FileList | null) {
    this.successMsg = '';
    this.errorMsg = '';
    if (!this.selectedAttendee?.id || !fileList || fileList.length === 0) {
      this.errorMsg = 'يجب اختيار طالب أولاً وحفظه قبل رفع الصور!';
      return;
    }
    const files: File[] = Array.from(fileList);
    this.dataService.uploadImagesForTraining(this.selectedAttendee.id, files).subscribe({
      next: () => {
        this.successMsg = 'تم رفع الصور بنجاح.';
      },
      error: (err) => {
        this.errorMsg = 'حدث خطأ أثناء رفع الصور.';
        console.error(err);
      }
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!this.editAttendee.id) {
      this.pendingAvatarFile = file;
      // الصورة تظهر محلياً فقط حتى يتم الحفظ
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editAttendee.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
      return;
    }
    // إذا كان هناك id، ارفع الصورة مباشرة للـ backend
    this.dataService.uploadAttendeeImage(this.editAttendee.id, file).subscribe({
      next: (res: any) => {
        if (res && res.imagePath) {
          this.editAttendee.avatar = res.imagePath;
          if (this.selectedAttendee && this.selectedAttendee.id === this.editAttendee.id) {
            this.selectedAttendee.avatar = res.imagePath;
          }
        }
      },
      error: () => {
        this.errorMsg = 'حدث خطأ أثناء رفع الصورة.';
      }
    });
  }
  getAvatarUrl(person: any): string {
    if (person.id) return `http://aps.tryasp.net/Attendees/${person.id}/image`;
    return 'assets/placeholder.jpg';
  }
  
}
