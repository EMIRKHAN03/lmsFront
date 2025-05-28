import axios from 'axios';
import { AllLessonsResponse, LessonResponse } from '@/types/lesson';

const API_URL = 'http://localhost:8088/api/lessons'; // Base URL for API calls

export default {
  async getLessons(courseId: number, page = 1, size = 12): Promise<AllLessonsResponse> {
    try {
      const response = await axios.get(`${API_URL}/all/${courseId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  async getLesson(lessonId: number): Promise<LessonResponse> {
    try {
      const response = await axios.get(`${API_URL}/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson details:', error);
      throw error;
    }
  },

  async addLesson(courseId: number, lessonData: { title: string; createdAt: string }): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/${courseId}`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  },

  async updateLesson(lessonId: number, lessonData: { title: string; createdAt: string }): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/${lessonId}`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  async deleteLesson(lessonId: number): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }
};
