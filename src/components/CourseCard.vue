<template>
    <div class="course-card">
      <div class="course-image">
        <img :src="course.image || '/default-course.jpg'" :alt="course.title">
      </div>
      <div class="course-content">
        <h3>{{ course.title }}</h3>
        <p class="description">{{ truncateDescription(course.description) }}</p>
        <p class="end-date" v-if="course.dateOfEnd">
          Завершение: {{ formatDate(course.dateOfEnd) }}
        </p>
        <button class="view-button" @click="viewCourse">Просмотреть</button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { CourseResponse } from '@/types/course';
  
  export default defineComponent({
    name: 'CourseCard',
    props: {
      course: {
        type: Object as PropType<CourseResponse>,
        required: true
      }
    },
    methods: {
      truncateDescription(description: string): string {
        return description.length > 100 ? `${description.substring(0, 100)}...` : description;
      },
      formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
      },
      viewCourse() {
        this.$router.push(`/course/${this.course.id}`);
      }
    }
  });
  </script>
  
  <style scoped>
  .course-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    background-color: white;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  h3 {
    margin-top: 0;
    font-size: 18px;
    color: #333;
  }
  
  .description {
    color: #666;
    flex-grow: 1;
  }
  
  .end-date {
    color: #888;
    font-size: 14px;
    margin-top: 10px;
  }
  
  .view-button {
    background-color: #4a6bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 15px;
    transition: background-color 0.3s;
  }
  
  .view-button:hover {
    background-color: #3a5bef;
  }
  </style>