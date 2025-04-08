<template>
    <div class="instructor-tab">
      <div class="instructors-header">
        <h2>Управление инструкторами</h2>
        <button class="btn btn-primary" @click="openAddInstructorModal">
          + Добавить инструктора
        </button>
      </div>
      
      <!-- Instructors list -->
      <div class="instructors-list">
        <div v-if="loading" class="loading-spinner">Загрузка...</div>
        
        <div v-else-if="instructors.length === 0" class="no-data">
          Инструкторы не найдены
        </div>
        
        <table v-else class="instructors-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Email</th>
              <th>Специализация</th>
              <th>Телефон</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="instructor in instructors" :key="instructor.id">
              <td>{{ instructor.id }}</td>
              <td>{{ instructor.fullName }}</td>
              <td>{{ instructor.email }}</td>
              <td>{{ instructor.specialization }}</td>
              <td>{{ instructor.phoneNumber }}</td>
              <td class="actions">
                <button class="btn btn-info" @click="viewInstructor(instructor.id)">
                  Просмотр
                </button>
                <button class="btn btn-warning" @click="editInstructor(instructor.id)">
                  Изменить
                </button>
                <button class="btn btn-danger" @click="confirmDeleteInstructor(instructor.id)">
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div class="pagination">
          <button 
            :disabled="currentPage === 1" 
            @click="fetchInstructors(currentPage - 1)"
            class="pagination-btn"
          >
            &laquo; Пред
          </button>
          <span class="pagination-info">Страница {{ currentPage }} из {{ totalPages }}</span>
          <button 
            :disabled="currentPage === totalPages || totalPages === 0" 
            @click="fetchInstructors(currentPage + 1)"
            class="pagination-btn"
          >
            След &raquo;
          </button>
        </div>
      </div>
      
      <!-- Add Instructor Modal -->
      <div v-if="showAddModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Добавить инструктора</h3>
            <button class="close-btn" @click="showAddModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addInstructor">
              <div class="form-group">
                <label for="firstName">Имя:</label>
                <input 
                  id="firstName" 
                  v-model="newInstructor.firstName" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="lastName">Фамилия:</label>
                <input 
                  id="lastName" 
                  v-model="newInstructor.lastName" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email:</label>
                <input 
                  id="email" 
                  v-model="newInstructor.email" 
                  type="email" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="phoneNumber">Телефон:</label>
                <input 
                  id="phoneNumber" 
                  v-model="newInstructor.phoneNumber" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="specialization">Специализация:</label>
                <input 
                  id="specialization" 
                  v-model="newInstructor.specialization" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showAddModal = false">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="formLoading">
                  {{ formLoading ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Edit Instructor Modal -->
      <div v-if="showEditModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Редактировать инструктора</h3>
            <button class="close-btn" @click="showEditModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateInstructor">
              <div class="form-group">
                <label for="editFirstName">Имя:</label>
                <input 
                  id="editFirstName" 
                  v-model="editedInstructor.firstName" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="editLastName">Фамилия:</label>
                <input 
                  id="editLastName" 
                  v-model="editedInstructor.lastName" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="editEmail">Email:</label>
                <input 
                  id="editEmail" 
                  v-model="editedInstructor.email" 
                  type="email" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="editPhoneNumber">Телефон:</label>
                <input 
                  id="editPhoneNumber" 
                  v-model="editedInstructor.phoneNumber" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="editSpecialization">Специализация:</label>
                <input 
                  id="editSpecialization" 
                  v-model="editedInstructor.specialization" 
                  type="text" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label>Курсы:</label>
                <div v-if="availableCourses.length === 0" class="no-data">
                  Нет доступных курсов
                </div>
                <div v-else class="courses-checkbox-list">
                  <div v-for="course in availableCourses" :key="course.id" class="checkbox-item">
                    <input 
                      type="checkbox" 
                      :id="`course-${course.id}`" 
                      :value="course.id" 
                      v-model="editedInstructor.courseIds"
                    />
                    <label :for="`course-${course.id}`">{{ course.title }}</label>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showEditModal = false">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="formLoading">
                  {{ formLoading ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- View Instructor Modal -->
      <div v-if="showViewModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Информация об инструкторе</h3>
            <button class="close-btn" @click="showViewModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="selectedInstructor" class="instructor-details">
              <div class="detail-row">
                <strong>ID:</strong>
                <span>{{ selectedInstructor.id }}</span>
              </div>
              <div class="detail-row">
                <strong>ФИО:</strong>
                <span>{{ selectedInstructor.fullName }}</span>
              </div>
              <div class="detail-row">
                <strong>Email:</strong>
                <span>{{ selectedInstructor.email }}</span>
              </div>
              <div class="detail-row">
                <strong>Телефон:</strong>
                <span>{{ selectedInstructor.phoneNumber }}</span>
              </div>
              <div class="detail-row">
                <strong>Специализация:</strong>
                <span>{{ selectedInstructor.specialization }}</span>
              </div>
              <div class="detail-row">
                <strong>Курсы:</strong>
                <span v-if="selectedInstructor.courseNames.length === 0">Нет назначенных курсов</span>
                <ul v-else class="courses-list">
                  <li v-for="(course, index) in selectedInstructor.courseNames" :key="index">
                    {{ course }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showViewModal = false">Закрыть</button>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Подтверждение удаления</h3>
            <button class="close-btn" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Вы уверены, что хотите удалить инструктора? Это действие нельзя отменить.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteModal = false">Отмена</button>
            <button class="btn btn-danger" @click="deleteInstructor" :disabled="formLoading">
              {{ formLoading ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Toast notification -->
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { 
    InstructorResponse, 
    InstructorDetailResponse, 
    InstructorRequest,
    InstructorUpdateRequest,
    Course,
    Toast
  } from '@/types/instructor';
  import instructorService from '@/services/instructorService';
  import courseService from '@/services/courseService';
  
  export default defineComponent({
    name: 'InstructorTab',
    setup() {
      const loading = ref(false);
      const formLoading = ref(false);
      const instructors = ref<InstructorResponse[]>([]);
      const currentPage = ref(1);
      const pageSize = ref(8);
      const totalPages = ref(0);
      
      const showAddModal = ref(false);
      const showEditModal = ref(false);
      const showViewModal = ref(false);
      const showDeleteModal = ref(false);
      
      const selectedInstructorId = ref<number | null>(null);
      const selectedInstructor = ref<InstructorDetailResponse | null>(null);
      
      const newInstructor = ref<InstructorRequest>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        specialization: '',
        linkForPassword: `${window.location.origin}/reset-password`
      });
      
      const editedInstructor = ref<InstructorUpdateRequest>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        specialization: '',
        courseIds: []
      });
      
      const availableCourses = ref<Course[]>([]);
      
      const toast = ref<Toast>({
        show: false,
        message: '',
        type: 'info'
      });
      
      // Fetch all instructors with pagination
      const fetchInstructors = async (page: number) => {
        try {
          loading.value = true;
          const response = await instructorService.getInstructors(page, pageSize.value);
          
          instructors.value = response.instructorResponses;
          currentPage.value = response.page;
          
          // Calculate total pages based on the total size and page size
          if (instructors.value.length < pageSize.value && page > 1) {
            totalPages.value = page;
          } else if (instructors.value.length === 0 && page === 1) {
            totalPages.value = 0;
          } else if (instructors.value.length < pageSize.value && page === 1) {
            totalPages.value = 1;
          } else {
            // If we have full page, we don't know the exact total pages
            totalPages.value = page + 1;
          }
        } catch (error) {
          showToast('Ошибка при загрузке инструкторов', 'error');
          console.error('Error fetching instructors:', error);
        } finally {
          loading.value = false;
        }
      };
      
      // Fetch available courses for assignment
      const fetchCourses = async () => {
        try {
          availableCourses.value = await courseService.getAllCourses();
        } catch (error) {
          console.error('Error fetching courses:', error);
          availableCourses.value = [];
        }
      };
      
      // Get instructor details by ID
      const getInstructorById = async (id: number) => {
        try {
          loading.value = true;
          return await instructorService.getInstructorById(id);
        } catch (error) {
          showToast('Ошибка при загрузке данных инструктора', 'error');
          console.error('Error fetching instructor details:', error);
          return null;
        } finally {
          loading.value = false;
        }
      };
      
      // Open add instructor modal
      const openAddInstructorModal = () => {
        newInstructor.value = {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          specialization: '',
          linkForPassword: `${window.location.origin}/reset-password`
        };
        showAddModal.value = true;
      };
      
      // Add new instructor
      const addInstructor = async () => {
        try {
          formLoading.value = true;
          await instructorService.addInstructor(
            newInstructor.value, 
            newInstructor.value.linkForPassword
          );
          
          showAddModal.value = false;
          showToast('Инструктор успешно добавлен', 'success');
          fetchInstructors(currentPage.value);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Ошибка при добавлении инструктора';
          showToast(errorMessage, 'error');
          console.error('Error adding instructor:', error);
        } finally {
          formLoading.value = false;
        }
      };
      
      // View instructor details
      const viewInstructor = async (id: number) => {
        const instructorData = await getInstructorById(id);
        if (instructorData) {
          selectedInstructor.value = instructorData;
          showViewModal.value = true;
        }
      };
      
      // Open edit instructor modal
      const editInstructor = async (id: number) => {
        const instructorData = await getInstructorById(id);
        if (instructorData) {
          // Split full name into first and last name
          const nameParts = instructorData.fullName.split(' ');
          
          editedInstructor.value = {
            firstName: nameParts[0] || '',
            lastName: nameParts[1] || '',
            email: instructorData.email,
            phoneNumber: instructorData.phoneNumber,
            specialization: instructorData.specialization,
            courseIds: [] // We need to get course IDs separately
          };
          
          selectedInstructorId.value = id;
          await fetchCourses();
          showEditModal.value = true;
        }
      };
      
      // Update instructor
      const updateInstructor = async () => {
        if (!selectedInstructorId.value) return;
        
        try {
          formLoading.value = true;
          await instructorService.updateInstructor(
            selectedInstructorId.value,
            editedInstructor.value
          );
          
          showEditModal.value = false;
          showToast('Инструктор успешно обновлен', 'success');
          fetchInstructors(currentPage.value);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Ошибка при обновлении инструктора';
          showToast(errorMessage, 'error');
          console.error('Error updating instructor:', error);
        } finally {
          formLoading.value = false;
        }
      };
      
      // Confirm delete instructor
      const confirmDeleteInstructor = (id: number) => {
        selectedInstructorId.value = id;
        showDeleteModal.value = true;
      };
      
      // Delete instructor
      const deleteInstructor = async () => {
        if (!selectedInstructorId.value) return;
        
        try {
          formLoading.value = true;
          await instructorService.deleteInstructor(selectedInstructorId.value);
          
          showDeleteModal.value = false;
          showToast('Инструктор перемещен в корзину', 'success');
          fetchInstructors(currentPage.value);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Ошибка при удалении инструктора';
          showToast(errorMessage, 'error');
          console.error('Error deleting instructor:', error);
        } finally {
          formLoading.value = false;
        }
      };
      
      // Show toast notification
      const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        toast.value = {
          show: true,
          message,
          type
        };
        
        // Auto hide after 3 seconds
        setTimeout(() => {
          toast.value.show = false;
        }, 3000);
      };
      
      onMounted(() => {
        fetchInstructors(1);
      });
      
      return {
        loading,
        formLoading,
        instructors,
        currentPage,
        totalPages,
        showAddModal,
        showEditModal,
        showViewModal,
        showDeleteModal,
        newInstructor,
        editedInstructor,
        selectedInstructor,
        availableCourses,
        toast,
        fetchInstructors,
        openAddInstructorModal,
        addInstructor,
        viewInstructor,
        editInstructor,
        updateInstructor,
        confirmDeleteInstructor,
        deleteInstructor
      };
    }
  });
  </script>
  <style scoped>

/* Common styles for admin components */

/* Button styles */
.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #0069d9;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover {
    background-color: #5a6268;
  }
  
  .btn-info {
    background-color: #17a2b8;
    color: white;
  }
  
  .btn-info:hover {
    background-color: #138496;
  }
  
  .btn-warning {
    background-color: #ffc107;
    color: #212529;
  }
  
  .btn-warning:hover {
    background-color: #e0a800;
  }
  
  .btn-danger {
    background-color: #dc3545;
    color: white;
  }
  
  .btn-danger:hover {
    background-color: #c82333;
  }
  
  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  
  /* Table styles */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .actions {
    display: flex;
    gap: 5px;
  }
  
  /* Header styles */
  .instructors-header,
  .courses-header,
  .students-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    width: 100%;
    max-width: 600px;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #ddd;
  }
  
  .modal-header h3 {
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .modal-body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  /* Form styles */
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  .form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
  
  .pagination-btn {
    padding: 8px 12px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination-btn:disabled {
    color: #aaa;
    cursor: not-allowed;
  }
  
  .pagination-info {
    margin: 0 15px;
  }
  
  /* Loading and empty states */
  .loading-spinner {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .no-data {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
  }
  
  /* Toast notification */
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    z-index: 2000;
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
  }
  
  .toast.success {
    background-color: #28a745;
  }
  
  .toast.error {
    background-color: #dc3545;
  }
  
  .toast.info {
    background-color: #17a2b8;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }</style>