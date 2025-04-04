<template>
    <div class="reset-password-form">
      <h2>Установка нового пароля</h2>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div v-if="success" class="alert alert-success">
        {{ success }}
        <div class="redirect-message">
          Перенаправление на страницу входа...
        </div>
      </div>
      
      <form v-if="!success" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="password">Новый пароль:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            required
          />
          <small class="form-text text-muted">
            Пароль должен содержать минимум 8 символов, включая цифры и буквы.
          </small>
        </div>
        
        <div class="form-group">
          <label for="confirm">Подтвердите пароль:</label>
          <input
            id="confirm"
            v-model="confirm"
            type="password"
            class="form-control"
            required
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading || !isValidForm">
            {{ loading ? 'Сохранение...' : 'Сохранить пароль' }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { useAuth } from '@/composables/useAuth';
  import { useRoute } from 'vue-router';
  
  export default defineComponent({
    name: 'ResetPasswordForm',
    setup() {
      const { loading, error, success, createPassword } = useAuth();
      const route = useRoute();
      
      const password = ref('');
      const confirm = ref('');
      const uuid = ref('');
      
      onMounted(() => {
        // Get UUID from URL
        uuid.value = route.params.uuid as string;
        
        if (!uuid.value) {
          error.value = 'Недействительная ссылка для сброса пароля';
        }
      });
      
      const isValidForm = computed(() => {
        return password.value.length >= 8 && password.value === confirm.value;
      });
      
      const handleSubmit = async () => {
        if (!isValidForm.value) {
          if (password.value !== confirm.value) {
            error.value = 'Пароли не совпадают';
          } else {
            error.value = 'Пароль должен содержать минимум 8 символов';
          }
          return;
        }
        
        await createPassword(password.value, confirm.value, uuid.value);
      };
      
      return {
        password,
        confirm,
        loading,
        error,
        success,
        isValidForm,
        handleSubmit
      };
    }
  });
  </script>
  
  <style scoped>
  .reset-password-form {
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
  
  .form-text {
    font-size: 0.85em;
    margin-top: 5px;
  }
  
  .form-actions {
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
  
  .redirect-message {
    margin-top: 10px;
    font-style: italic;
  }
  </style>