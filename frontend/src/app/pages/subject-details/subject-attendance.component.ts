import { Component, Input, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { AttendanceStateService } from '../../services/attendance-state.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-subject-attendance',
  standalone: true,
  templateUrl: './subject-attendance.component.html',
  styleUrls: ['./subject-attendance.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule
  ],
})
export class SubjectAttendanceComponent implements OnInit, OnChanges {
  @Input() subjectId!: string;
  @Input() subject!: any;

  manualName = '';
  manualId = '';
  cameraActive = false;
  stream: MediaStream | null = null;
  capturedImage: string = '';
  instructorId: string = '';
  subjectName: string = '';

  students = [
    { name: 'Student 1', id: '1001' },
    { name: 'Student 2', id: '1002' }
  ];

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private attendanceState: AttendanceStateService,
    private http: HttpClient
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subject'] && this.subject) {
      this.subjectId = this.subject.id || this.subject.name;
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.instructorId = decoded.sub;
    }

    if (this.instructorId && this.subjectId) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.get<any>(
        `http://aps.tryasp.net/Instructors/${this.instructorId}/subjects/${this.subjectId}`,
        { headers }
      ).subscribe({
        next: (res) => {
          this.subjectName = res.name || 'Unnamed Subject';
        },
        error: (err) => {
          console.error('❌ Failed to load subject:', err);
        }
      });
    }
  }

  get attendanceList() {
    return this.attendanceState.getDraftList();
  }

  startCamera(): void {
    this.cameraActive = true;

    setTimeout(() => {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        this.stream = stream;
        const videoEl = this.video?.nativeElement;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.play();
        }
      }).catch(err => {
        console.error('Camera access error:', err);
        this.cameraActive = false;
      });
    }, 100);
  }

  captureImage(): void {
    const canvasEl = this.canvas?.nativeElement;
    const videoEl = this.video?.nativeElement;
    if (!canvasEl || !videoEl) return;

    const context = canvasEl.getContext('2d');
    context?.drawImage(videoEl, 0, 0, 320, 240);
    this.capturedImage = canvasEl.toDataURL('image/jpeg');

    this.stopCamera();
    this.sendImageToApi();
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.cameraActive = false;
  }

  addManualAttendance(): void {
    if (!this.manualName || !this.manualId || !this.subjectId) return;

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get(
      `http://aps.tryasp.net/Attendees/${this.manualId}/subjects/${this.subjectId}`,
      { headers }
    ).subscribe({
      next: () => {
        const added = this.attendanceState.addToDraft({
          name: this.manualName,
          id: this.manualId
        });

        if (added) {
          this.manualName = '';
          this.manualId = '';
        }
      },
      error: () => {
        alert('❌ هذا الطالب غير مسجل في هذه المادة!');
      }
    });
  }

  removeFromAttendance(index: number): void {
    this.attendanceState.removeFromDraft(index);
  }

  sendToReview(): void {
    this.attendanceState.sendDraftToFinal();
  }

  private sendImageToApi(): void {
    if (!this.subjectId || !this.capturedImage) {
      console.warn('⚠️ No subject ID or image to send');
      return;
    }

    const blob = this.dataURItoBlob(this.capturedImage);
    const formData = new FormData();
    formData.append('file', blob, `face-${Date.now()}.jpg`);

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url = `http://aps.tryasp.net/Attendances/face-checkin?subjectId=${this.subjectId}`;

    console.log('📤 Sending image to API...');
    console.log('📦 Image blob size:', blob.size);

    this.http.post(url, formData, { headers }).subscribe({
      next: (res: any) => {
        const studentName = res.name || 'Student (from face)';
        const studentId = res.id || 'Unknown';
        this.verifyAndAddStudent(studentName, studentId, headers);
      },
      error: (err) => {
        console.error('Face check-in failed:', err);

        // ✅ fallback تجريبي
        const fallbackName = 'Fallback Student';
        const fallbackId = '9999';
        this.attendanceState.addToDraft({ name: fallbackName, id: fallbackId });
        alert('❗Fallback added بسبب فشل في التعرّف');
      }
    });
  }

  private verifyAndAddStudent(name: string, id: string, headers: HttpHeaders): void {
    this.http.get(
      `http://aps.tryasp.net/Attendees/${id}/subjects/${this.subjectId}`,
      { headers }
    ).subscribe({
      next: () => {
        const added = this.attendanceState.addToDraft({ name, id });
        if (!added) {
          alert('الطالب موجود بالفعل.');
        }
      },
      error: () => {
        alert(`🚫 الطالب ${name} غير مسجل في هذه المادة.`);
      }
    });
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }
}
