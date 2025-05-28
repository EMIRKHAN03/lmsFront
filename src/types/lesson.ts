export interface LessonResponse {
    id: number;
    title: string;
    createdAt: string;
  }
  
  export interface AllLessonsResponse {
    page: number;
    size: number;
    lessonResponses: LessonResponse[];
  }