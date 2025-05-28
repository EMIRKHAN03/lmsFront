<template>
    <div class="lesson-item">
      <div class="lesson-content" @click="viewLesson">
        <h3>{{ lesson.title }}</h3>
        <p class="date">Дата создания: {{ formatDate(lesson.createdAt) }}</p>
      </div>
      
      <div class="lesson-actions">
        <button @click.stop="$emit('edit', lesson)" class="btn-edit">
          Редактировать
        </button>
        <button @click.stop="$emit('delete', lesson.id)" class="btn-delete">
          Удалить
        </button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { useRouter } from 'vue-router';
  import { LessonResponse } from '@/types/lesson';
  
  export default defineComponent({
    name: 'LessonItem',
    props: {
      lesson: {
        type: Object as PropType<LessonResponse>,
        required: true
      },
      courseId: {
        type: Number,
        required: true
      }
    },
    emits: ['edit', 'delete'],
    setup(props) {
      const router = useRouter();
      
      const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
      };
      
      const viewLesson = () => {
        router.push(`/course/${props.courseId}/lesson/${props.lesson.id}`);
      };
      
      return {
        formatDate,
        viewLesson
      };
    }
  });
  </script>
  
  <style scoped>
  .lesson-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: white;
    transition: background-color 0.2s;
  }
  
  .lesson-item:hover {
    background-color: #f5f5f5;
  }
  
  .lesson-content {
    cursor: pointer;
    flex-grow: 1;
  }
  
  .lesson-content h3 {
    margin: 0 0 5px 0;
    font-size: 18px;
  }
  
  .lesson-content .date {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
  
  .lesson-actions {
    display: flex;
    gap: 10px;
  }
  
  .btn-edit {
    background-color: #2196f3;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-delete {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>