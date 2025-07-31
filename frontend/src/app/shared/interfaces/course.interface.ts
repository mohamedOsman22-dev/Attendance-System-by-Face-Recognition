export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  startDate: Date;
  endDate: Date;
  schedule: CourseSchedule[];
  enrolledStudents: number;
  maxStudents: number;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  room: string;
}

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CreateCourseDto {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  schedule: CourseSchedule[];
  maxStudents: number;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  schedule?: CourseSchedule[];
  maxStudents?: number;
  status?: CourseStatus;
} 