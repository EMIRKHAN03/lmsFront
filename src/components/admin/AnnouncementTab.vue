<template>
    <div class="announcement-tab">
      <div class="announcement-header">
        <h2>Управление объявлениями</h2>
        <button @click="showCreateModal = true" class="create-btn">
          <Plus size="20" />
          Создать объявление
        </button>
      </div>
  
      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Группа:</label>
          <select v-model="selectedGroupId" @change="loadAnnouncements">
            <option value="">Все группы</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.title }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Размер страницы:</label>
          <select v-model="pageSize" @change="loadAnnouncements">
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка объявлений...</p>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="loadAnnouncements" class="retry-btn">Повторить</button>
      </div>
  
      <!-- Announcements List -->
      <div v-else-if="announcements.length > 0" class="announcements-container">
        <div v-for="announcement in announcements" :key="announcement.id" class="announcement-card">
          <div class="announcement-header-card">
            <div class="announcement-info">
              <h3>{{ announcement.content.substring(0, 50) }}{{ announcement.content.length > 50 ? '...' : '' }}</h3>
              <p class="owner">Автор: {{ announcement.owner }}</p>
            </div>
            <div class="announcement-actions">
              <button 
                @click="viewAnnouncement(announcement)" 
                class="action-btn view-btn"
                title="Просмотреть"
              >
                <Eye size="16" />
              </button>
              <button 
                @click="editAnnouncement(announcement)" 
                class="action-btn edit-btn"
                title="Редактировать"
              >
                <Edit size="16" />
              </button>
              <button 
                @click="togglePublish(announcement)" 
                class="action-btn"
                :class="announcement.isPublished ? 'unpublish-btn' : 'publish-btn'"
                :title="announcement.isPublished ? 'Снять с публикации' : 'Опубликовать'"
              >
                <component :is="announcement.isPublished ? EyeOff : Eye" size="16" />
              </button>
              <button 
                @click="deleteAnnouncement(announcement.id)" 
                class="action-btn delete-btn"
                title="Удалить"
              >
                <Trash2 size="16" />
              </button>
            </div>
          </div>
          
          <div class="announcement-details">
            <div class="groups">
              <strong>Группы:</strong> 
              <span v-if="announcement.groupNames.length > 0">
                {{ announcement.groupNames.join(', ') }}
              </span>
              <span v-else class="no-groups">Не назначено</span>
            </div>
            <div class="dates">
              <span class="date">
                <Calendar size="14" />
                Опубликовано: {{ formatDate(announcement.publishDate) }}
              </span>
              <span class="date">
                <Clock size="14" />
                Истекает: {{ formatDate(announcement.endDate) }}
              </span>
            </div>
            <div class="status">
              <span 
                class="status-badge"
                :class="announcement.isPublished ? 'published' : 'draft'"
              >
                {{ announcement.isPublished ? 'Опубликовано' : 'Черновик' }}
              </span>
            </div>
          </div>
        </div>
  
        <!-- Pagination -->
        <div class="pagination">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage <= 1"
            class="page-btn"
          >
            <ChevronLeft size="16" />
            Назад
          </button>
          <span class="page-info">
            Страница {{ currentPage }} ({{ announcements.length }} из {{ pageSize }})
          </span>
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="announcements.length < pageSize"
            class="page-btn"
          >
            Вперед
            <ChevronRight size="16" />
          </button>
        </div>
      </div>
  
      <!-- Empty State -->
      <div v-else class="empty-state">
        <MessageSquare size="48" />
        <p>Объявления не найдены</p>
        <button @click="showCreateModal = true" class="create-btn">
          Создать первое объявление
        </button>
      </div>
  
      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>{{ showEditModal ? 'Редактировать объявление' : 'Создать объявление' }}</h3>
            <button @click="closeModals" class="close-btn">
              <X size="20" />
            </button>
          </div>
          
          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-group">
              <label for="content">Содержимое объявления*</label>
              <textarea 
                id="content"
                v-model="formData.announcementContent"
                required
                rows="4"
                placeholder="Введите содержимое объявления..."
              ></textarea>
            </div>
  
            <div class="form-row">
              <div class="form-group">
                <label for="publishDate">Дата публикации*</label>
                <input 
                  id="publishDate"
                  type="date" 
                  v-model="formData.publishedDate"
                  required
                  :min="today"
                />
              </div>
              <div class="form-group">
                <label for="expirationDate">Дата окончания*</label>
                <input 
                  id="expirationDate"
                  type="date" 
                  v-model="formData.expirationDate"
                  required
                  :min="formData.publishedDate || today"
                />
              </div>
            </div>
  
            <div class="form-group">
              <label>Целевые группы*</label>
              <div class="groups-selection">
                <div 
                  v-for="group in groups" 
                  :key="group.id" 
                  class="group-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :id="`group-${group.id}`"
                    :value="group.id"
                    v-model="formData.targetGroupIds"
                  />
                  <label :for="`group-${group.id}`">{{ group.title }}</label>
                </div>
              </div>
              <p v-if="formData.targetGroupIds.length === 0" class="error-text">
                Необходимо выбрать хотя бы одну группу
              </p>
            </div>
  
            <div class="modal-actions">
              <button type="button" @click="closeModals" class="cancel-btn">
                Отмена
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="!isFormValid || submitting"
              >
                {{ submitting ? 'Сохранение...' : (showEditModal ? 'Обновить' : 'Создать') }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- View Modal -->
      <div v-if="showViewModal && selectedAnnouncement" class="modal-overlay" @click="showViewModal = false">
        <div class="modal view-modal" @click.stop>
          <div class="modal-header">
            <h3>Просмотр объявления</h3>
            <button @click="showViewModal = false" class="close-btn">
              <X size="20" />
            </button>
          </div>
          
          <div class="view-content">
            <div class="announcement-full">
              <div class="full-content">
                <h4>Содержимое:</h4>
                <p>{{ selectedAnnouncement.content }}</p>
              </div>
              
              <div class="announcement-meta">
                <div class="meta-item">
                  <strong>Автор:</strong> {{ selectedAnnouncement.owner }}
                </div>
                <div class="meta-item">
                  <strong>Группы:</strong> 
                  {{ selectedAnnouncement.groupNames.length > 0 ? selectedAnnouncement.groupNames.join(', ') : 'Не назначено' }}
                </div>
                <div class="meta-item">
                  <strong>Дата публикации:</strong> {{ formatDate(selectedAnnouncement.publishDate) }}
                </div>
                <div class="meta-item">
                  <strong>Дата окончания:</strong> {{ formatDate(selectedAnnouncement.endDate) }}
                </div>
                <div class="meta-item">
                  <strong>Статус:</strong> 
                  <span 
                    class="status-badge"
                    :class="selectedAnnouncement.isPublished ? 'published' : 'draft'"
                  >
                    {{ selectedAnnouncement.isPublished ? 'Опубликовано' : 'Черновик' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { 
    Plus, Eye, EyeOff, Edit, Trash2, Calendar, Clock, MessageSquare, 
    ChevronLeft, ChevronRight, X 
  } from 'lucide-vue-next';
  import { announcementService } from '@/services/announcementService';
  import type { AnnouncementResponse, AnnouncementRequest, Group } from '@/types/announcement';
  
  // Reactive state
  const announcements = ref<AnnouncementResponse[]>([]);
  const groups = ref<Group[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const submitting = ref(false);
  
  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(4);
  const selectedGroupId = ref<number | ''>('');
  
  // Modals
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const showViewModal = ref(false);
  const selectedAnnouncement = ref<AnnouncementResponse | null>(null);
  const editingAnnouncementId = ref<number | null>(null);
  
  // Form data
  const formData = ref<AnnouncementRequest>({
    announcementContent: '',
    expirationDate: '',
    targetGroupIds: [],
    publishedDate: ''
  });
  
  // Computed
  const today = computed(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const isFormValid = computed(() => {
    return formData.value.announcementContent.trim() !== '' &&
           formData.value.publishedDate !== '' &&
           formData.value.expirationDate !== '' &&
           formData.value.targetGroupIds.length > 0 &&
           new Date(formData.value.expirationDate) > new Date(formData.value.publishedDate);
  });
  
  // Methods
  const loadAnnouncements = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    
    try {
      const groupId = selectedGroupId.value === '' ? undefined : Number(selectedGroupId.value);
      const response = await announcementService.getAllAnnouncements(
        currentPage.value, 
        pageSize.value, 
        groupId
      );
      announcements.value = response.announcements;
    } catch (err: any) {
      error.value = 'Ошибка при загрузке объявлений';
      console.error('Error loading announcements:', err);
    } finally {
      loading.value = false;
    }
  };
  
  const loadGroups = async (): Promise<void> => {
    try {
      groups.value = await announcementService.getAllGroups();
    } catch (err: any) {
      console.error('Error loading groups:', err);
    }
  };
  
  const viewAnnouncement = async (announcement: AnnouncementResponse): Promise<void> => {
    try {
      const fullAnnouncement = await announcementService.viewAnnouncement(announcement.id);
      selectedAnnouncement.value = fullAnnouncement;
      showViewModal.value = true;
    } catch (err: any) {
      error.value = 'Ошибка при просмотре объявления';
      console.error('Error viewing announcement:', err);
    }
  };
  
  const editAnnouncement = (announcement: AnnouncementResponse): void => {
    editingAnnouncementId.value = announcement.id;
    formData.value = {
      announcementContent: announcement.content,
      publishedDate: announcement.publishDate,
      expirationDate: announcement.endDate,
      targetGroupIds: groups.value
        .filter(group => announcement.groupNames.includes(group.title))
        .map(group => group.id)
    };
    showEditModal.value = true;
  };
  
  const submitForm = async (): Promise<void> => {
    if (!isFormValid.value || submitting.value) return;
    
    submitting.value = true;
    
    try {
      if (showEditModal.value && editingAnnouncementId.value) {
        await announcementService.updateAnnouncement(editingAnnouncementId.value, formData.value);
      } else {
        await announcementService.createAnnouncement(formData.value);
      }
      
      closeModals();
      await loadAnnouncements();
    } catch (err: any) {
      error.value = showEditModal.value ? 'Ошибка при обновлении объявления' : 'Ошибка при создании объявления';
      console.error('Error submitting form:', err);
    } finally {
      submitting.value = false;
    }
  };
  
  const togglePublish = async (announcement: AnnouncementResponse): Promise<void> => {
    try {
      await announcementService.publishAnnouncement(announcement.id, !announcement.isPublished);
      await loadAnnouncements();
    } catch (err: any) {
      error.value = 'Ошибка при изменении статуса публикации';
      console.error('Error toggling publish status:', err);
    }
  };
  
  const deleteAnnouncement = async (id: number): Promise<void> => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
    
    try {
      await announcementService.deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (err: any) {
      error.value = 'Ошибка при удалении объявления';
      console.error('Error deleting announcement:', err);
    }
  };
  
  const changePage = (page: number): void => {
    currentPage.value = page;
    loadAnnouncements();
  };
  
  const closeModals = (): void => {
    showCreateModal.value = false;
    showEditModal.value = false;
    showViewModal.value = false;
    editingAnnouncementId.value = null;
    formData.value = {
      announcementContent: '',
      expirationDate: '',
      targetGroupIds: [],
      publishedDate: ''
    };
  };
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };
  
  // Watchers
  watch([selectedGroupId, pageSize], () => {
    currentPage.value = 1;
    loadAnnouncements();
  });
  
  // Lifecycle
  onMounted(() => {
    loadGroups();
    loadAnnouncements();
  });
  </script>
  
  <style scoped>
  .announcement-tab {
    padding: 20px;
  }
  
  .announcement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .announcement-header h2 {
    color: #333;
    margin: 0;
  }
  
  .create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .create-btn:hover {
    background-color: #0056b3;
  }
  
  .filters {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .filter-group label {
    font-size: 14px;
    font-weight: 500;
    color: #555;
  }
  
  .filter-group select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .loading {
    text-align: center;
    padding: 40px;
  }
  
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .retry-btn {
    padding: 6px 12px;
    background-color: #721c24;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .announcements-container {
    display: grid;
    gap: 20px;
  }
  
  .announcement-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .announcement-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .announcement-header-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .announcement-info h3 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }
  
  .owner {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
  
  .announcement-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    padding: 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .view-btn {
    background-color: #17a2b8;
    color: white;
  }
  
  .view-btn:hover {
    background-color: #138496;
  }
  
  .edit-btn {
    background-color: #ffc107;
    color: #212529;
  }
  
  .edit-btn:hover {
    background-color: #e0a800;
  }
  
  .publish-btn {
    background-color: #28a745;
    color: white;
  }
  
  .publish-btn:hover {
    background-color: #218838;
  }
  
  .unpublish-btn {
    background-color: #6c757d;
    color: white;
  }
  
  .unpublish-btn:hover {
    background-color: #5a6268;
  }
  
  .delete-btn {
    background-color: #dc3545;
    color: white;
  }
  
  .delete-btn:hover {
    background-color: #c82333;
  }
  
  .announcement-details {
    padding: 20px;
    display: grid;
    gap: 12px;
  }
  
  .groups {
    font-size: 14px;
  }
  
  .no-groups {
    color: #666;
    font-style: italic;
  }
  
  .dates {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #666;
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-badge.published {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status-badge.draft {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .page-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .page-btn:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  .page-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .page-info {
    font-size: 14px;
    color: #666;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }
  
  .empty-state svg {
    margin-bottom: 20px;
    color: #ccc;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .view-modal {
    max-width: 800px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h3 {
    margin: 0;
    color: #333;
  }
  
  .close-btn {
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .modal-form {
    padding: 20px;
    display: grid;
    gap: 20px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.groups-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  max-height: 150px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.group-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-checkbox input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.group-checkbox label {
  margin: 0;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin: 5px 0 0 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.view-content {
  padding: 20px;
}

.announcement-full {
  display: grid;
  gap: 24px;
}

.full-content h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.full-content p {
  margin: 0;
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
}

.announcement-meta {
  display: grid;
  gap: 12px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.meta-item strong {
  color: #333;
  min-width: 140px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .announcement-tab {
    padding: 15px;
  }
  
  .announcement-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
    gap: 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 10px;
  }
  
  .groups-selection {
    grid-template-columns: 1fr;
  }
  
  .announcement-header-card {
    flex-direction: column;
    gap: 15px;
  }
  
  .announcement-actions {
    justify-content: flex-end;
  }
  
  .dates {
    flex-direction: column;
    gap: 8px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .announcement-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .action-btn {
    padding: 6px;
  }
  
  .create-btn {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .announcement-card {
    margin: 0 -5px;
  }
  
  .groups-selection {
    max-height: 120px;
  }
}

/* Animation for smooth transitions */
.announcement-card {
  transition: all 0.3s ease;
}

.modal {
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Focus states for accessibility */
.action-btn:focus,
.create-btn:focus,
.page-btn:focus,
.cancel-btn:focus,
.submit-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Loading states */
.submit-btn:disabled {
  position: relative;
  pointer-events: none;
}

.submit-btn:disabled::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid transparent;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Custom scrollbar for modal content */
.modal::-webkit-scrollbar {
  width: 6px;
}

.modal::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Print styles */
@media print {
  .announcement-tab {
    background: white;
  }
  
  .action-btn,
  .create-btn,
  .pagination,
  .filters {
    display: none;
  }
  
  .announcement-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ddd;
    margin-bottom: 20px;
  }
}
</style>