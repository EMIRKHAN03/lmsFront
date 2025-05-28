import axios from 'axios';
import { FindAllResponseCourse } from '@/types/course';

const API_URL = 'http://localhost:8088/api/course'; // Base URL for API calls

export default {
  async getCourse(page = 1, size = 8): Promise<FindAllResponseCourse> {
    try {
      const response = await axios.get(`${API_URL}/myCourse`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }
};
