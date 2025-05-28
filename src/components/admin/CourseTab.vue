<template>
  <div class="course-tab">
    <div class="courses-header">
      <h2>Управление курсами</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        + Добавить курс
      </button>
    </div>

    <!-- Course list -->
    <div class="course-list" v-if="courses.length > 0">
      <div class="course-cards">
        <div v-for="course in courses" :key="course.id" class="course-card">
          <div class="course-image">
            <img :src="course.image || '/images/default-course.jpg'" alt="Course image">
          </div>
          <div class="course-content">
            <h3>{{ course.title }}</h3>
            <p class="description">{{ course.description }}</p>
            <p class="date">Дата окончания: {{ formatDate(course.dateOfEnd) }}</p>
          </div>
          <div class="course-actions">
            <button class="btn btn-outline" @click="viewCourseDetails(course)">
              <i class="fas fa-eye"></i> Просмотр
            </button>
            <button class="btn btn-outline" @click="openEditModal(course)">
              <i class="fas fa-edit"></i> Изменить
            </button>
            <button class="btn btn-danger" @click="confirmDelete(course)">
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
        <i class="fas fa-book-open"></i>
      </div>
      <p>Нет доступных курсов</p>
      <p>Создайте новый курс, нажав кнопку "Добавить курс"</p>
    </div>

    <!-- Add/Edit Course Modal -->
    <div class="modal" v-if="showAddModal || showEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Редактировать курс' : 'Создать новый курс' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="showEditModal ? updateCourse() : createCourse()">
            <div class="form-group">
              <label for="courseTitle">Название курса*</label>
              <input 
                type="text" 
                id="courseTitle" 
                v-model="courseForm.title" 
                required
                placeholder="Введите название курса"
              >
              <small v-if="validationErrors.title" class="error">{{ validationErrors.title }}</small>
            </div>
            
            <div class="form-group">
              <label for="courseDesc">Описание курса*</label>
              <textarea 
                id="courseDesc" 
                v-model="courseForm.description" 
                required
                placeholder="Введите описание курса"
                rows="4"
              ></textarea>
              <small v-if="validationErrors.description" class="error">{{ validationErrors.description }}</small>
            </div>
            
            <div class="form-group">
              <label for="courseImage">Изображение курса</label>
              <input 
                type="text" 
                id="courseImage" 
                v-model="courseForm.image" 
                placeholder="URL изображения"
              >
            </div>
            
            <div class="form-group">
              <label for="courseEnd">Дата окончания*</label>
              <input 
                type="date" 
                id="courseEnd" 
                v-model="courseForm.dateOfEnd" 
                required
                :min="getCurrentDate()"
              >
              <small v-if="validationErrors.dateOfEnd" class="error">{{ validationErrors.dateOfEnd }}</small>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="closeModal">Отмена</button>
              <button type="submit" class="btn btn-primary">
                {{ showEditModal ? 'Сохранить изменения' : 'Создать курс' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Course Details Modal -->
    <div class="modal" v-if="showDetailsModal">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>Детали курса</h3>
          <button class="close-btn" @click="showDetailsModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedCourse" class="course-details">
            <div class="course-header">
              <img :src="selectedCourse.image || '/images/default-course.jpg'" alt="Course image">
              <div>
                <h2>{{ selectedCourse.title }}</h2>
                <p class="dates">
                  <span>Начало: {{ formatDate(selectedCourse.dateOfStart) || 'Н/Д' }}</span>
                  <span>Окончание: {{ formatDate(selectedCourse.dateOfEnd) }}</span>
                </p>
              </div>
            </div>
            
            <div class="course-description">
              <h4>Описание</h4>
              <p>{{ selectedCourse.description }}</p>
            </div>
            
            <div class="tabs">
              <div class="tab-header">
                <button 
                  :class="['tab-btn', { active: activeTab === 'instructors' }]" 
                  @click="activeTab = 'instructors'"
                >
                  Инструкторы
                </button>
                <button 
                  :class="['tab-btn', { active: activeTab === 'students' }]" 
                  @click="activeTab = 'students'"
                >
                  Студенты
                </button>
                <button 
                  :class="['tab-btn', { active: activeTab === 'groups' }]" 
                  @click="activeTab = 'groups'"
                >
                  Группы
                </button>
              </div>
              
              <div class="tab-content">
                <!-- Instructors Tab -->
                <div v-if="activeTab === 'instructors'">
                  <div class="tab-actions">
                    <button class="btn btn-sm btn-primary" @click="showAssignInstructorModal = true">
                      + Назначить инструктора
                    </button>
                  </div>
                  
                  <div v-if="instructors.length > 0" class="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>ФИО</th>
                          <th>Специализация</th>
                          <th>Email</th>
                          <th>Телефон</th>
                          <th>Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="instructor in instructors" :key="instructor.id">
                          <td>{{ instructor.id }}</td>
                          <td>{{ instructor.fullName }}</td>
                          <td>{{ instructor.specializationOrStudyFormat }}</td>
                          <td>{{ instructor.email }}</td>
                          <td>{{ instructor.phoneNumber }}</td>
                          <td>
                            <span :class="['status', instructor.isBlock ? 'blocked' : 'active']">
                              {{ instructor.isBlock ? 'Заблокирован' : 'Активен' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <!-- Pagination for instructors -->
                    <div class="pagination">
                      <button 
                        :disabled="instructorPage === 1" 
                        @click="changeInstructorPage(instructorPage - 1)" 
                        class="btn btn-sm btn-outline"
                      >
                        Назад
                      </button>
                      <span>Страница {{ instructorPage }}</span>
                      <button 
                        @click="changeInstructorPage(instructorPage + 1)" 
                        class="btn btn-sm btn-outline"
                      >
                        Вперед
                      </button>
                    </div>
                  </div>
                  
                  <div v-else class="empty-tab">
                    <p>Нет назначенных инструкторов для этого курса</p>
                  </div>
                </div>
                
                <!-- Students Tab -->
                <div v-if="activeTab === 'students'">
                  <div v-if="students.length > 0" class="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>ФИО</th>
                          <th>Формат обучения</th>
                          <th>Email</th>
                          <th>Телефон</th>
                          <th>Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="student in students" :key="student.id">
                          <td>{{ student.id }}</td>
                          <td>{{ student.fullName }}</td>
                          <td>{{ student.specializationOrStudyFormat }}</td>
                          <td>{{ student.email }}</td>
                          <td>{{ student.phoneNumber }}</td>
                          <td>
                            <span :class="['status', student.isBlock ? 'blocked' : 'active']">
                              {{ student.isBlock ? 'Заблокирован' : 'Активен' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <!-- Pagination for students -->
                    <div class="pagination">
                      <button 
                        :disabled="studentPage === 1" 
                        @click="changeStudentPage(studentPage - 1)" 
                        class="btn btn-sm btn-outline"
                      >
                        Назад
                      </button>
                      <span>Страница {{ studentPage }}</span>
                      <button 
                        @click="changeStudentPage(studentPage + 1)" 
                        class="btn btn-sm btn-outline"
                      >
                        Вперед
                      </button>
                    </div>
                  </div>
                  
                  <div v-else class="empty-tab">
                    <p>Нет студентов, обучающихся на этом курсе</p>
                  </div>
                </div>
                
                <!-- Groups Tab -->
                <div v-if="activeTab === 'groups'">
                  <div class="tab-actions">
                    <button class="btn btn-sm btn-primary" @click="showAssignGroupModal = true">
                      + Назначить группу
                    </button>
                  </div>
                  
                  <div v-if="groups.length > 0" class="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Название группы</th>
                          <th>Количество студентов</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="group in groups" :key="group.id">
                          <td>{{ group.id }}</td>
                          <td>{{ group.name }}</td>
                          <td>{{ group.studentCount || 0 }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div v-else class="empty-tab">
                    <p>Нет назначенных групп для этого курса</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Assign Instructor Modal -->
    <div class="modal" v-if="showAssignInstructorModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Назначить инструкторов</h3>
          <button class="close-btn" @click="showAssignInstructorModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="search-container">
            <input 
              type="text" 
              v-model="instructorSearch" 
              placeholder="Поиск инструкторов..." 
              class="search-input"
            >
          </div>
          
          <div class="instructor-list">
            <div v-for="instructor in availableInstructors" :key="instructor.id" class="instructor-item">
              <label class="checkbox-container">
                <input 
                  type="checkbox" 
                  :value="instructor.id" 
                  v-model="selectedInstructorIds"
                >
                <span class="checkmark"></span>
                <div class="instructor-info">
                  <strong>{{ instructor.fullName }}</strong>
                  <span>{{ instructor.specializationOrStudyFormat }} | {{ instructor.email }}</span>
                </div>
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-outline" @click="showAssignInstructorModal = false">Отмена</button>
            <button class="btn btn-primary" @click="assignInstructors">Назначить выбранных</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Assign Group Modal -->
    <div class="modal" v-if="showAssignGroupModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Назначить группу</h3>
          <button class="close-btn" @click="showAssignGroupModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="search-container">
            <input 
              type="text" 
              v-model="groupSearch" 
              placeholder="Поиск группы..." 
              class="search-input"
            >
          </div>
          
          <div class="group-list">
            <div v-for="group in availableGroups" :key="group.id" class="group-item">
              <label class="radio-container">
                <input 
                  type="radio" 
                  :value="group.id" 
                  v-model="selectedGroupId"
                >
                <span class="radio-mark"></span>
                <div class="group-info">
                  <strong>{{ group.name }}</strong>
                  <span>Студентов: {{ group.studentCount || 0 }}</span>
                </div>
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-outline" @click="showAssignGroupModal = false">Отмена</button>
            <button class="btn btn-primary" @click="assignGroup">Назначить группу</button>
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
          <p>Вы уверены, что хотите удалить курс "{{ selectedCourse?.title }}"?</p>
          <p class="warning">Это действие переместит курс в корзину.</p>
          
          <div class="form-actions">
            <button class="btn btn-outline" @click="showDeleteModal = false">Отмена</button>
            <button class="btn btn-danger" @click="deleteCourse">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'CourseTab',
  setup() {
    const courses = ref<any[]>([]);
    const currentPage = ref(1);
    const pageSize = ref(8);
    const totalPages = ref(1);
    const totalItems = ref(0);
    
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const showDetailsModal = ref(false);
    const showDeleteModal = ref(false);
    const showAssignInstructorModal = ref(false);
    const showAssignGroupModal = ref(false);
    
    const selectedCourse = ref<any>(null);
    const activeTab = ref('instructors');
    
    const instructors = ref<any[]>([]);
    const students = ref<any[]>([]);
    const groups = ref<any[]>([]);
    
    const instructorPage = ref(1);
    const studentPage = ref(1);
    const instructorSize = ref(8);
    const studentSize = ref(8);
    
    const availableInstructors = ref<any[]>([]);
    const availableGroups = ref<any[]>([]);
    const selectedInstructorIds = ref<number[]>([]);
    const selectedGroupId = ref<number | null>(null);
    
    const instructorSearch = ref('');
    const groupSearch = ref('');
    
    const courseForm = reactive({
      title: '',
      description: '',
      image: '',
      dateOfEnd: ''
    });
    
    const validationErrors = reactive({
      title: '',
      description: '',
      dateOfEnd: ''
    });
    
    // Fetch courses
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8088/api/course/findAllCourse', {
          params: {
            page: currentPage.value,
            size: pageSize.value
          }
        });
        
        courses.value = response.data.courses;
        totalPages.value = Math.ceil(response.data.totalCount / pageSize.value);
        totalItems.value = response.data.totalCount;
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    
    // Pagination
    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchCourses();
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
      validationErrors.dateOfEnd = '';
      
      if (!courseForm.title.trim()) {
        validationErrors.title = 'Название курса обязательно';
        isValid = false;
      }
      
      if (!courseForm.description.trim()) {
        validationErrors.description = 'Описание курса обязательно';
        isValid = false;
      }
      
      if (!courseForm.dateOfEnd) {
        validationErrors.dateOfEnd = 'Дата окончания обязательна';
        isValid = false;
      } else {
        const endDate = new Date(courseForm.dateOfEnd);
        const currentDate = new Date();
        
        if (endDate <= currentDate) {
          validationErrors.dateOfEnd = 'Дата окончания должна быть в будущем';
          isValid = false;
        }
      }
      
      return isValid;
    };
    
    // Create course
    const createCourse = async () => {
      if (!validateForm()) return;
      
      try {
        const response = await axios.post('http://localhost:8088/api/course/createCourse', courseForm);
        
        if (response.data.httpStatus === 'CREATED') {
          showAddModal.value = false;
          resetForm();
          fetchCourses();
        }
      } catch (error: any) {
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          if (errorData.errors) {
            // Handle validation errors from the backend
            errorData.errors.forEach((err: any) => {
              const field = err.field.toLowerCase();
              if (field in validationErrors) {
                validationErrors[field as keyof typeof validationErrors] = err.defaultMessage;
              }
            });
          }
        }
      }
    };
    
    // Open edit modal
    const openEditModal = (course: any) => {
      selectedCourse.value = course;
      courseForm.title = course.title;
      courseForm.description = course.description;
      courseForm.image = course.image || '';
      courseForm.dateOfEnd = course.dateOfEnd;
      showEditModal.value = true;
    };
    
    // Update course
    const updateCourse = async () => {
      if (!validateForm() || !selectedCourse.value) return;
      
      try {
        const response = await axios.put(`http://localhost:8088/api/course/updateCourse/${selectedCourse.value.id}`, courseForm);
        
        if (response.data.httpStatus === 'OK') {
          showEditModal.value = false;
          resetForm();
          fetchCourses();
        }
      } catch (error: any) {
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          if (errorData.errors) {
            // Handle validation errors from the backend
            errorData.errors.forEach((err: any) => {
              const field = err.field.toLowerCase();
              if (field in validationErrors) {
                validationErrors[field as keyof typeof validationErrors] = err.defaultMessage;
              }
            });
          }
        }
      }
    };
    
    // Reset form
    const resetForm = () => {
      courseForm.title = '';
      courseForm.description = '';
      courseForm.image = '';
      courseForm.dateOfEnd = '';
      
      validationErrors.title = '';
      validationErrors.description = '';
      validationErrors.dateOfEnd = '';
    };
    
    // Close modal
    const closeModal = () => {
      showAddModal.value = false;
      showEditModal.value = false;
      resetForm();
    };
    
    // View course details
    const viewCourseDetails = (course: any) => {
      selectedCourse.value = course;
      showDetailsModal.value = true;
      activeTab.value = 'instructors';
      
      // Reset pagination for instructors and students
      instructorPage.value = 1;
      studentPage.value = 1;
      
      // Fetch instructors, students and groups for the selected course
      fetchCourseInstructors();
      fetchCourseStudents();
      fetchCourseGroups();
    };
    
    // Fetch instructors for a course
    const fetchCourseInstructors = async () => {
      if (!selectedCourse.value) return;
      
      try {
        const response = await axios.get(`http://localhost:8088/api/course/findAllInstructorsAndStudentsOfCourse/${selectedCourse.value.id}`, {
          params: {
            page: instructorPage.value,
            size: instructorSize.value,
            role: 'INSTRUCTOR'
          }
        });
        
        instructors.value = response.data.getAllInstructorsOfCourses || [];
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };
    
    // Fetch students for a course
    const fetchCourseStudents = async () => {
      if (!selectedCourse.value) return;
      
      try {
        const response = await axios.get(`http://localhost:8088/api/course/findAllInstructorsAndStudentsOfCourse/${selectedCourse.value.id}`, {
          params: {
            page: studentPage.value,
            size: studentSize.value,
            role: 'STUDENT'
          }
        });
        
        students.value = response.data.getAllStudentsOfCourses || [];
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    
    // Fetch groups for a course
    const fetchCourseGroups = async () => {
      if (!selectedCourse.value) return;
      
      try {
        // This endpoint is not provided in your backend code, you may need to create it
        const response = await axios.get(`http://localhost:8088/api/course/${selectedCourse.value.id}/groups`);
        groups.value = response.data || [];
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    
    // Change instructor page
    const changeInstructorPage = (page: number) => {
      if (page >= 1) {
        instructorPage.value = page;
        fetchCourseInstructors();
      }
    };
    
    // Change student page
    const changeStudentPage = (page: number) => {
      if (page >= 1) {
        studentPage.value = page;
        fetchCourseStudents();
      }
    };
    
    // Confirm delete
    const confirmDelete = (course: any) => {
      selectedCourse.value = course;
      showDeleteModal.value = true;
    };
    
    // Delete course
    const deleteCourse = async () => {
      if (!selectedCourse.value) return;
      
      try {
        const response = await axios.delete(`http://localhost:8088/api/course/deleteCourse/${selectedCourse.value.id}`);
        
        if (response.data.httpStatus === 'OK') {
          showDeleteModal.value = false;
          fetchCourses();
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    };
    
    // Fetch available instructors
    const fetchAvailableInstructors = async () => {
      try {
        // This endpoint is not provided in your backend code, you may need to create it
        const response = await axios.get('http://localhost:8088/api/instructor/available');
        availableInstructors.value = response.data || [];
      } catch (error) {
        console.error('Error fetching available instructors:', error);
      }
    };
    
    // Fetch available groups
    const fetchAvailableGroups = async () => {
      try {
        // This endpoint is not provided in your backend code, you may need to create it
        const response = await axios.get('http://localhost:8088/api/group/available');
        availableGroups.value = response.data || [];
      } catch (error) {
        console.error('Error fetching available groups:', error);
      }
    };
    
    // Assign instructors to course
    const assignInstructors = async () => {
      if (!selectedCourse.value || selectedInstructorIds.value.length === 0) return;
      
      try {
        const response = await axios.post(`http://localhost:8088/api/course/assignInInstructorToCourse/${selectedCourse.value.id}`, null, {
          params: {
            instructorIds: selectedInstructorIds.value
          }
        });
        
        if (response.data.httpStatus === 'OK') {
          showAssignInstructorModal.value = false;
          selectedInstructorIds.value = [];
          fetchCourseInstructors();
        }
      } catch (error) {
        console.error('Error assigning instructors:', error);
      }
    };
    
    // Assign group to course
    const assignGroup = async () => {
      if (!selectedCourse.value || !selectedGroupId.value) return;
      
      try {
        const response = await axios.post(`http://localhost:8088/api/course/assignInGroupToCourse/${selectedGroupId.value}/${selectedCourse.value.id}`);
        
        if (response.data.httpStatus === 'OK') {
          showAssignGroupModal.value = false;
          selectedGroupId.value = null;
          fetchCourseGroups();
        }
      } catch (error) {
        console.error('Error assigning group:', error);
      }
    };
    
    // Filter instructors by search
    const filteredInstructors = computed(() => {
      if (!instructorSearch.value) return availableInstructors.value;
      
      const search = instructorSearch.value.toLowerCase();
      return availableInstructors.value.filter(instructor => 
        instructor.fullName.toLowerCase().includes(search) || 
        instructor.email.toLowerCase().includes(search)
      );
    });
    
    // Filter groups by search
    const filteredGroups = computed(() => {
      if (!groupSearch.value) return availableGroups.value;
      
      const search = groupSearch.value.toLowerCase();
      return availableGroups.value.filter(group => 
        group.name.toLowerCase().includes(search)
      );
    });
    
    onMounted(() => {
      fetchCourses();
    });
    
    return {
      // Data
      courses,
      currentPage,
      totalPages,
      courseForm,
      validationErrors,
      selectedCourse,
      activeTab,
      instructors,
      students,
      groups,
      instructorPage,
      studentPage,
      availableInstructors,
      availableGroups,
      selectedInstructorIds,
      selectedGroupId,
      instructorSearch,
      groupSearch,
      
      // Computed
      filteredInstructors: computed(() => {
        if (!instructorSearch.value) return availableInstructors.value;
        
        const search = instructorSearch.value.toLowerCase();
        return availableInstructors.value.filter(instructor => 
          instructor.fullName.toLowerCase().includes(search) || 
          instructor.email.toLowerCase().includes(search)
        );
      }),
      
      filteredGroups: computed(() => {
        if (!groupSearch.value) return availableGroups.value;
        
        const search = groupSearch.value.toLowerCase();
        return availableGroups.value.filter(group => 
          group.name.toLowerCase().includes(search)
        );
      }),
      
      // Modal state
      showAddModal,
      showEditModal,
      showDetailsModal,
      showDeleteModal,
      showAssignInstructorModal,
      showAssignGroupModal,
      
      // Methods
      formatDate,
      getCurrentDate,
      changePage,
      closeModal,
      createCourse,
      openEditModal,
      updateCourse,
      viewCourseDetails,
      confirmDelete,
      deleteCourse,
      changeInstructorPage,
      changeStudentPage,
      assignInstructors,
      assignGroup
    };
  }
});
</script>

<style scoped>
.course-tab {
  padding: 20px;
  width: 100%;
}

.courses-header {
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

.course-list {
  margin-top: 20px;
}

.course-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.course-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.course-image {
  height: 160px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-content {
  padding: 16px;
}

.course-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
}

.course-content .description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-content .date {
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
}

.course-actions {
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

/* Course details */
.course-header {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.course-header img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.course-header h2 {
  margin: 0 0 8px 0;
}

.dates {
  color: #6b7280;
  display: flex;
  gap: 16px;
}

.course-description {
  margin-bottom: 24px;
}

.course-description h4 {
  margin: 0 0 8px 0;
  color: #374151;
}

/* Tabs */
.tabs {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.tab-header {
  display: flex;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #4a6cf7;
  border-bottom-color: #4a6cf7;
  background-color: white;
}

.tab-content {
  padding: 20px;
}

.tab-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.empty-tab {
  text-align: center;
  padding: 32px 0;
  color: #6b7280;
}

/* Data table */
.data-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #f9fafb;
  font-weight: 500;
  color: #374151;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status.blocked {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Instructor and group selection */
.search-container {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.instructor-list,
.group-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.instructor-item,
.group-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.instructor-item:last-child,
.group-item:last-child {
  border-bottom: none;
}

.checkbox-container,
.radio-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.instructor-info,
.group-info {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.warning {
  color: #b45309;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .course-cards {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .course-header {
    flex-direction: column;
  }
  
  .course-header img {
    width: 100%;
    height: 200px;
  }
}
</style>