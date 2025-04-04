import { ref } from 'vue';
import AuthService from '@/services/AuthService';
import type { SignInRequest, SignInResponse, SimpleResponse } from '@/types/auth';
import { useRouter } from 'vue-router';

export function useAuth() {
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);
  const user = ref<SignInResponse | null>(null);
  const router = useRouter();

  const signIn = async (request: SignInRequest) => {
    try {
      loading.value = true;
      error.value = null;
      success.value = null;
      
      const response = await AuthService.signIn(request);
      user.value = response;
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      success.value = response.message;
      
      // Redirect based on role
      if (response.role === 'ADMIN') {
        router.push('/admin');
      } else if (response.role === 'INSTRUCTOR') {
        router.push('/instructor');
      } else {
        router.push('/student');
      }
      
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка при входе в систему';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const forgotPassword = async (email: string, link: string) => {
    try {
      loading.value = true;
      error.value = null;
      success.value = null;
      
      const response = await AuthService.forgotPassword(email, link);
      success.value = response.message;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка при отправке ссылки для восстановления пароля';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createPassword = async (password: string, confirm: string, uuid: string) => {
    try {
      loading.value = true;
      error.value = null;
      success.value = null;
      
      const response = await AuthService.createPassword(password, confirm, uuid);
      success.value = response.message;
      
      // Redirect to login after successful password creation
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка при создании пароля';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user.value = null;
    router.push('/login');
  };

  return {
    loading,
    error,
    success,
    user,
    signIn,
    forgotPassword,
    createPassword,
    logout
  };
}