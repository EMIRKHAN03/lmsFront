import axios from 'axios';
import { 
  InstructorResponse, 
  InstructorDetailResponse, 
  InstructorRequest,
  InstructorUpdateRequest
} from '@/types/instructor'; // Adjust this path

const API_URL = 'http://localhost:8088/api';

export const instructorService = {
  /**
   * Fetch all instructors with pagination
   */
  async getInstructors(page: number, size: number): Promise<{
    instructorResponses: InstructorResponse[];
    page: number;
    totalSize?: number;
  }> {
    const response = await axios.get(`${API_URL}/instructors`, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Get instructor details by ID
   */
  async getInstructorById(id: number): Promise<InstructorDetailResponse> {
    const response = await axios.get(`${API_URL}/instructors/${id}`);
    return response.data;
  },

  /**
   * Add new instructor
   */
  async addInstructor(instructor: InstructorRequest, linkForPassword: string): Promise<void> {
    await axios.post(`${API_URL}/instructors`, instructor, {
      params: { linkForPassword }
    });
  },

  /**
   * Update instructor
   */
  async updateInstructor(id: number, instructor: InstructorUpdateRequest): Promise<void> {
    await axios.patch(`${API_URL}/instructors/${id}`, instructor);
  },

  /**
   * Delete instructor
   */
  async deleteInstructor(id: number): Promise<void> {
    await axios.delete(`${API_URL}/instructors/${id}`);
  }
};

export default instructorService;