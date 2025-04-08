import axios from 'axios';
import { Course } from '@/types/instructor'; // Adjust this path

const API_URL = 'http://localhost:8088/api';

export const courseService = {
  /**
   * Fetch all available courses
   */
  async getAllCourses(): Promise<Course[]> {
    const response = await axios.get(`${API_URL}/courses/all`);
    return response.data;
  }
};

export default courseService;