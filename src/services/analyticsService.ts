import axios from 'axios';
import type { AnalyticsData } from '@/types/analytics';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8088';

export class AnalyticsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllAnalytics(): Promise<AnalyticsData[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/analytics/getAllAnalytics`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();