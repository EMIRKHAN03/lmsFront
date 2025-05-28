
// types/announcement.ts
export interface AnnouncementRequest {
    announcementContent: string;
    expirationDate: string;
    targetGroupIds: number[];
    publishedDate: string;
  }
  
  export interface AnnouncementResponse {
    id: number;
    content: string;
    owner: string;
    groupNames: string[];
    publishDate: string;
    endDate: string;
    isPublished: boolean;
  }
  
  export interface AllAnnouncementResponse {
    page: number;
    size: number;
    announcements: AnnouncementResponse[];
  }
  
  export interface SimpleResponse {
    httpStatus: string;
    message: string;
  }
  
  export interface Group {
    id: number;
    title: string;
  }