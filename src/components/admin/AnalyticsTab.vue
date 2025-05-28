<template>
    <div class="analytics-tab">
      <div class="analytics-header">
        <h2>Аналитика</h2>
        <button 
          @click="refreshData" 
          :disabled="loading"
          class="refresh-btn"
        >
          <span v-if="loading">Загрузка...</span>
          <span v-else>Обновить</span>
        </button>
      </div>
  
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
  
      <div v-else-if="!loading && analyticsData.length > 0" class="analytics-content">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="card">
            <h3>Всего групп</h3>
            <p class="card-value">{{ totalGroups }}</p>
          </div>
          <div class="card">
            <h3>Всего студентов</h3>
            <p class="card-value">{{ totalStudents }}</p>
          </div>
          <div class="card">
            <h3>Всего инструкторов</h3>
            <p class="card-value">{{ totalInstructors }}</p>
          </div>
          <div class="card">
            <h3>Всего курсов</h3>
            <p class="card-value">{{ totalCourses }}</p>
          </div>
          <div class="card">
            <h3>Выпускников</h3>
            <p class="card-value">{{ totalGraduated }}</p>
          </div>
        </div>
  
        <!-- Charts Container -->
        <div class="charts-container">
          <!-- Students Chart -->
          <div class="chart-wrapper">
            <h3>Студенты по годам</h3>
            <div class="chart">
              <div 
                v-for="data in analyticsData" 
                :key="`students-${data.year}`" 
                class="bar-container"
              >
                <div 
                  class="bar students-bar" 
                  :style="{ height: getBarHeight(data.students, maxStudents) + '%' }"
                ></div>
                <span class="bar-label">{{ data.year }}</span>
                <span class="bar-value">{{ data.students }}</span>
              </div>
            </div>
          </div>
  
          <!-- Graduates Chart -->
          <div class="chart-wrapper">
            <h3>Выпускники по годам</h3>
            <div class="chart">
              <div 
                v-for="data in analyticsData" 
                :key="`graduated-${data.year}`" 
                class="bar-container"
              >
                <div 
                  class="bar graduated-bar" 
                  :style="{ height: getBarHeight(data.graduated, maxGraduated) + '%' }"
                ></div>
                <span class="bar-label">{{ data.year }}</span>
                <span class="bar-value">{{ data.graduated }}</span>
              </div>
            </div>
          </div>
  
          <!-- Groups Chart -->
          <div class="chart-wrapper">
            <h3>Группы по годам</h3>
            <div class="chart">
              <div 
                v-for="data in analyticsData" 
                :key="`groups-${data.year}`" 
                class="bar-container"
              >
                <div 
                  class="bar groups-bar" 
                  :style="{ height: getBarHeight(data.groups, maxGroups) + '%' }"
                ></div>
                <span class="bar-label">{{ data.year }}</span>
                <span class="bar-value">{{ data.groups }}</span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Data Table -->
        <div class="data-table-wrapper">
          <h3>Детальная статистика</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Год</th>
                <th>Группы</th>
                <th>Студенты</th>
                <th>Инструкторы</th>
                <th>Курсы</th>
                <th>Выпускники</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="data in analyticsData" :key="data.year">
                <td>{{ data.year }}</td>
                <td>{{ data.groups }}</td>
                <td>{{ data.students }}</td>
                <td>{{ data.instructors }}</td>
                <td>{{ data.courses }}</td>
                <td>{{ data.graduated }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <div v-else-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка данных аналитики...</p>
      </div>
  
      <div v-else class="no-data">
        <p>Нет данных для отображения</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { analyticsService } from '@/services/analyticsService';
  import type { AnalyticsData } from '@/types/analytics';
  
  // Reactive state
  const analyticsData = ref<AnalyticsData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed properties for totals (latest year data)
  const latestYearData = computed(() => {
    if (analyticsData.value.length === 0) return null;
    return analyticsData.value[analyticsData.value.length - 1];
  });
  
  const totalGroups = computed(() => latestYearData.value?.groups || 0);
  const totalStudents = computed(() => latestYearData.value?.students || 0);
  const totalInstructors = computed(() => latestYearData.value?.instructors || 0);
  const totalCourses = computed(() => latestYearData.value?.courses || 0);
  const totalGraduated = computed(() => latestYearData.value?.graduated || 0);
  
  // Computed properties for chart scaling
  const maxStudents = computed(() => Math.max(...analyticsData.value.map(d => d.students), 1));
  const maxGraduated = computed(() => Math.max(...analyticsData.value.map(d => d.graduated), 1));
  const maxGroups = computed(() => Math.max(...analyticsData.value.map(d => d.groups), 1));
  
  // Methods
  const fetchAnalyticsData = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await analyticsService.getAllAnalytics();
      analyticsData.value = data.sort((a, b) => a.year - b.year);
    } catch (err: any) {
      error.value = 'Ошибка при загрузке данных аналитики. Проверьте подключение к серверу.';
      console.error('Analytics fetch error:', err);
    } finally {
      loading.value = false;
    }
  };
  
  const refreshData = (): void => {
    fetchAnalyticsData();
  };
  
  const getBarHeight = (value: number, maxValue: number): number => {
    return maxValue > 0 ? (value / maxValue) * 80 : 0;
  };
  
  // Lifecycle
  onMounted(() => {
    fetchAnalyticsData();
  });
  </script>
  
  <style scoped>
  .analytics-tab {
    padding: 20px;
  }
  
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .analytics-header h2 {
    color: #333;
    margin: 0;
  }
  
  .refresh-btn {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .refresh-btn:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  .refresh-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  
  .loading {
    text-align: center;
    padding: 40px;
  }
  
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #666;
  }
  
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .card h3 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 14px;
    font-weight: 500;
  }
  
  .card-value {
    font-size: 32px;
    font-weight: bold;
    color: #007bff;
    margin: 0;
  }
  
  .charts-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
  }
  
  .chart-wrapper {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .chart-wrapper h3 {
    margin: 0 0 20px 0;
    color: #333;
    text-align: center;
  }
  
  .chart {
    display: flex;
    justify-content: space-around;
    align-items: end;
    height: 200px;
    padding: 10px;
    position: relative;
  }
  
  .bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
    max-width: 60px;
  }
  
  .bar {
    width: 40px;
    border-radius: 4px 4px 0 0;
    margin-bottom: 5px;
    transition: all 0.3s ease;
  }
  
  .students-bar {
    background: linear-gradient(to top, #007bff, #66b3ff);
  }
  
  .graduated-bar {
    background: linear-gradient(to top, #28a745, #6bcf7f);
  }
  
  .groups-bar {
    background: linear-gradient(to top, #ffc107, #ffda6a);
  }
  
  .bar-label {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
  }
  
  .bar-value {
    font-size: 11px;
    color: #333;
    font-weight: bold;
    position: absolute;
    top: -20px;
  }
  
  .data-table-wrapper {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .data-table-wrapper h3 {
    margin: 0 0 20px 0;
    color: #333;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .data-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }
  
  .data-table tr:hover {
    background-color: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    .summary-cards {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    
    .charts-container {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    .data-table {
      font-size: 14px;
    }
    
    .data-table th,
    .data-table td {
      padding: 8px;
    }
  }
  </style>