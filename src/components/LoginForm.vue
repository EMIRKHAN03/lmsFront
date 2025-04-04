<template>
    <div class="login-form">
      <h2>Вход в систему</h2>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="login">Email:</label>
          <input
            id="login"
            v-model="form.login"
            type="email"
            class="form-control"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            required
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
          <a href="#" @click.prevent="forgotPasswordMode = true">Забыли пароль?</a>
        </div>
      </form>
      
      <div v-if="forgotPasswordMode" class="forgot-password-form">
        <h3>Восстановление пароля</h3>
        <form @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              id="email"
              v-model="forgotPasswordEmail"
              type="email"
              class="form-control"
              required
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Отправка...' : 'Отправить ссылку' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="forgotPasswordMode = false">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, reactive, ref } from 'vue';
  import { useAuth } from '@/composables/useAuth';
  import type { SignInRequest } from '@/types/auth';
  
  export default defineComponent({
    name: 'LoginForm',
    setup() {
      const { loading, error, success, signIn, forgotPassword } = useAuth();
      
      const form = reactive<SignInRequest>({
        login: '',
        password: ''
      });
      
      const forgotPasswordMode = ref(false);
      const forgotPasswordEmail = ref('');
      
      const handleSubmit = async () => {
        await signIn(form);
      };
      
      const handleForgotPassword = async () => {
        // The frontend origin for password reset link
        const resetLink = `${window.location.origin}/reset-password`;
        await forgotPassword(forgotPasswordEmail.value, resetLink);
        if (!error.value) {
          forgotPasswordMode.value = false;
        }
      };
      
      return {
        form,
        loading,
        error,
        success,
        forgotPasswordMode,
        forgotPasswordEmail,
        handleSubmit,
        handleForgotPassword
      };
    }
  });
  </script>
  
  <style scoped>
  .login-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }
  
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-primary:disabled {
    background-color: #6c757d;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }
  
  .alert {
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
  }
  
  .alert-danger {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }
  
  .alert-success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }
  
  .forgot-password-form {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  }
  </style>