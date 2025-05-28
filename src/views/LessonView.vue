<template>
  <div class="lesson-view">
    <div v-if="isLoading" class="loading">
      Загрузка урока...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else class="lesson-content">
      <div class="lesson-header">
        <button @click="goBack" class="back-button">← Назад к урокам</button>
        <h1>{{ lesson.title }}</h1>
        <p class="date">Дата создания: {{ formatDate(lesson.createdAt) }}</p>
        
        <div class="instructor-actions" v-if="canEdit">
          <button @click="showEditLessonModal = true" class="btn-edit">
            Редактировать урок
          </button>
          <button @click="showDeleteModal = true" class="btn-delete">
            Удалить урок
          </button>
        </div>
      </div>
      
      <div class="tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          Обзор
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'tasks' }"
          @click="activeTab = 'tasks'"
        >
          Задания
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'overview'" class="overview-tab">
          <div class="lesson-body">
            <p class="placeholder">
              Здесь будет отображаться содержимое урока. В текущей реализации вы можете добавить 
              компоненты для отображения материалов урока, таких как текст, видео, вложения и т.д.
            </p>
          </div>
        </div>
        
        <div v-if="activeTab === 'tasks'" class="tasks-tab">
          <TaskList 
            :lessonId="lessonId" 
            :courseId="courseId"
          />
        </div>
      </div>
    </div>

    <!-- Edit Lesson Modal -->
    <div v-if="showEditLessonModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Редактировать урок</h3>
        <form @submit.prevent="updateLesson">
          <div class="form-group">
            <label for="edit-title">Название урока</label>
            <input v-model="editingLesson.title" id="edit-title" required />
          </div>
          <div class="form-group">
            <label for="edit-createdAt">Дата</label>
            <input v-model="editingLesson.createdAt" type="date" id="edit-createdAt" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditLessonModal = false" class="btn-cancel">
              Отмена
            </button>
            <button type="submit" class="btn-submit">
              Обновить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить этот урок?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-cancel">
            Отмена
          </button>
          <button @click="deleteLesson" class="btn-delete">
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
import lessonService from '@/services/lessonService';
import { LessonResponse } from '@/types/lesson';
import TaskList from '@/components/TaskList.vue';


export default defineComponent({
  name: 'LessonView',
  components: {
    TaskList
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { user } = useAuth();
    
    const lessonId = computed(() => Number(route.params.lessonId));
    const courseId = computed(() => Number(route.params.courseId));
    
    const isLoading = ref(true);
    const error = ref('');
    const activeTab = ref('overview');
    const lesson = ref<LessonResponse>({
      id: 0,
      title: '',
      createdAt: ''
    });
    
    // UI state
    const showEditLessonModal = ref(false);
    const showDeleteModal = ref(false);
    
    // Form data
    const editingLesson = ref({
      title: '',
      createdAt: ''
    });

    const canEdit = computed(() => {
      return user.value?.role === 'INSTRUCTOR';
    });

    const fetchLesson = async () => {
      isLoading.value = true;
      error.value = '';
      
      try {
        lesson.value = await lessonService.getLesson(lessonId.value);
        
        // Prepare editing form with current values
        const date = new Date(lesson.value.createdAt);
        const formattedDate = date.toISOString().split('T')[0];
        
        editingLesson.value = {
          title: lesson.value.title,
          createdAt: formattedDate
        };
      } catch (err) {
        error.value = 'Не удалось загрузить урок. Попробуйте позже.';
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    };

    const goBack = () => {
      router.push(`/course/${courseId.value}`);
    };

    const updateLesson = async () => {
      try {
        await lessonService.updateLesson(
          lessonId.value,
          editingLesson.value
        );
        showEditLessonModal.value = false;
        fetchLesson(); // Refresh lesson data
      } catch (err) {
        error.value = 'Не удалось обновить урок. Попробуйте позже.';
        console.error(err);
      }
    };

    const deleteLesson = async () => {
      try {
        await lessonService.deleteLesson(lessonId.value);
        showDeleteModal.value = false;
        router.push(`/course/${courseId.value}`);
      } catch (err) {
        error.value = 'Не удалось удалить урок. Попробуйте позже.';
        console.error(err);
      }
    };

    onMounted(() => {
      fetchLesson();
    });

    return {
      isLoading,
      error,
      lesson,
      activeTab,
      lessonId,
      courseId,
      canEdit,
      formatDate,
      goBack,
      showEditLessonModal,
      showDeleteModal,
      editingLesson,
      updateLesson,
      deleteLesson
    };
  }
});
</script>

<style scoped>
.lesson-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error-message {
  color: #e53935;
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background-color: #ffebee;
  border-radius: 4px;
}

.lesson-header {
  margin-bottom: 30px;
}

.back-button {
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  margin-bottom: 10px;
  display: block;
}

.back-button:hover {
  text-decoration: underline;
}

.lesson-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #333;
}

.date {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.instructor-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-edit {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: #2196f3;
  border-bottom: 2px solid #2196f3;
}

.tab-button:hover:not(.active) {
  color: #555;
  background-color: #f5f5f5;
}

.tab-content {
  background-color: white;
  min-height: 400px;
}

.overview-tab {
  padding: 20px 0;
}

.lesson-body {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.placeholder {
  color: #999;
  text-align: center;
  padding: 40px;
  line-height: 1.6;
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
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>