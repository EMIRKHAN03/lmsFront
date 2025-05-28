// components/TaskItem.vue
<template>
  <div class="task-item">
    <div class="task-content" @click="viewTask">
      <div class="task-header">
        <h3>{{ task.title }}</h3>
        <span class="deadline" :class="deadlineClass">
          {{ formatDeadline(task.deadline) }}
        </span>
      </div>
      
      <p class="task-description">{{ truncateDescription(task.description) }}</p>
      
      <div class="task-meta">
        <div class="task-links" v-if="task.links.length">
          <span class="links-count">{{ task.links.length }} ссылок</span>
        </div>
        <div class="task-attachments">
          <span v-if="task.file" class="attachment-indicator">📎 Файл</span>
          <span v-if="task.image" class="attachment-indicator">🖼️ Изображение</span>
          <span v-if="task.code" class="attachment-indicator">💻 Код</span>
        </div>
      </div>
    </div>
    
    <div class="task-actions" v-if="canEdit">
      <button @click.stop="$emit('edit', task)" class="btn-edit">
        Редактировать
      </button>
      <button @click.stop="$emit('delete', task.id)" class="btn-delete">
        Удалить
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { useRouter } from 'vue-router';
import { TaskResponse } from '@/types/task';
import { useAuth } from '@/composables/useAuth';

export default defineComponent({
  name: 'TaskItem',
  props: {
    task: {
      type: Object as PropType<TaskResponse>,
      required: true
    },
    lessonId: {
      type: Number,
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
    const { user } = useAuth();
    
    const canEdit = computed(() => {
      return user.value?.role === 'INSTRUCTOR';
    });
    
    const deadlineClass = computed(() => {
      const now = new Date();
      const deadline = new Date(props.task.deadline);
      const timeDiff = deadline.getTime() - now.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      if (daysDiff < 0) return 'deadline-passed';
      if (daysDiff < 1) return 'deadline-urgent';
      if (daysDiff < 3) return 'deadline-soon';
      return 'deadline-normal';
    });
    
    const formatDeadline = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const timeDiff = date.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      if (daysDiff < 0) return `Просрочено (${formattedDate})`;
      if (daysDiff === 0) return `Сегодня (${formattedDate})`;
      if (daysDiff === 1) return `Завтра (${formattedDate})`;
      if (daysDiff < 7) return `Через ${daysDiff} дн. (${formattedDate})`;
      return formattedDate;
    };
    
    const truncateDescription = (description: string): string => {
      return description.length > 150 ? `${description.substring(0, 150)}...` : description;
    };
    
    const viewTask = () => {
      router.push(`/course/${props.courseId}/lesson/${props.lessonId}/task/${props.task.id}`);
    };
    
    return {
      canEdit,
      deadlineClass,
      formatDeadline,
      truncateDescription,
      viewTask
    };
  }
});
</script>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  transition: box-shadow 0.2s, transform 0.2s;
}

.task-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-content {
  cursor: pointer;
  flex-grow: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.task-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.deadline {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.deadline-normal {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.deadline-soon {
  background-color: #fff3e0;
  color: #f57c00;
}

.deadline-urgent {
  background-color: #ffebee;
  color: #d32f2f;
}

.deadline-passed {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.task-description {
  margin: 10px 0;
  color: #666;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.links-count {
  font-size: 14px;
  color: #2196f3;
  background-color: #e3f2fd;
  padding: 2px 8px;
  border-radius: 12px;
}

.task-attachments {
  display: flex;
  gap: 8px;
}

.attachment-indicator {
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #666;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 15px;
}

.btn-edit {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-delete {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
</style>