export interface InstructorResponse {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  phoneNumber: string;
}

export interface InstructorDetailResponse {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  phoneNumber: string;
  courseNames: string[];
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