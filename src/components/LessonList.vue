<template>
  <div class="lessons-container">
    <h2>{{ isLoading ? 'Загрузка уроков...' : 'Уроки курса' }}</h2>
    
    <div class="action-buttons">
      <button @click="showAddLessonModal = true" class="btn-add">
        Добавить урок
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="!isLoading && !lessonData.lessonResponses.length" class="no-lessons">
      В этом курсе пока нет уроков.
    </div>

    <div v-if="!isLoading && lessonData.lessonResponses.length" class="lessons-list">
      <LessonItem 
        v-for="lesson in lessonData.lessonResponses" 
        :key="lesson.id" 
        :lesson="lesson"
        :courseId="courseId"
        @edit="editLesson"
        @delete="confirmDelete"
      />
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        Предыдущая
      </button>
      
      <span class="page-info">{{ currentPage }} из {{ totalPages }}</span>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        Следующая
      </button>
    </div>

    <!-- Add Lesson Modal -->
    <div v-if="showAddLessonModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Добавить урок</h3>
        <form @submit.prevent="addLesson">
          <div class="form-group">
            <label for="title">Название урока</label>
            <input v-model="newLesson.title" id="title" required />
          </div>
          <div class="form-group">
            <label for="createdAt">Дата</label>
            <input v-model="newLesson.createdAt" type="date" id="createdAt" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddLessonModal = false" class="btn-cancel">
              Отмена
            </button>
            <button type="submit" class="btn-submit">
              Сохранить
            </button>
          </div>
        </form>
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
import lessonService from '@/services/lessonService';
import { AllLessonsResponse, LessonResponse } from '@/types/lesson';
import LessonItem from '@/components/LessonItem.vue';

export default defineComponent({
  name: 'LessonList',
  components: {
    LessonItem
  },
  props: {
    courseId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    
    const isLoading = ref(true);
    const error = ref('');
    const currentPage = ref(1);
    const itemsPerPage = ref(12);
    const totalItems = ref(0);
    const lessonData = ref<AllLessonsResponse>({
      page: 1,
      size: 0,
      lessonResponses: []
    });

    // UI state
    const showAddLessonModal = ref(false);
    const showEditLessonModal = ref(false);
    const showDeleteModal = ref(false);
    const deletingLessonId = ref<number | null>(null);
    
    // Form data
    const today = new Date().toISOString().split('T')[0];
    const newLesson = ref({
      title: '',
      createdAt: today
    });
    
    const editingLesson = ref({
      id: 0,
      title: '',
      createdAt: ''
    });

    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage.value) || 1;
    });

    const fetchLessons = async (page: number) => {
      isLoading.value = true;
      error.value = '';
      
      try {
        lessonData.value = await lessonService.getLessons(props.courseId, page, itemsPerPage.value);
        
        if (lessonData.value.lessonResponses.length === itemsPerPage.value) {
          totalItems.value = page * itemsPerPage.value + itemsPerPage.value;
        } else {
          totalItems.value = (page - 1) * itemsPerPage.value + lessonData.value.lessonResponses.length;
        }
      } catch (err) {
        error.value = 'Не удалось загрузить уроки. Попробуйте позже.';
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    const changePage = (page: number) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
      fetchLessons(page);
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    };

    const editLesson = (lesson: LessonResponse) => {
      // Convert date format for input field
      const date = new Date(lesson.createdAt);
      const formattedDate = date.toISOString().split('T')[0];
      
      editingLesson.value = {
        id: lesson.id,
        title: lesson.title,
        createdAt: formattedDate
      };
      showEditLessonModal.value = true;
    };

    const confirmDelete = (lessonId: number) => {
      deletingLessonId.value = lessonId;
      showDeleteModal.value = true;
    };

    const addLesson = async () => {
      try {
        await lessonService.addLesson(props.courseId, newLesson.value);
        showAddLessonModal.value = false;
        newLesson.value = { title: '', createdAt: today };
        fetchLessons(currentPage.value);
      } catch (err) {
        error.value = 'Не удалось добавить урок. Попробуйте позже.';
        console.error(err);
      }
    };

    const updateLesson = async () => {
      try {
        if (!editingLesson.value.id) return;
        
        await lessonService.updateLesson(
          editingLesson.value.id,
          {
            title: editingLesson.value.title,
            createdAt: editingLesson.value.createdAt
          }
        );
        showEditLessonModal.value = false;
        fetchLessons(currentPage.value);
      } catch (err) {
        error.value = 'Не удалось обновить урок. Попробуйте позже.';
        console.error(err);
      }
    };

    const deleteLesson = async () => {
      try {
        if (!deletingLessonId.value) return;
        
        await lessonService.deleteLesson(deletingLessonId.value);
        showDeleteModal.value = false;
        deletingLessonId.value = null;
        fetchLessons(currentPage.value);
      } catch (err) {
        error.value = 'Не удалось удалить урок. Попробуйте позже.';
        console.error(err);
      }
    };

    onMounted(() => {
      fetchLessons(currentPage.value);
    });

    return {
      isLoading,
      error,
      lessonData,
      currentPage,
      totalPages,
      changePage,
      formatDate,
      editLesson,
      confirmDelete,
      showAddLessonModal,
      showEditLessonModal,
      showDeleteModal,
      newLesson,
      editingLesson,
      addLesson,
      updateLesson,
      deleteLesson
    };
  }
});
</script>

<style scoped>
.lessons-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.action-buttons {
  margin-bottom: 20px;
  text-align: right;
}

.btn-add {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: #e53935;
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background-color: #ffebee;
  border-radius: 4px;
}

.no-lessons {
  text-align: center;
  margin: 40px 0;
  color: #666;
  font-size: 18px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #f5f5f5;
}

.page-info {
  margin: 0 15px;
  color: #666;
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

.btn-delete {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>