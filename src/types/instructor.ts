// types/instructor.ts
export interface InstructorResponse {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  phoneNumber: string;
}

// Изменяем этот интерфейс, чтобы соответствовать FindByIdInstructorResponse из бэкенда
export interface InstructorDetailResponse {
  id: number;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  email: string;
  courseNames: string[]; // Это поле точно совпадает с бэкендом
}

export interface InstructorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  linkForPassword: string;
}

export interface InstructorUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  courseIds: number[];
}

export interface Course {
  id: number;
  title: string;
}

export interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}