<template>
    <div class="courses-container">
      <h1>{{ isLoading ? 'Загрузка курсов...' : 'Мои курсы' }}</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
  
      <div v-if="!isLoading && !courseData.courses.length" class="no-courses">
        У вас пока нет курсов.
      </div>
  
      <div v-if="!isLoading && courseData.courses.length" class="courses-grid">
        <CourseCard 
          v-for="course in courseData.courses" 
          :key="course.id" 
          :course="course" 
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
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import CourseCard from '@/components/CourseCard.vue';
  import courseService from '@/services/courseServices';
  import { FindAllResponseCourse } from '@/types/course';
  
  export default defineComponent({
    name: 'CourseList',
    components: {
      CourseCard
    },
    setup() {
      const isLoading = ref(true);
      const error = ref('');
      const currentPage = ref(1);
      const itemsPerPage = ref(8);
      const totalItems = ref(0);
      const courseData = ref<FindAllResponseCourse>({
        page: 1,
        size: 0,
        courses: []
      });
  
      const totalPages = computed(() => {
        return Math.ceil(totalItems.value / itemsPerPage.value) || 1;
      });
  
      const fetchCourses = async (page: number) => {
        isLoading.value = true;
        error.value = '';
        
        try {
          courseData.value = await courseService.getCourse(page, itemsPerPage.value);
          
          // If we know the total count from the server, we'd use it here
          // For now, assuming we have more pages if we received a full page of results
          if (courseData.value.courses.length === itemsPerPage.value) {
            totalItems.value = page * itemsPerPage.value + itemsPerPage.value;
          } else {
            totalItems.value = (page - 1) * itemsPerPage.value + courseData.value.courses.length;
          }
        } catch (err) {
          error.value = 'Не удалось загрузить курсы. Попробуйте позже.';
          console.error(err);
        } finally {
          isLoading.value = false;
        }
      };
  
      const changePage = (page: number) => {
        if (page < 1 || page > totalPages.value) return;
        currentPage.value = page;
        fetchCourses(page);
      };
  
      onMounted(() => {
        fetchCourses(currentPage.value);
      });
  
      return {
        isLoading,
        error,
        courseData,
        currentPage,
        totalPages,
        changePage
      };
    }
  });
  </script>
  
  <style scoped>
  .courses-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    margin-bottom: 30px;
    text-align: center;
    color: #333;
  }
  
  .error-message {
    color: #e53935;
    text-align: center;
    margin: 30px 0;
    padding: 15px;
    background-color: #ffebee;
    border-radius: 4px;
  }
  
  .no-courses {
    text-align: center;
    margin: 40px 0;
    color: #666;
    font-size: 18px;
  }
  
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
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
  </style>
  