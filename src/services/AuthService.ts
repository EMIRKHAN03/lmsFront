import axios from 'axios';
import type { SignInRequest, SignInResponse, SimpleResponse } from '@/types/auth';

const API_URL = 'http://localhost:8088/api/auth';

export default class AuthService {
  static async signIn(request: SignInRequest): Promise<SignInResponse> {
    const response = await axios.post<SignInResponse>(`${API_URL}/signIn`, request);
    return response.data;
  }

  static async forgotPassword(email: string, link: string): Promise<SimpleResponse> {
    const response = await axios.put<SimpleResponse>(
      `${API_URL}/forgotPassword?email=${encodeURIComponent(email)}&link=${encodeURIComponent(link)}`
    );
    return response.data;
  }

  static async createPassword(
    password: string,
    confirm: string,
    uuid: string
  ): Promise<SimpleResponse> {
    const response = await axios.post<SimpleResponse>(
      `${API_URL}/createPassword?password=${encodeURIComponent(password)}&confirm=${encodeURIComponent(
        confirm
      )}&uuid=${encodeURIComponent(uuid)}`
    );
    return response.data;
  }
}