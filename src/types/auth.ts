export interface SignInRequest {
    login: string;
    password: string;
  }
  
  export interface SignInResponse {
    id: number;
    token: string;
    email: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    httpStatus: string;
    message: string;
  }
  
  export interface SimpleResponse {
    httpStatus: string;
    message: string;
  }