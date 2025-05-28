<template>
  <div class="admin-view">
    <h1>Панель администратора</h1>
    
    <!-- Tabs navigation -->
    <div class="tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'instructors' }" 
        @click="activeTab = 'instructors'"
      >
        Инструкторы
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'courses' }" 
        @click="activeTab = 'courses'"
      >
        Курсы
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'students' }" 
        @click="activeTab = 'students'"
      >
        Студенты
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'groups' }" 
        @click="activeTab = 'groups'"
      >
        Группы
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'analytics' }" 
        @click="activeTab = 'analytics'"
      >
        Аналитика
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'announcements' }" 
        @click="activeTab = 'announcements'"
      >
        Объявления
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'trash' }" 
        @click="activeTab = 'trash'"
      >
        <span class="trash-icon">🗑️</span>
        Корзина
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
      <InstructorTab v-if="activeTab === 'instructors'" />
      <CourseTab v-else-if="activeTab === 'courses'" />
      <StudentTab v-else-if="activeTab === 'students'" />
      <GroupTab v-else-if="activeTab === 'groups'" />
      <AnalyticsTab v-else-if="activeTab === 'analytics'" />
      <AnnouncementTab v-else-if="activeTab === 'announcements'" />
      <TrashTab v-else-if="activeTab === 'trash'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InstructorTab from '@/components/admin/InstructorTab.vue';
import CourseTab from '@/components/admin/CourseTab.vue';
import StudentTab from '@/components/admin/StudentTab.vue';
import GroupTab from '@/components/admin/GroupTab.vue';
import AnalyticsTab from '@/components/admin/AnalyticsTab.vue';
import AnnouncementTab from '@/components/admin/AnnouncementTab.vue';
import TrashTab from '@/components/admin/TrashTab.vue';
const activeTab = ref('instructors');
</script>

<style scoped>
.admin-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #007bff;
}

.tab-button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.tab-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

@media (max-width: 768px) {
  .admin-view {
    padding: 10px;
  }
  
  .tabs {
    gap: 5px;
  }
  
  .tab-button {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .tab-content {
    padding: 15px;
  }
}
</style>