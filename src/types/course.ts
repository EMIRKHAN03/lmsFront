export interface CourseResponse {
    id: number;
    title: string;
    description: string;
    image: string;
    dateOfEnd: string;
  }
  
  export interface FindAllResponseCourse {
    page: number;
    size: number;
    courses: CourseResponse[];
  }