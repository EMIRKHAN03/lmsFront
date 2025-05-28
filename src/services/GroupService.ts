import axios from 'axios';

// Types for Group API
export interface Group {
  id: number;
  title: string;
  description: string;
  image: string;
  dateOfStart: string;
  dateOfEnd: string;
}

export interface GroupRequest {
  title: string;
  description: string;
  image: string;
  dateOfEnd: string;
}

export interface AllGroupResponse {
  page: number;
  size: number;
  groupResponses: Group[];
}

export interface GroupWithoutPagination {
  id: number;
  groupName: string;
}

export interface SimpleResponse {
  httpStatus: string;
  message: string;
}

const API_BASE_URL = 'http://localhost:8088/api/groups';

// Configure axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const groupService = {
  /**
   * Create a new group
   */
  async createGroup(groupRequest: GroupRequest): Promise<SimpleResponse> {
    const response = await axios.post<SimpleResponse>(API_BASE_URL, groupRequest);
    return response.data;
  },

  /**
   * Update existing group
   */
  async updateGroup(groupId: number, groupRequest: GroupRequest): Promise<SimpleResponse> {
    const response = await axios.patch<SimpleResponse>(`${API_BASE_URL}/${groupId}`, groupRequest);
    return response.data;
  },

  /**
   * Get all groups with pagination
   */
  async getAllGroups(page: number = 1, size: number = 8): Promise<AllGroupResponse> {
    const response = await axios.get<AllGroupResponse>(API_BASE_URL, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Get all groups without pagination
   */
  async getAllGroupsWithoutPagination(): Promise<GroupWithoutPagination[]> {
    const response = await axios.get<GroupWithoutPagination[]>(`${API_BASE_URL}/getAll`);
    return response.data;
  },

  /**
   * Get group by ID
   */
  async getGroupById(groupId: number): Promise<Group> {
    const response = await axios.get<Group>(`${API_BASE_URL}/${groupId}`);
    return response.data;
  },

  /**
   * Delete group (move to trash)
   */
  async deleteGroup(groupId: number): Promise<SimpleResponse> {
    const response = await axios.delete<SimpleResponse>(`${API_BASE_URL}/${groupId}`);
    return response.data;
  }
};

export default groupService;