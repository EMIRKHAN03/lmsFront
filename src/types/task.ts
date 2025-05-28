export interface TaskRequest {
    title: string;
    description: string;
    file?: string;
    image?: string;
    code?: string;
    deadline: string; // ISO datetime string
    links: string[];
  }
  
  export interface TaskResponse {
    id: number;
    title: string;
    description: string;
    file?: string;
    image?: string;
    code?: string;
    deadline: string;
    links: string[];
  }
  
  export interface AllTaskResponse {
    taskResponse: TaskResponse[];
  }
  
  export interface SimpleResponse {
    httpStatus: string;
    message: string;
  }