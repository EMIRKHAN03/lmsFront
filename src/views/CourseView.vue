<template>
  <div class="course-view">
    <div v-if="isLoading" class="loading">
      Загрузка курса...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else class="course-content">
      <div class="course-header">
        <button @click="goBack" class="back-button">← Назад к курсам</button>
        <h1>{{ course.title }}</h1>
        
        <p class="end-date" v-if="course.dateOfEnd">
          Завершение: {{ formatDate(course.dateOfEnd) }}
        </p>
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
          :class="{ active: activeTab === 'lessons' }"
          @click="activeTab = 'lessons'"
        >
          Уроки
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'filesupload' }"
          @click="activeTab = 'filesupload'"
        >
        Загрузки файлов
        </button>
        
        <!-- Add more tabs as needed -->
      </div>
      
      <div class="tab-content">
        <div v-if="activeTab === 'overview'" class="overview-tab">
          <!-- Course overview content -->
          <div class="overview-section">
            <h2>Описание курса</h2>
            <p>{{ course.description || 'Подробное описание не добавлено.' }}</p>
          </div>
          
          <!-- You can add more overview sections here -->
          <div class="overview-section">
            <h2>Информация для преподавателя</h2>
            <p>Здесь может быть дополнительная информация и статистика по курсу, видимая только преподавателям.</p>
          </div>
        </div>
        
        <div v-if="activeTab === 'lessons'" class="lessons-tab">
          <!-- Pass the course ID to the LessonList component -->
          <LessonList :courseId="Number(courseId)" />
        </div>
        <div v-if="activeTab === 'filesupload'" class="filesupload-tab">
        <FileUpload :course-id="Number(courseId)" />
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import LessonList from '@/components/LessonList.vue';
import courseService from '@/services/courseServices';
import { CourseResponse } from '@/types/course';
import FileUpload from '@/components/FileUpload.vue';


export default defineComponent({
  name: 'CourseView',
  components: {
    LessonList,
    FileUpload
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { user } = useAuth();
    
    const courseId = computed(() => route.params.id as string);
    const isLoading = ref(true);
    const error = ref('');
    const activeTab = ref('overview');
    
    const course = ref<CourseResponse>({
      id: 0,
      title: '',
      description: '',
      image: '',
      dateOfEnd: ''
    });

    const fetchCourse = async () => {
      isLoading.value = true;
      error.value = '';
      
      try {
        // Assume there's a getCourse method in courseService
        // You'll need to implement this method in your courseService
        const response = await courseService.getCourse();
        const found = response.courses.find(c => c.id === Number(courseId.value));
        if (found) {
        course.value = found;
        } else {
        error.value = 'Курс не найден';
        }

      
      } catch (err) {
        error.value = 'Не удалось загрузить курс. Попробуйте позже.';
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
      router.push('/courses');
    };

    onMounted(() => {
      fetchCourse();
    });

    return {
      isLoading,
      error,
      course,
      activeTab,
      courseId,
      formatDate,
      goBack
    };
  }
});
</script>

<style scoped>
.course-view {
  max-width: 1000px;
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

.course-header {
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

.course-header h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  color: #333;
}

.description {
  color: #555;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 10px;
}

.end-date {
  color: #666;
  font-size: 14px;
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
  min-height: 300px;
}

.overview-tab {
  padding: 20px 0;
}

.overview-section {
  margin-bottom: 30px;
}

.overview-section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.overview-section p {
  color: #555;
  line-height: 1.6;
}
</style>