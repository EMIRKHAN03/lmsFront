// services/announcementService.ts
import axios from 'axios';
import type { 
  AnnouncementRequest, 
  AnnouncementResponse, 
  AllAnnouncementResponse, 
  SimpleResponse,
  Group 
} from '@/types/announcement';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8088';

export class AnnouncementService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createAnnouncement(announcement: AnnouncementRequest): Promise<SimpleResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/announcement`,
        announcement,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async viewAnnouncement(id: number): Promise<AnnouncementResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/announcement/view/${id}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error viewing announcement:', error);
      throw error;
    }
  }

  async getAllAnnouncements(page = 1, size = 4, groupId?: number): Promise<AllAnnouncementResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      if (groupId) {
        params.append('groupId', groupId.toString());
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/announcement/search?${params}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  async publishAnnouncement(id: number, isPublished: boolean): Promise<SimpleResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/announcement/${id}?isPublished=${isPublished}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error publishing announcement:', error);
      throw error;
    }
  }

  async updateAnnouncement(id: number, announcement: AnnouncementRequest): Promise<SimpleResponse> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/announcement/${id}`,
        announcement,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  async deleteAnnouncement(id: number): Promise<SimpleResponse> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/announcement/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Метод для получения групп (предполагаем, что есть отдельный API)
  async getAllGroups(): Promise<Group[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/groups/all`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }
}

export const announcementService = new AnnouncementService();