import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AttendanceStateService {
  private draftList: { name: string; id: string }[] = [];
  private reviewList: { name: string; id: string }[] = [];

  // ✅ الحصول على قائمة الحضور المؤقتة
  getDraftList() {
    return this.draftList.slice(); // نسخة آمنة
  }

  // ✅ الحصول على قائمة المراجعة
  getReviewList() {
    return this.reviewList.slice(); // نسخة آمنة
  }

  // ✅ إضافة طالب لقائمة المؤقتة مع منع التكرار
  addToDraft(student: { name: string; id: string }) {
    const exists = this.draftList.some(s => s.id === student.id);
    if (exists) {
      alert('⚠️ الطالب موجود بالفعل في قائمة الحضور المؤقتة.');
      return false;
    }
    this.draftList.push(student);
    return true;
  }

  // ✅ إزالة طالب من المؤقتة
  removeFromDraft(index: number) {
    if (index >= 0 && index < this.draftList.length) {
      this.draftList.splice(index, 1);
    }
  }

  // ✅ نقل الحضور من المؤقت إلى المراجعة (مع منع التكرار)
  sendDraftToFinal() {
    let duplicateFound = false;
    this.draftList.forEach(student => {
      const exists = this.reviewList.some(s => s.id === student.id);
      if (!exists) {
        this.reviewList.push(student);
      } else {
        duplicateFound = true;
      }
    });
    this.draftList = [];
    if (duplicateFound) {
      alert('⚠️ تم تجاهل بعض الطلاب لأنهم موجودين بالفعل في قائمة المراجعة.');
    }
  }

  // ✅ إزالة طالب من قائمة المراجعة
  removeFromReview(index: number) {
    if (index >= 0 && index < this.reviewList.length) {
      this.reviewList.splice(index, 1);
    }
  }

  // ✅ مسح قائمة المراجعة بالكامل (بعد الإرسال)
  clearReviewList() {
    this.reviewList = [];
  }
}
