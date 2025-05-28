<template>
  <div class="instructor-view">
    <header class="header">
      <h1>Панель преподавателя</h1>
      <div class="user-actions">
        <button class="btn btn-secondary" @click="logout">Выйти</button>
      </div>
    </header>

    <div class="courses-view">
      <CourseList />
    </div> 
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import CourseList from '@/components/CourseList.vue';
import { useRoute } from 'vue-router'; 

export default defineComponent({
  name: 'InstructorView',
  components: {
      CourseList
      
    },
    
  setup() {
    const route = useRoute();
    const { logout } = useAuth();
    
    // State    
    return {
      logout
    };
  }
});
</script>

<style scoped>
.instructor-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 1rem;
  overflow-y: auto;
}

</style>