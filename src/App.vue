<template>
  <div id="app">
    <nav v-if="isLoggedIn" class="navbar">
      <div class="navbar-brand">LMS System</div>
      <div class="navbar-menu">
        <button class="logout-btn" @click="handleLogout">Выйти</button>
      </div>
    </nav>
    
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

export default defineComponent({
  name: 'App',
  setup() {
    const { logout } = useAuth();
    
    const isLoggedIn = computed(() => {
      return !!localStorage.getItem('token');
    });
    
    const handleLogout = () => {
      logout();
    };
    
    return {
      isLoggedIn,
      handleLogout
    };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 20px;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>