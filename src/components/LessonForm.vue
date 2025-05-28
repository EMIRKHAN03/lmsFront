<template>
    <div class="lesson-form">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="title">Название урока</label>
          <input 
            v-model="formData.title" 
            id="title" 
            type="text"
            required
            class="form-control"
            placeholder="Введите название урока"
          />
        </div>
        
        <div class="form-group">
          <label for="createdAt">Дата</label>
          <input 
            v-model="formData.createdAt" 
            id="createdAt" 
            type="date"
            required
            class="form-control"
          />
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            @click="$emit('cancel')" 
            class="btn-cancel"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            class="btn-submit"
          >
            {{ submitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, reactive, toRefs, onMounted, watch } from 'vue';
  
  export default defineComponent({
    name: 'LessonForm',
    props: {
      initialData: {
        type: Object,
        default: () => ({
          title: '',
          createdAt: new Date().toISOString().split('T')[0]
        })
      },
      submitButtonText: {
        type: String,
        default: 'Сохранить'
      }
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
      const formData = reactive({
        title: '',
        createdAt: ''
      });
      
      // Initialize form with provided data
      const initializeForm = () => {
        formData.title = props.initialData.title;
        formData.createdAt = props.initialData.createdAt;
      };
      
      // Watch for changes in props and update form
      watch(() => props.initialData, () => {
        initializeForm();
      }, { deep: true });
      
      const submitForm = () => {
        emit('submit', { ...formData });
      };
      
      onMounted(() => {
        initializeForm();
      });
      
      return {
        formData,
        submitForm
      };
    }
  });
  </script>
  
  <style scoped>
  .lesson-form {
    width: 100%;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
  }
  
  .form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.3s;
  }
  
  .form-control:focus {
    outline: none;
    border-color: #4a6bff;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .btn-cancel {
    background-color: #9e9e9e;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .btn-cancel:hover {
    background-color: #757575;
  }
  
  .btn-submit {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .btn-submit:hover {
    background-color: #43a047;
  }
  </style>