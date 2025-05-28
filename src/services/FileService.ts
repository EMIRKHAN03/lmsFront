// services/FileService.ts
import axios from 'axios';
import type { AwsResponse, SimpleResponse } from '@/types/file';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8088';

class FileService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };
  }

  private getDownloadHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'responseType': 'blob' as const
    };
  }

  async uploadFile(file: File): Promise<AwsResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/file`, formData, {
      headers: this.getAuthHeaders()
    });

    return response.data;
  }

  async deleteFile(fileName: string): Promise<SimpleResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/file/${fileName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  }

  async downloadFile(fileName: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/file/download/${fileName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    });

    return response.data;
  }

  getFileUrl(fileName: string): string {
    // Assuming your backend provides direct URL access
    return `${API_BASE_URL}/file/${fileName}`;
  }
}

export default new FileService();