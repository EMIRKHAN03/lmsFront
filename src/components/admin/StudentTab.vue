<template>
  <div class="student-tab">
    <div class="students-header">
      <h2>Управление студентами</h2>
      <div class="action-buttons">
        <button class="btn btn-import" @click="openImportDialog">
          <i class="fas fa-file-import"></i> Импортировать
        </button>
        <button class="btn btn-primary" @click="openAddStudentModal">
          <i class="fas fa-plus"></i> Добавить студента
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Поиск студентов..." 
          @input="debouncedSearch"
        />
      </div>
      
      <div class="filter-options">
        <select v-model="selectedFormat" @change="loadStudents">
          <option value="">Все форматы обучения</option>
          <option value="ONLINE">Онлайн</option>
          <option value="OFFLINE">Оффлайн</option>
        </select>
        
        <select v-model="selectedGroupId" @change="loadStudents">
          <option value="">Все группы</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.title }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Загрузка студентов...</p>
    </div>

    <!-- Students table -->
    <div v-else-if="students.length > 0" class="students-table">
      <table>
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Группа</th>
            <th>Формат обучения</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id" :class="{ 'blocked': student.isBlock }">
            <td>{{ student.fullName }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.phoneNumber }}</td>
            <td>{{ student.groupName }}</td>
            <td>
              <span :class="['format-badge', student.studyFormat.toLowerCase()]">
                {{ student.studyFormat === 'ONLINE' ? 'Онлайн' : 'Оффлайн' }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', student.isBlock ? 'blocked' : 'active']">
                {{ student.isBlock ? 'Заблокирован' : 'Активный' }}
              </span>
            </td>
            <td class="actions">
              <button @click="viewStudent(student.id)" class="btn-icon">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editStudent(student.id)" class="btn-icon">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="toggleBlockStatus(student.id)" class="btn-icon" :title="student.isBlock ? 'Разблокировать' : 'Заблокировать'">
                <i :class="student.isBlock ? 'fas fa-lock-open' : 'fas fa-lock'"></i>
              </button>
              <button @click="confirmDelete(student.id)" class="btn-icon delete">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button 
          :disabled="page <= 1" 
          @click="changePage(page - 1)" 
          class="btn-page"
        >
          &laquo; Предыдущая
        </button>
        
        <span class="page-info">Страница {{ page }} из {{ totalPages }}</span>
        
        <button 
          :disabled="page >= totalPages" 
          @click="changePage(page + 1)" 
          class="btn-page"
        >
          Следующая &raquo;
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <i class="fas fa-user-graduate"></i>
      <h3>Нет студентов</h3>
      <p>Студенты не найдены. Добавьте студентов или измените параметры поиска.</p>
    </div>

    <!-- Add/Edit Student Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Редактирование студента' : 'Добавление студента' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitStudentForm">
            <div class="form-group">
              <label for="firstName">Имя</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="studentForm.firstName" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="lastName">Фамилия</label>
              <input 
                type="text" 
                id="lastName" 
                v-model="studentForm.lastName" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="studentForm.email" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="phoneNumber">Телефон</label>
              <input 
                type="text" 
                id="phoneNumber" 
                v-model="studentForm.phoneNumber"
                placeholder="+996XXXXXXXXX"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="groupName">Группа</label>
              <select 
                id="groupName" 
                v-model="studentForm.groupName"
                required
              >
                <option value="" disabled>Выберите группу</option>
                <option v-for="group in groups" :key="group.id" :value="group.title">
                  {{ group.title }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Формат обучения</label>
              <div class="radio-group">
                <label>
                  <input 
                    type="radio" 
                    v-model="studentForm.studyFormat" 
                    value="ONLINE"
                  /> Онлайн
                </label>
                <label>
                  <input 
                    type="radio" 
                    v-model="studentForm.studyFormat" 
                    value="OFFLINE"
                  /> Оффлайн
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" @click="closeModal">Отмена</button>
              <button type="submit" class="btn btn-submit">
                {{ isEditing ? 'Сохранить' : 'Добавить' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Import Students Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="closeImportModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Импорт студентов</h3>
          <button class="close-btn" @click="closeImportModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitImportForm">
            <div class="form-group">
              <label for="importGroup">Группа</label>
              <select 
                id="importGroup" 
                v-model="importForm.groupId"
                required
              >
                <option value="" disabled>Выберите группу</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.title }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="excelFile">Excel файл</label>
              <input 
                type="file" 
                id="excelFile" 
                @change="handleFileUpload"
                accept=".xlsx, .xls"
                required
              />
              <small class="file-hint">
                Формат Excel файла: колонка 1 - ФИО, колонка 2 - Email, колонка 3 - Телефон, колонка 4 - Формат обучения (ONLINE/OFFLINE)
              </small>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" @click="closeImportModal">Отмена</button>
              <button type="submit" class="btn btn-submit">Импортировать</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="modal-overlay">
      <div class="modal-content confirm-dialog">
        <div class="modal-header">
          <h3>Подтверждение</h3>
          <button class="close-btn" @click="cancelConfirmation">&times;</button>
        </div>
        
        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
          
          <div class="form-actions">
            <button class="btn btn-cancel" @click="cancelConfirmation">Отмена</button>
            <button class="btn btn-danger" @click="proceedWithAction">Подтвердить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'StudentTab',
  setup() {
    // State
    const students = ref([]);
    const groups = ref([]);
    const loading = ref(false);
    const page = ref(1);
    const size = ref(12);
    const totalPages = ref(1);
    const searchTerm = ref('');
    const selectedFormat = ref('');
    const selectedGroupId = ref('');
    
    // Modal state
    const showModal = ref(false);
    const isEditing = ref(false);
    const currentStudentId = ref(null);
    const studentForm = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      groupName: '',
      studyFormat: 'ONLINE'
    });
    
    // Import modal state
    const showImportModal = ref(false);
    const importForm = reactive({
      groupId: '',
      file: null
    });
    
    // Confirmation dialog state
    const showConfirmDialog = ref(false);
    const confirmMessage = ref('');
    const pendingAction = ref(null);
    const pendingActionParam = ref(null);

    // Base URL for API
    const API_URL = 'http://localhost:8088/api/students';
    
    // Load students with pagination and filters
    const loadStudents = async () => {
      try {
        loading.value = true;
        
        const params = {
          page: page.value,
          size: size.value,
          search: searchTerm.value,
          studyFormat: selectedFormat.value,
          groupId: selectedGroupId.value || ''
        };
        
        const response = await axios.get(API_URL, { params });
        students.value = response.data.students;
        
        // Update pagination info
        page.value = response.data.page;
        totalPages.value = Math.ceil(response.data.totalCount / size.value) || 1;
        
      } catch (error) {
        console.error('Error loading students:', error);
        alert('Ошибка при загрузке данных студентов');
      } finally {
        loading.value = false;
      }
    };
    
    // Load groups for dropdown
    const loadGroups = async () => {
      try {
        const response = await axios.get('http://localhost:8088/api/groups');
        groups.value = response.data;
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };
    
    // Pagination
    const changePage = (newPage) => {
      page.value = newPage;
      loadStudents();
    };
    
    // Debounced search
    let searchTimeout = null;
    const debouncedSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        page.value = 1; // Reset to first page on search
        loadStudents();
      }, 500);
    };
    
    // Open add student modal
    const openAddStudentModal = () => {
      isEditing.value = false;
      currentStudentId.value = null;
      
      // Reset form
      Object.assign(studentForm, {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        groupName: '',
        studyFormat: 'ONLINE'
      });
      
      showModal.value = true;
    };
    
    // View student details
    const viewStudent = async (id) => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        // Here you could open a view-only modal or redirect to a details page
        alert(`Просмотр данных студента: ${response.data.fullName}`);
      } catch (error) {
        console.error('Error fetching student details:', error);
        alert('Ошибка при загрузке данных студента');
      }
    };
    
    // Edit student
    const editStudent = async (id) => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        const studentData = response.data;
        
        // Split fullName into firstName and lastName
        const nameParts = studentData.fullName.split(' ');
        
        // Fill form with student data
        studentForm.firstName = nameParts[0] || '';
        studentForm.lastName = nameParts.slice(1).join(' ') || '';
        studentForm.email = studentData.email;
        studentForm.phoneNumber = studentData.phoneNumber;
        studentForm.groupName = studentData.groupName;
        studentForm.studyFormat = studentData.studyFormat;
        
        // Set editing mode
        isEditing.value = true;
        currentStudentId.value = id;
        showModal.value = true;
        
      } catch (error) {
        console.error('Error fetching student for edit:', error);
        alert('Ошибка при загрузке данных студента');
      }
    };
    
    // Submit student form (add or edit)
    const submitStudentForm = async () => {
      try {
        const studentData = {
          firstName: studentForm.firstName,
          lastName: studentForm.lastName,
          email: studentForm.email,
          phoneNumber: studentForm.phoneNumber,
          groupName: studentForm.groupName,
          studyFormat: studentForm.studyFormat
        };
        
        if (isEditing.value) {
          // Update existing student
          await axios.patch(`${API_URL}/${currentStudentId.value}`, studentData);
          alert('Студент успешно обновлен!');
        } else {
          // Create new student
          const linkForPassword = `${window.location.origin}/create-password`;
          await axios.post(API_URL, studentData, {
            params: { linkForPassword }
          });
          alert('Студент успешно добавлен!');
        }
        
        // Close modal and reload students
        closeModal();
        loadStudents();
        
      } catch (error) {
        console.error('Error saving student:', error);
        alert('Ошибка при сохранении данных студента: ' + 
              (error.response?.data?.message || error.message));
      }
    };
    
    // Delete student (move to trash)
    const deleteStudent = async (id) => {
      try {
        await axios.delete(`${API_URL}/${id}`);
        alert('Студент успешно перемещен в корзину!');
        loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Ошибка при удалении студента');
      }
    };
    
    // Toggle block status
    const toggleBlockStatus = async (id) => {
      try {
        const response = await axios.patch(`${API_URL}/isBlock/${id}`);
        alert(response.data.message);
        loadStudents();
      } catch (error) {
        console.error('Error toggling block status:', error);
        alert('Ошибка при изменении статуса блокировки');
      }
    };
    
    // Close modal
    const closeModal = () => {
      showModal.value = false;
    };
    
    // Import students functions
    const openImportDialog = () => {
      importForm.groupId = '';
      importForm.file = null;
      showImportModal.value = true;
    };
    
    const closeImportModal = () => {
      showImportModal.value = false;
    };
    
    const handleFileUpload = (event) => {
      importForm.file = event.target.files[0];
    };
    
    const submitImportForm = async () => {
      if (!importForm.file || !importForm.groupId) {
        alert('Пожалуйста, выберите группу и файл Excel');
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('file', importForm.file);
        
        const link = `${window.location.origin}/create-password`;
        
        await axios.post(
          `${API_URL}/importStudents/${importForm.groupId}`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            params: { link }
          }
        );
        
        alert('Студенты успешно импортированы!');
        closeImportModal();
        loadStudents();
        
      } catch (error) {
        console.error('Error importing students:', error);
        alert('Ошибка при импорте студентов: ' + 
              (error.response?.data?.message || error.message));
      }
    };
    
    // Confirmation dialog functions
    const confirmDelete = (id) => {
      confirmMessage.value = 'Вы уверены, что хотите удалить этого студента? Он будет перемещен в корзину.';
      pendingAction.value = deleteStudent;
      pendingActionParam.value = id;
      showConfirmDialog.value = true;
    };
    
    const cancelConfirmation = () => {
      showConfirmDialog.value = false;
      pendingAction.value = null;
      pendingActionParam.value = null;
    };
    
    const proceedWithAction = () => {
      if (pendingAction.value && pendingActionParam.value !== null) {
        pendingAction.value(pendingActionParam.value);
      }
      cancelConfirmation();
    };
    
    // Initialize component
    onMounted(() => {
      loadGroups();
      loadStudents();
    });
    
    return {
      // Data
      students,
      groups,
      loading,
      page,
      size,
      totalPages,
      searchTerm,
      selectedFormat,
      selectedGroupId,
      
      // Student form
      showModal,
      isEditing,
      studentForm,
      
      // Import form
      showImportModal,
      importForm,
      
      // Confirmation dialog
      showConfirmDialog,
      confirmMessage,
      
      // Methods
      loadStudents,
      changePage,
      debouncedSearch,
      openAddStudentModal,
      viewStudent,
      editStudent,
      submitStudentForm,
      deleteStudent,
      toggleBlockStatus,
      closeModal,
      
      // Import methods
      openImportDialog,
      closeImportModal,
      handleFileUpload,
      submitImportForm,
      
      // Confirmation methods
      confirmDelete,
      cancelConfirmation,
      proceedWithAction
    };
  }
};
</script>

<style scoped>
.student-tab {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.students-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.students-header h2 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-import {
  background-color: #6c757d;
  color: white;
}

.btn-import:hover {
  background-color: #5a6268;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.filter-options {
  display: flex;
  gap: 10px;
}

.filter-options select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #007bff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.students-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f1f1f1;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

.format-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.format-badge.online {
  background-color: #d1e7dd;
  color: #0f5132;
}

.format-badge.offline {
  background-color: #f8d7da;
  color: #842029;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-badge.blocked {
  background-color: #f8d7da;
  color: #842029;
}

tr.blocked {
  background-color: #fff8f8;
}

.actions {
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
  color: #6c757d;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f1f1f1;
  color: #007bff;
}

.btn-icon.delete:hover {
  color: #dc3545;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  gap: 10px;
}

.btn-page {
  padding: 6px 12px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  font-size: 48px;
  color: #6c757d;
  margin-bottom: 15px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  color: #6c757d;
}

/* Modal styling */
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
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.radio-group {
  display: flex;
  gap: 15px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-submit {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.file-hint {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
}

.confirm-dialog {
  width: 400px;
}
</style>