<template>
    <div class="task-view">
      <div v-if="isLoading" class="loading">
        Загрузка задания...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else class="task-content">
        <div class="task-header">
          <button @click="goBack" class="back-button">← Назад к урокам</button>
          
          <div class="task-title-section">
            <h1>{{ task.title }}</h1>
            <div class="deadline-info" :class="deadlineClass">
              <span class="deadline-label">Крайний срок:</span>
              <span class="deadline-value">{{ formatDeadline(task.deadline) }}</span>
            </div>
          </div>
          
          <div class="instructor-actions">
            <button @click="showEditTaskModal = true" class="btn-edit">
              Редактировать задание
            </button>
            <button @click="showDeleteModal = true" class="btn-delete">
              Удалить задание
            </button>
          </div>
        </div>
        
        <div class="task-body">
          <div class="task-description">
            <h3>Описание задания</h3>
            <div class="description-content">{{ task.description }}</div>
          </div>
          
          <div v-if="task.code" class="task-code">
            <h3>Код</h3>
            <pre class="code-block"><code>{{ task.code }}</code></pre>
          </div>
          
          <div v-if="task.file || task.image || task.links.length" class="task-attachments">
            <h3>Материалы</h3>
            
            <div v-if="task.file" class="attachment-item">
              <span class="attachment-icon">📎</span>
              <a :href="task.file" target="_blank" class="attachment-link">
                Скачать файл
              </a>
            </div>
            
            <div v-if="task.image" class="attachment-item">
              <span class="attachment-icon">🖼️</span>
              <a :href="task.image" target="_blank" class="attachment-link">
                Открыть изображение
              </a>
              <div class="image-preview">
                <img :src="task.image" :alt="task.title" @error="handleImageError" />
              </div>
            </div>
            
            <div v-if="task.links.length" class="links-section">
              <h4>Полезные ссылки:</h4>
              <ul class="links-list">
                <li v-for="(link, index) in task.links" :key="index">
                  <a :href="link" target="_blank" class="task-link">{{ link }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Edit Task Modal -->
      <div v-if="showEditTaskModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>Редактировать задание</h3>
          <TaskForm 
            :initialData="task"
            @submit="updateTask"
            @cancel="showEditTaskModal = false"
            submitButtonText="Обновить задание"
          />
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>Подтверждение удаления</h3>
          <p>Вы уверены, что хотите удалить задание "{{ task.title }}"?</p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="btn-cancel">
              Отмена
            </button>
            <button @click="deleteTask" class="btn-delete">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '@/composables/useAuth';
  import taskService from '@/services/taskService';
  import { TaskResponse, TaskRequest } from '@/types/task';
  import TaskForm from '@/components/TaskForm.vue';
  
  export default defineComponent({
    name: 'TaskView',
    components: {
      TaskForm
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const { user } = useAuth();
      
      const isLoading = ref(true);
      const error = ref('');
      const task = ref<TaskResponse>({
        id: 0,
        title: '',
        description: '',
        deadline: '',
        links: []
      });
      
      // UI state
      const showEditTaskModal = ref(false);
      const showDeleteModal = ref(false);
      
      const taskId = computed(() => Number(route.params.taskId));
      const lessonId = computed(() => Number(route.params.lessonId));
      const courseId = computed(() => Number(route.params.courseId));
      
      const canEdit = computed(() => {
        return user.value?.role === 'INSTRUCTOR';
      });
      
      const deadlineClass = computed(() => {
        const now = new Date();
        const deadline = new Date(task.value.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (daysDiff < 0) return 'deadline-passed';
        if (daysDiff < 1) return 'deadline-urgent';
        if (daysDiff < 3) return 'deadline-soon';
        return 'deadline-normal';
      });
      
      const formatDeadline = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const timeDiff = date.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const formattedDate = date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        if (daysDiff < 0) return `Просрочено (${formattedDate})`;
        if (daysDiff === 0) return `Сегодня (${formattedDate})`;
        if (daysDiff === 1) return `Завтра (${formattedDate})`;
        if (daysDiff < 7) return `Через ${daysDiff} дн. (${formattedDate})`;
        return formattedDate;
      };
      
      const fetchTask = async () => {
        isLoading.value = true;
        error.value = '';
        
        try {
          task.value = await taskService.getTask(taskId.value);
        } catch (err) {
          error.value = 'Не удалось загрузить задание. Попробуйте позже.';
          console.error(err);
        } finally {
          isLoading.value = false;
        }
      };
      
      const goBack = () => {
        router.push(`/course/${courseId.value}/lesson/${lessonId.value}`);
      };
      
      const updateTask = async (taskData: TaskRequest) => {
        try {
          await taskService.updateTask(taskId.value, taskData);
          showEditTaskModal.value = false;
          fetchTask();
        } catch (err) {
          error.value = 'Не удалось обновить задание. Попробуйте позже.';
          console.error(err);
        }
      };
      
      const deleteTask = async () => {
        try {
          await taskService.deleteTask(taskId.value);
          router.push(`/course/${courseId.value}/lesson/${lessonId.value}`);
        } catch (err) {
          error.value = 'Не удалось удалить задание. Попробуйте позже.';
          console.error(err);
          showDeleteModal.value = false;
        }
      };
      
      const closeModal = () => {
        showEditTaskModal.value = false;
        showDeleteModal.value = false;
      };
      
      const handleImageError = (event: Event) => {
        const img = event.target as HTMLImageElement;
        img.style.display = 'none';
      };
      
      onMounted(() => {
        fetchTask();
      });
      
      return {
        isLoading,
        error,
        task,
        canEdit,
        deadlineClass,
        showEditTaskModal,
        showDeleteModal,
        formatDeadline,
        goBack,
        updateTask,
        deleteTask,
        closeModal,
        handleImageError
      };
    }
  });
  </script>
  
  <style scoped>
  .task-view {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .loading {
    text-align: center;
    font-size: 18px;
    color: #666;
    margin: 40px 0;
  }
  
  .error-message {
    color: #e53935;
    text-align: center;
    margin: 20px 0;
    padding: 15px;
    background-color: #ffebee;
    border-radius: 4px;
  }
  
  .task-header {
    margin-bottom: 30px;
  }
  
  .back-button {
    background: none;
    border: none;
    color: #2196f3;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 20px;
    padding: 5px 0;
    transition: color 0.3s;
  }
  
  .back-button:hover {
    color: #1976d2;
  }
  
  .task-title-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  
  .task-title-section h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
    flex-grow: 1;
    margin-right: 20px;
  }
  
  .deadline-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 10px 15px;
    border-radius: 8px;
    min-width: 200px;
  }
  
  .deadline-label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  .deadline-value {
    font-size: 16px;
    font-weight: 600;
  }
  
  .deadline-normal {
    background-color: #e8f5e8;
    color: #2e7d32;
  }
  
  .deadline-soon {
    background-color: #fff3e0;
    color: #f57c00;
  }
  
  .deadline-urgent {
    background-color: #ffebee;
    color: #d32f2f;
  }
  
  .deadline-passed {
    background-color: #f3e5f5;
    color: #7b1fa2;
  }
  
  .instructor-actions {
    display: flex;
    gap: 10px;
  }
  
  .btn-edit {
    background-color: #2196f3;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .btn-edit:hover {
    background-color: #1976d2;
  }
  
  .btn-delete {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .btn-delete:hover {
    background-color: #d32f2f;
  }
  
  .task-body {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  
  .task-description h3,
  .task-code h3,
  .task-attachments h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 20px;
  }
  
  .description-content {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
  }
  
  .code-block {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .task-attachments {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
  }
  
  .attachment-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .attachment-icon {
    font-size: 20px;
  }
  
  .attachment-link {
    color: #2196f3;
    text-decoration: none;
    font-weight: 500;
  }
  
  .attachment-link:hover {
    text-decoration: underline;
  }
  
  .image-preview {
    margin-top: 10px;
    width: 100%;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .links-section {
    margin-top: 20px;
  }
  
  .links-section h4 {
    color: #333;
    margin-bottom: 10px;
  }
  
  .links-list {
    list-style: none;
    padding: 0;
  }
  
  .links-list li {
    margin-bottom: 8px;
  }
  
  .task-link {
    color: #2196f3;
    text-decoration: none;
    word-break: break-all;
  }
  
  .task-link:hover {
    text-decoration: underline;
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    overflow-y: auto;
    padding: 20px;
  }
  
  .modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-content h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }
  
  .modal-actions {
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
    transition: background-color 0.3s;
  }
  
  .btn-cancel:hover {
    background-color: #757575;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .task-title-section {
      flex-direction: column;
      gap: 15px;
    }
    
    .task-title-section h1 {
      margin-right: 0;
    }
    
    .deadline-info {
      align-items: flex-start;
      min-width: auto;
      width: 100%;
    }
    
    .instructor-actions {
      flex-direction: column;
    }
    
    .attachment-item {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  </style>