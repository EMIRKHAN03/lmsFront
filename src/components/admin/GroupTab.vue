<template>
    <div class="group-tab">
      <div class="groups-header">
        <h2>Управление группами</h2>
        <button class="btn btn-primary" @click="showAddModal = true">
          + Добавить группу
        </button>
      </div>
  
      <!-- Group list -->
      <div class="group-list" v-if="groups.length > 0">
        <div class="group-cards">
          <div v-for="group in groups" :key="group.id" class="group-card">
            <div class="group-image">
              <img :src="group.image || '/images/default-group.jpg'" alt="Group image">
            </div>
            <div class="group-content">
              <h3>{{ group.title }}</h3>
              <p class="description">{{ group.description }}</p>
              <p class="date">Дата начала: {{ formatDate(group.dateOfStart) }}</p>
              <p class="date">Дата окончания: {{ formatDate(group.dateOfEnd) }}</p>
            </div>
            <div class="group-actions">
              <button class="btn btn-outline" @click="viewGroupDetails(group)">
                <i class="fas fa-eye"></i> Просмотр
              </button>
              <button class="btn btn-outline" @click="openEditModal(group)">
                <i class="fas fa-edit"></i> Изменить
              </button>
              <button class="btn btn-danger" @click="confirmDelete(group)">
                <i class="fas fa-trash"></i> Удалить
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="pagination">
          <button 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)" 
            class="btn btn-outline"
          >
            Назад
          </button>
          <span>Страница {{ currentPage }} из {{ totalPages }}</span>
          <button 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)" 
            class="btn btn-outline"
          >
            Вперед
          </button>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-users"></i>
        </div>
        <p>Нет доступных групп</p>
        <p>Создайте новую группу, нажав кнопку "Добавить группу"</p>
      </div>
  
      <!-- Add/Edit Group Modal -->
      <div class="modal" v-if="showAddModal || showEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ showEditModal ? 'Редактировать группу' : 'Создать новую группу' }}</h3>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="showEditModal ? updateGroup() : createGroup()">
              <div class="form-group">
                <label for="groupTitle">Название группы*</label>
                <input 
                  type="text" 
                  id="groupTitle" 
                  v-model="groupForm.title" 
                  required
                  placeholder="Введите название группы"
                >
                <small v-if="validationErrors.title" class="error">{{ validationErrors.title }}</small>
              </div>
              
              <div class="form-group">
                <label for="groupDesc">Описание группы*</label>
                <textarea 
                  id="groupDesc" 
                  v-model="groupForm.description" 
                  required
                  placeholder="Введите описание группы"
                  rows="4"
                ></textarea>
                <small v-if="validationErrors.description" class="error">{{ validationErrors.description }}</small>
              </div>
              
              <div class="form-group">
                <label for="groupImage">Изображение группы*</label>
                <input 
                  type="text" 
                  id="groupImage" 
                  v-model="groupForm.image" 
                  required
                  placeholder="URL изображения"
                >
                <small v-if="validationErrors.image" class="error">{{ validationErrors.image }}</small>
              </div>
              
              <div class="form-group">
                <label for="groupEnd">Дата окончания*</label>
                <input 
                  type="date" 
                  id="groupEnd" 
                  v-model="groupForm.dateOfEnd" 
                  required
                  :min="getCurrentDate()"
                >
                <small v-if="validationErrors.dateOfEnd" class="error">{{ validationErrors.dateOfEnd }}</small>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="closeModal">Отмена</button>
                <button type="submit" class="btn btn-primary">
                  {{ showEditModal ? 'Сохранить изменения' : 'Создать группу' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Group Details Modal -->
      <div class="modal" v-if="showDetailsModal">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3>Детали группы</h3>
            <button class="close-btn" @click="showDetailsModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="selectedGroup" class="group-details">
              <div class="group-header">
                <img :src="selectedGroup.image || '/images/default-group.jpg'" alt="Group image">
                <div>
                  <h2>{{ selectedGroup.title }}</h2>
                  <p class="dates">
                    <span>Начало: {{ formatDate(selectedGroup.dateOfStart) || 'Н/Д' }}</span>
                    <span>Окончание: {{ formatDate(selectedGroup.dateOfEnd) }}</span>
                  </p>
                </div>
              </div>
              
              <div class="group-description">
                <h4>Описание</h4>
                <p>{{ selectedGroup.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div class="modal" v-if="showDeleteModal">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h3>Подтверждение удаления</h3>
            <button class="close-btn" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Вы уверены, что хотите удалить группу "{{ selectedGroup?.title }}"?</p>
            <p class="warning">Это действие переместит группу в корзину.</p>
            
            <div class="form-actions">
              <button class="btn btn-outline" @click="showDeleteModal = false">Отмена</button>
              <button class="btn btn-danger" @click="deleteGroup">Удалить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, reactive, onMounted } from 'vue';
  import axios from 'axios';
  
  // Interfaces
  interface Group {
    id: number;
    title: string;
    description: string;
    image: string;
    dateOfStart: string;
    dateOfEnd: string;
  }
  
  interface GroupForm {
    title: string;
    description: string;
    image: string;
    dateOfEnd: string;
  }
  
  interface ValidationErrors {
    title: string;
    description: string;
    image: string;
    dateOfEnd: string;
  }
  
  interface AllGroupResponse {
    page: number;
    size: number;
    groupResponses: Group[];
  }
  
  export default defineComponent({
    name: 'GroupTab',
    setup() {
      const groups = ref<Group[]>([]);
      const currentPage = ref(1);
      const pageSize = ref(8);
      const totalPages = ref(1);
      const totalItems = ref(0);
      
      const showAddModal = ref(false);
      const showEditModal = ref(false);
      const showDetailsModal = ref(false);
      const showDeleteModal = ref(false);
      
      const selectedGroup = ref<Group | null>(null);
      
      const groupForm = reactive<GroupForm>({
        title: '',
        description: '',
        image: '',
        dateOfEnd: ''
      });
      
      const validationErrors = reactive<ValidationErrors>({
        title: '',
        description: '',
        image: '',
        dateOfEnd: ''
      });
      
      // API endpoints
      const API_BASE_URL = 'http://localhost:8088/api/groups';
      
      // Fetch groups
      const fetchGroups = async () => {
        try {
          const response = await axios.get<AllGroupResponse>(API_BASE_URL, {
            params: {
              page: currentPage.value,
              size: pageSize.value
            }
          });
          
          groups.value = response.data.groupResponses || [];
          const totalCount = groups.value.length; // Backend doesn't provide totalCount
          totalPages.value = Math.max(1, Math.ceil(totalCount / pageSize.value));
        } catch (error) {
          console.error('Error fetching groups:', error);
          if (axios.isAxiosError(error)) {
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
          }
        }
      };
      
      // Pagination
      const changePage = (page: number) => {
        if (page >= 1 && page <= totalPages.value) {
          currentPage.value = page;
          fetchGroups();
        }
      };
      
      // Format date
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
      };
      
      // Get current date in YYYY-MM-DD format for date input min value
      const getCurrentDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };
      
      // Validate form
      const validateForm = () => {
        let isValid = true;
        
        // Reset errors
        validationErrors.title = '';
        validationErrors.description = '';
        validationErrors.image = '';
        validationErrors.dateOfEnd = '';
        
        if (!groupForm.title.trim()) {
          validationErrors.title = 'Название группы обязательно';
          isValid = false;
        }
        
        if (!groupForm.description.trim()) {
          validationErrors.description = 'Описание группы обязательно';
          isValid = false;
        }
        
        if (!groupForm.image.trim()) {
          validationErrors.image = 'Изображение группы обязательно';
          isValid = false;
        }
        
        if (!groupForm.dateOfEnd) {
          validationErrors.dateOfEnd = 'Дата окончания обязательна';
          isValid = false;
        } else {
          const endDate = new Date(groupForm.dateOfEnd);
          const currentDate = new Date();
          
          if (endDate <= currentDate) {
            validationErrors.dateOfEnd = 'Дата окончания должна быть в будущем';
            isValid = false;
          }
        }
        
        return isValid;
      };
      
      // Create group
      const createGroup = async () => {
        if (!validateForm()) return;
        
        try {
          const response = await axios.post(API_BASE_URL, groupForm);
          
          if (response.data.httpStatus === 'ACCEPTED') {
            showAddModal.value = false;
            resetForm();
            fetchGroups();
            console.log('Group created successfully');
          }
        } catch (error: any) {
          console.error('Error creating group:', error);
          
          if (axios.isAxiosError(error)) {
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
            
            if (error.response?.data) {
              const errorData = error.response.data;
              
              // Handle validation errors from backend
              if (errorData.message) {
                if (errorData.message.includes('уже существует')) {
                  validationErrors.title = errorData.message;
                }
              }
              
              if (errorData.errors) {
                errorData.errors.forEach((err: any) => {
                  const field = err.field?.toLowerCase();
                  if (field && field in validationErrors) {
                    validationErrors[field as keyof ValidationErrors] = err.defaultMessage;
                  }
                });
              }
            }
          }
        }
      };
      
      // Open edit modal
      const openEditModal = (group: Group) => {
        selectedGroup.value = group;
        groupForm.title = group.title;
        groupForm.description = group.description;
        groupForm.image = group.image || '';
        groupForm.dateOfEnd = group.dateOfEnd;
        showEditModal.value = true;
      };
      
      // Update group
      const updateGroup = async () => {
        if (!validateForm() || !selectedGroup.value) return;
        
        try {
          const response = await axios.patch(`${API_BASE_URL}/${selectedGroup.value.id}`, groupForm);
          
          if (response.data.httpStatus === 'OK') {
            showEditModal.value = false;
            resetForm();
            fetchGroups();
            console.log('Group updated successfully');
          }
        } catch (error: any) {
          console.error('Error updating group:', error);
          
          if (axios.isAxiosError(error)) {
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
            
            if (error.response?.data) {
              const errorData = error.response.data;
              
              // Handle validation errors from backend
              if (errorData.message) {
                if (errorData.message.includes('уже существует')) {
                  validationErrors.title = errorData.message;
                }
              }
              
              if (errorData.errors) {
                errorData.errors.forEach((err: any) => {
                  const field = err.field?.toLowerCase();
                  if (field && field in validationErrors) {
                    validationErrors[field as keyof ValidationErrors] = err.defaultMessage;
                  }
                });
              }
            }
          }
        }
      };
      
      // Reset form
      const resetForm = () => {
        groupForm.title = '';
        groupForm.description = '';
        groupForm.image = '';
        groupForm.dateOfEnd = '';
        
        validationErrors.title = '';
        validationErrors.description = '';
        validationErrors.image = '';
        validationErrors.dateOfEnd = '';
      };
      
      // Close modal
      const closeModal = () => {
        showAddModal.value = false;
        showEditModal.value = false;
        resetForm();
      };
      
      // View group details
      const viewGroupDetails = (group: Group) => {
        selectedGroup.value = group;
        showDetailsModal.value = true;
      };
      
      // Confirm delete
      const confirmDelete = (group: Group) => {
        selectedGroup.value = group;
        showDeleteModal.value = true;
      };
      
      // Delete group
      const deleteGroup = async () => {
        if (!selectedGroup.value) return;
        
        try {
          const response = await axios.delete(`${API_BASE_URL}/${selectedGroup.value.id}`);
          
          if (response.data.httpStatus === 'OK') {
            showDeleteModal.value = false;
            fetchGroups();
            console.log('Group deleted successfully');
          }
        } catch (error) {
          console.error('Error deleting group:', error);
          
          if (axios.isAxiosError(error)) {
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
          }
        }
      };
      
      onMounted(() => {
        fetchGroups();
      });
      
      return {
        // Data
        groups,
        currentPage,
        totalPages,
        groupForm,
        validationErrors,
        selectedGroup,
        
        // Modal state
        showAddModal,
        showEditModal,
        showDetailsModal,
        showDeleteModal,
        
        // Methods
        formatDate,
        getCurrentDate,
        changePage,
        closeModal,
        createGroup,
        openEditModal,
        updateGroup,
        viewGroupDetails,
        confirmDelete,
        deleteGroup
      };
    }
  });
  </script>
  
  <style scoped>
  .group-tab {
    padding: 20px;
    width: 100%;
  }
  
  .groups-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .btn-primary {
    background-color: #4a6cf7;
    color: white;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #3a5ce5;
  }
  
  .btn-outline {
    background-color: transparent;
    border: 1px solid #d1d5db;
    color: #374151;
  }
  
  .btn-outline:hover {
    background-color: #f3f4f6;
  }
  
  .btn-danger {
    background-color: #ef4444;
    color: white;
    border: none;
  }
  
  .btn-danger:hover {
    background-color: #dc2626;
  }
  
  .btn-sm {
    padding: 4px 12px;
    font-size: 0.875rem;
  }
  
  .group-list {
    margin-top: 20px;
  }
  
  .group-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .group-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .group-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  .group-image {
    height: 160px;
    overflow: hidden;
  }
  
  .group-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .group-content {
    padding: 16px;
  }
  
  .group-content h3 {
    margin: 0 0 8px 0;
    font-size: 1.125rem;
  }
  
  .group-content .description {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .group-content .date {
    color: #4b5563;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .group-actions {
    display: flex;
    padding: 12px 16px;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
    gap: 8px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
  }
  
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .empty-state {
    text-align: center;
    padding: 48px 0;
    color: #6b7280;
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    color: #9ca3af;
  }
  
  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .modal-lg {
    max-width: 800px;
  }
  
  .modal-sm {
    max-width: 400px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #374151;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-group .error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 4px;
    display: block;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  
  /* Group details */
  .group-header {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .group-header img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .group-header h2 {
    margin: 0 0 8px 0;
  }
  
  .dates {
    color: #6b7280;
    display: flex;
    gap: 16px;
  }
  
  .group-description {
    margin-bottom: 24px;
  }
  
  .group-description h4 {
    margin: 0 0 8px 0;
    color: #374151;
  }
  
  .warning {
    color: #b45309;
    font-weight: 500;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .group-cards {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
    
    .group-header {
      flex-direction: column;
    }
    
    .group-header img {
      width: 100%;
      height: 200px;
    }
  }
  </style>