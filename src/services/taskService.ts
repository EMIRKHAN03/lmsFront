import axios from 'axios';
import { TaskRequest, TaskResponse, AllTaskResponse, SimpleResponse } from '../types/task';

const API_BASE_URL = 'http://localhost:8088/api';

class TaskService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createTask(lessonId: number, taskData: TaskRequest): Promise<SimpleResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/tasks/${lessonId}`,
      taskData,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getTask(taskId: number): Promise<TaskResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/tasks/${taskId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updateTask(taskId: number, taskData: TaskRequest): Promise<SimpleResponse> {
    const response = await axios.patch(
      `${API_BASE_URL}/tasks/${taskId}`,
      taskData,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async deleteTask(taskId: number): Promise<SimpleResponse> {
    const response = await axios.delete(
      `${API_BASE_URL}/tasks/${taskId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getTasksByLesson(lessonId: number): Promise<AllTaskResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/tasks/taskOfLesson/${lessonId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export default new TaskService();