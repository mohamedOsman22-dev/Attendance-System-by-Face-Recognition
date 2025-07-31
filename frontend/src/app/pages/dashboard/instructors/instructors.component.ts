import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { switchMap, finalize } from 'rxjs/operators';

import { DataService, Instructor, Subject } from '../../../shared/data.service';

@Component({
  selector: 'app-instructors',
  standalone: true,
  templateUrl: './instructors.component.html',
  styleUrls: ['./instructors.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstructorsComponent implements OnInit {
  @Output() instructorsChanged = new EventEmitter<number>();
  instructors: Instructor[] = [];
  subjects: Subject[] = [];

  // UI State
  searchValue = '';
  filteredInstructors: Instructor[] = [];
  selectedInstructor: Instructor | null = null;

  showDialog = false;
  showSubjectDialog = false;
  editMode = false;
  editInstructor: Instructor = { id: '', name: '', email: '', avatar: '', number: '', password: '', subjects: [] };
  subjectSelection: string[] = [];
  subjectSelectMode: 'create' | 'edit' = 'edit';

  errorMsg = '';
  successMsg = '';
  showPassword = false;
  showLoader = false;

  constructor(private dataService: DataService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.showLoader = true;
    this.dataService.getInstructors().pipe(
      switchMap(instructors => {
        // معالجة الداتا عشان تكون متوافقة مع الواجهة مهما كانت ناقصة من الـ API
        this.instructors = instructors.map((i: any) => ({
          id: i.id,
          name: i.fullName || i.name || '---',
          email: i.mail || i.email || '---',
          avatar: i.imagePath || '',
          number: i.number ? String(i.number) : '',
          subjects: [], // المواد هنجلبها منفصلة
        }));
        this.filteredInstructors = [...this.instructors];
        if (this.filteredInstructors.length > 0) {
          this.selectedInstructor = this.filteredInstructors[0];
          // عند اختيار أول مدرس، هات المواد المرتبطة بيه
          this.fetchSubjectsForInstructor(this.selectedInstructor);
        } else {
          this.selectedInstructor = null;
        }
        this.instructorsChanged.emit(this.filteredInstructors.length);
        return this.dataService.getSubjects();
      }),
      finalize(() => this.showLoader = false)
    ).subscribe(subjects => {
      this.subjects = subjects;
    });
  }

  // جلب المواد الخاصة بمدرس عند اختياره
  fetchSubjectsForInstructor(person: Instructor) {
    if (person && person.id) {
      this.dataService.getSubjectsByInstructorId(person.id).subscribe(subjects => {
        const subjectIds = Array.isArray(subjects) ? subjects.map((s: any) => s.id) : [];
        person.subjects = subjectIds;
        // تحديث الـ selectedInstructor في حالة وجودها
        if (this.selectedInstructor && this.selectedInstructor.id === person.id) {
          this.selectedInstructor.subjects = subjectIds;
        }
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  onSearchChange() {
    const val = this.searchValue.trim().toLowerCase();
    if (!val) {
      this.filteredInstructors = [...this.instructors];
    } else {
      this.filteredInstructors = this.instructors.filter(p =>
        (p.name && p.name.toLowerCase().includes(val)) ||
        (p.email && p.email.toLowerCase().includes(val))
      );
    }
    if (!this.filteredInstructors.includes(this.selectedInstructor!)) {
      this.selectedInstructor = this.filteredInstructors[0] || null;
      if (this.selectedInstructor) {
        this.fetchSubjectsForInstructor(this.selectedInstructor);
      }
    }
  }

  selectInstructor(person: Instructor) {
    this.selectedInstructor = person;
    this.fetchSubjectsForInstructor(person);
  }

  getSubjectName(subjId: string): string {
    const found = this.subjects.find((s: any) => s.id === subjId);
    return found ? found.name : '';
  }

  trackByInstructorId(index: number, item: Instructor) {
    return item.id;
  }


  // ===== Add/Edit/Delete Instructor =====
  openAddDialog() {
    this.editMode = false;
    this.editInstructor = { id: '', name: '', email: '', avatar: '', number: '', password: '', subjects: [] };
    this.showDialog = true;
  }
  openEditDialog(person: Instructor) {
    this.editMode = true;
    this.selectedInstructor = person;
    this.dataService.getInstructorById(person.id).subscribe((apiPerson: any) => {
      this.editInstructor = {
        id: apiPerson?.id || person.id || '',
        name: apiPerson?.fullName || person.name || '',
        email: apiPerson?.mail || apiPerson?.email || person.email || "---",
        avatar: apiPerson?.imagePath || person.avatar || '',
        number: apiPerson?.number || person.number || '',
        password: apiPerson?.password || person.password || '',
        subjects: Array.isArray(apiPerson?.subjects) ? [...apiPerson.subjects] : (Array.isArray(person.subjects) ? [...person.subjects] : [])
      };
      this.showDialog = true;
    });
  }
  /**
   * حفظ أو تحديث بيانات المدرس
   */
  saveInstructor() {
    this.errorMsg = '';
    this.successMsg = '';
    this.showLoader = true;
    if (!this.editInstructor.name || !this.editInstructor.email || !this.editInstructor.password) {
      this.errorMsg = 'يرجى إدخال الاسم، الإيميل، وكلمة المرور.';
      this.showLoader = false;
      return;
    }
    const obs = this.editMode
      ? this.dataService.editInstructor(this.editInstructor)
      : this.dataService.addInstructor(this.editInstructor);
    obs.pipe(finalize(() => this.showLoader = false)).subscribe(
      (res: any) => {
        // Call auto-register after add/edit
       const instructorId = res?.id || res?._id || res?.Id || this.editInstructor.id;
        console.log('Instructor ID for auto-register:', instructorId);

        if (instructorId) {
          this.dataService.autoRegisterUser(instructorId).subscribe({
          next: (res) => console.log('Auto-register success'),
          error: (err) => console.log('Auto-register failed', err)
          
        });
          this.errorMsg = 'تم حفظ المدرس لكن حدث خطأ في تسجيل الحساب.';
              setTimeout(() => this.errorMsg = '', 3000);    
            
          
        }
        this.successMsg = this.editMode ? 'تم تحديث بيانات المدرس بنجاح' : 'تم إضافة المدرس بنجاح';
        setTimeout(() => this.successMsg = '', 3000);
        this.showDialog = false;
        this.ngOnInit();
        if (!this.editMode) {
          this.editInstructor = { id: '', name: '', email: '', number: '', password: '', avatar: '', subjects: [] };
        }
      },
      err => {
        this.errorMsg = 'حدث خطأ أثناء العملية. حاول لاحقاً.';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    );
  }
  /**
   * حذف مدرس
   */
  deleteInstructor(person: Instructor) {
    if (!person.id) return;
    this.showLoader = true;
    this.dataService.deleteInstructor(person.id).pipe(finalize(() => this.showLoader = false)).subscribe({
      next: () => {
        this.ngOnInit();
      }
    });
  }

  // ===== Avatar Upload =====
  onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!this.editInstructor.id) {
      this.errorMsg = 'يجب حفظ بيانات المدرس أولاً قبل رفع الصورة!';
      return;
    }
    this.dataService.uploadInstructorImage(this.editInstructor.id, file).subscribe({
      next: (res: any) => {
        if (res && res.imagePath) {
          this.editInstructor.avatar = res.imagePath;
          if (this.selectedInstructor && this.selectedInstructor.id === this.editInstructor.id) {
            this.selectedInstructor.avatar = res.imagePath;
          }
        } else {
          this.dataService.getInstructors().subscribe(instructors => {
            this.instructors = instructors.map((i: any) => ({
              id: i.id,
              name: i.fullName || '',
              email: i.mail || i.email || "---",
              number: i.number || '',
              password: '',
              avatar: i.imagePath || '',
              subjects: Array.isArray(i.subjects) ? i.subjects : [],
            }));
            const updated = this.instructors.find(i => i.id === this.editInstructor.id);
            if (updated) {
              this.editInstructor.avatar = updated.avatar;
              if (this.selectedInstructor && this.selectedInstructor.id === updated.id) {
                this.selectedInstructor.avatar = updated.avatar;
              }
            }
          });
        }
      },
      error: (err: any) => {
        this.errorMsg = 'حدث خطأ أثناء رفع الصورة. تأكد من نوع الصورة أو حاول لاحقاً.';
      }
    });
  }

  // ===== Assign Subjects to Instructor =====
  openSubjectDialog(mode: 'create' | 'edit') {
    this.subjectSelectMode = mode;
    if (mode === 'edit' && this.selectedInstructor) {
      // اجلب المواد المرتبطة فعلياً من الـ backend
      this.dataService.getSubjectsByInstructorId(this.selectedInstructor.id).subscribe(subjects => {
        const subjectIds = Array.isArray(subjects) ? subjects.map(s => s.id) : [];
        this.subjectSelection = [...subjectIds];
        if (this.selectedInstructor) {
          this.selectedInstructor.subjects = [...subjectIds];
        }
        this.showSubjectDialog = true;
      });
    } else {
      const allSubjectIds = this.subjects.map(s => s.id);
      this.subjectSelection = [...this.editInstructor.subjects].filter(id => !!id && allSubjectIds.includes(id));
      this.showSubjectDialog = true;
    }
  }
  onSubjectCheckboxChange(event: Event, subjId: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked && !this.subjectSelection.includes(subjId)) {
      this.subjectSelection.push(subjId);
    } else if (!checked && this.subjectSelection.includes(subjId)) {
      this.subjectSelection = this.subjectSelection.filter(id => id !== subjId);
    }
    // تصفية أي undefined أو قيم غير موجودة في قائمة المواد
    const allSubjectIds = this.subjects.map(s => s.id);
    this.subjectSelection = this.subjectSelection.filter(id => !!id && allSubjectIds.includes(id));
  }
  saveSelectedSubjects() {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.subjectSelectMode === 'edit' && this.selectedInstructor && this.selectedInstructor.id) {
      const instructorId = this.selectedInstructor.id;
      const currentSubjects = Array.isArray(this.selectedInstructor.subjects) ? this.selectedInstructor.subjects : [];
      // إضافة المواد الجديدة فقط (لا يوجد API للحذف)
      const assignCalls = this.subjectSelection
        .filter(subjId => !currentSubjects.includes(subjId))
        .map(subjId => this.dataService.assignSubjectToInstructor(instructorId, subjId).toPromise());

      Promise.all(assignCalls).then(() => {
        this.dataService.getSubjectsByInstructorId(instructorId).subscribe(subjects => {
          const subjectIds = Array.isArray(subjects) ? subjects.map(s => s.id) : [];
          this.selectedInstructor!.subjects = [...subjectIds];
          this.successMsg = 'تم ربط المواد بنجاح';
          setTimeout(() => this.successMsg = '', 3000);
          this.showSubjectDialog = false;
        });
      }).catch(() => {
        this.errorMsg = 'حدث خطأ أثناء ربط المواد.';
        setTimeout(() => this.errorMsg = '', 3000);
      });
    }
  }
}
