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
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
      <InstructorTab v-if="activeTab === 'instructors'" />
      <CourseTab v-else-if="activeTab === 'courses'" />
      <StudentTab v-else-if="activeTab === 'students'" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import InstructorTab from '@/components/admin/InstructorTab.vue';
import CourseTab from '@/components/admin/CourseTab.vue';
import StudentTab from '@/components/admin/StudentTab.vue';

export default defineComponent({
  name: 'AdminView',
  components: {
    InstructorTab,
    CourseTab,
    StudentTab
  },
  setup() {
    const activeTab = ref('instructors');
    
    return {
      activeTab
    };
  }
});
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

/* Tabs */
.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
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
}
</style>