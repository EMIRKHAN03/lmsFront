<template>
    <div class="tasks-container">
      <div class="tasks-header">
        <h2>{{ isLoading ? 'Загрузка заданий...' : 'Задания урока' }}</h2>
        
        <div class="action-buttons">
          <button @click="showAddTaskModal = true" class="btn-add">
            Добавить задание
          </button>
        </div>
      </div>
  
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
  
      <div v-if="!isLoading && !taskData.taskResponse.length" class="no-tasks">
        В этом уроке пока нет заданий.
      </div>
  
      <div v-if="!isLoading && taskData.taskResponse.length" class="tasks-list">
        <TaskItem 
          v-for="task in taskData.taskResponse" 
          :key="task.id" 
          :task="task"
          :lessonId="lessonId"
          :courseId="courseId"
          @edit="editTask"
          @delete="confirmDelete"
        />
      </div>
  
      <!-- Add Task Modal -->
      <div v-if="showAddTaskModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Добавить задание</h3>
          <TaskForm 
            @submit="addTask"
            @cancel="showAddTaskModal = false"
            submitButtonText="Создать задание"
          />
        </div>
      </div>
  
      <!-- Edit Task Modal -->
      <div v-if="showEditTaskModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Редактировать задание</h3>
          <TaskForm 
            :initialData="editingTask"
            @submit="updateTask"
            @cancel="showEditTaskModal = false"
            submitButtonText="Обновить задание"
          />
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Подтверждение удаления</h3>
          <p>Вы уверены, что хотите удалить это задание?</p>
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
  import { useAuth } from '@/composables/useAuth';
  import taskService from '@/services/taskService';
  import { AllTaskResponse, TaskResponse, TaskRequest } from '@/types/task';
  import TaskItem from '@/components/TaskItem.vue';
  import TaskForm from '@/components/TaskForm.vue';
  
  export default defineComponent({
    name: 'TaskList',
    components: {
      TaskItem,
      TaskForm
    },
    props: {
      lessonId: {
        type: Number,
        required: true
      },
      courseId: {
        type: Number,
        required: true
      }
    },
    setup(props) {
      const { user } = useAuth();
      
      const isLoading = ref(true);
      const error = ref('');
      const taskData = ref<AllTaskResponse>({
        taskResponse: []
      });
  
      // UI state
      const showAddTaskModal = ref(false);
      const showEditTaskModal = ref(false);
      const showDeleteModal = ref(false);
      const deletingTaskId = ref<number | null>(null);
      const editingTask = ref<TaskResponse | null>(null);
  
      const canEdit = computed(() => {
        return user.value?.role === 'INSTRUCTOR';
      });
  
      const fetchTasks = async () => {
        isLoading.value = true;
        error.value = '';
        
        try {
          taskData.value = await taskService.getTasksByLesson(props.lessonId);
        } catch (err) {
          error.value = 'Не удалось загрузить задания. Попробуйте позже.';
          console.error(err);
        } finally {
          isLoading.value = false;
        }
      };
  
      const editTask = (task: TaskResponse) => {
        editingTask.value = task;
        showEditTaskModal.value = true;
      };
  
      const confirmDelete = (taskId: number) => {
        deletingTaskId.value = taskId;
        showDeleteModal.value = true;
      };
  
      const addTask = async (taskData: TaskRequest) => {
        try {
          await taskService.createTask(props.lessonId, taskData);
          showAddTaskModal.value = false;
          fetchTasks();
        } catch (err) {
          error.value = 'Не удалось добавить задание. Попробуйте позже.';
          console.error(err);
        }
      };
  
      const updateTask = async (taskData: TaskRequest) => {
        try {
          if (!editingTask.value?.id) return;
          
          await taskService.updateTask(editingTask.value.id, taskData);
          showEditTaskModal.value = false;
          editingTask.value = null;
          fetchTasks();
        } catch (err) {
          error.value = 'Не удалось обновить задание. Попробуйте позже.';
          console.error(err);
        }
      };
  
      const deleteTask = async () => {
        try {
          if (!deletingTaskId.value) return;
          
          await taskService.deleteTask(deletingTaskId.value);
          showDeleteModal.value = false;
          deletingTaskId.value = null;
          fetchTasks();
        } catch (err) {
          error.value = 'Не удалось удалить задание. Попробуйте позже.';
          console.error(err);
        }
      };
  
      onMounted(() => {
        fetchTasks();
      });
  
      return {
        isLoading,
        error,
        taskData,
        canEdit,
        showAddTaskModal,
        showEditTaskModal,
        showDeleteModal,
        editingTask,
        editTask,
        confirmDelete,
        addTask,
        updateTask,
        deleteTask
      };
    }
  });
  </script>
  
  <style scoped>
  .tasks-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .tasks-header h2 {
    margin: 0;
    color: #333;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
  }
  
  .btn-add {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .btn-add:hover {
    background-color: #43a047;
  }
  
  .error-message {
    color: #e53935;
    text-align: center;
    margin: 20px 0;
    padding: 15px;
    background-color: #ffebee;
    border-radius: 4px;
  }
  
  .no-tasks {
    text-align: center;
    margin: 40px 0;
    color: #666;
    font-size: 18px;
  }
  
  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
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
  }
  
  .btn-delete {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>