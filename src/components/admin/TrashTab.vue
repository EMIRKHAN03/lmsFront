<template>
    <div class="trash-management">
      <div class="header">
        <h1>Управление корзиной</h1>
        <div class="header-info">
          <span class="total-items">
            Всего элементов: {{ totalItems }}
          </span>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchTrashItems" class="retry-btn">
          Попробовать снова
        </button>
      </div>
  
      <!-- Empty State -->
      <div v-else-if="trashItems.length === 0" class="empty-state">
        <div class="empty-icon">🗑️</div>
        <h3>Корзина пуста</h3>
        <p>Здесь будут отображаться удаленные элементы</p>
      </div>
  
      <!-- Trash Items -->
      <div v-else class="trash-content">
        <div class="trash-grid">
          <div 
            v-for="item in trashItems" 
            :key="item.id" 
            class="trash-item"
            :class="getItemTypeClass(item.type)"
          >
            <div class="item-header">
              <div class="item-type">
                <span class="type-icon">{{ getTypeIcon(item.type) }}</span>
                <span class="type-label">{{ getTypeLabel(item.type) }}</span>
              </div>
              <div class="item-actions">
                <button 
                  @click="restoreItem(item.id)" 
                  class="restore-btn"
                  :disabled="processingItems.has(item.id)"
                  title="Восстановить"
                >
                  <span v-if="processingItems.has(item.id)">⏳</span>
                  <span v-else>↩️</span>
                </button>
                <button 
                  @click="deleteItem(item.id)" 
                  class="delete-btn"
                  :disabled="processingItems.has(item.id)"
                  title="Удалить навсегда"
                >
                  <span v-if="processingItems.has(item.id)">⏳</span>
                  <span v-else>🗑️</span>
                </button>
              </div>
            </div>
            
            <div class="item-content">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-date">
                Удалено: {{ formatDate(item.dateOfDelete) }}
              </p>
            </div>
          </div>
        </div>
  
        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1 || loading"
            class="page-btn"
          >
            ← Предыдущая
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in getVisiblePages()"
              :key="page"
              @click="goToPage(page)"
              :class="['page-btn', { active: page === currentPage }]"
              :disabled="loading"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages || loading"
            class="page-btn"
          >
            Следующая →
          </button>
        </div>
      </div>
  
      <!-- Success/Error Notifications -->
      <div v-if="notification" class="notification" :class="notification.type">
        <p>{{ notification.message }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import axios from 'axios'
  
  // Types
  interface TrashItem {
    id: number
    type: TrashType
    name: string
    dateOfDelete: string
  }
  
  interface TrashResponse {
    page: number
    size: number
    trashResponses: TrashItem[]
  }
  
  interface ApiResponse {
    httpStatus: string
    message: string
  }
  
  type TrashType = 'STUDENT' | 'INSTRUCTOR' | 'GROUP' | 'COURSE' | 'LINK' | 'PRESENTATION' | 'VIDEO' | 'TEST' | 'TASK' | 'LESSON'
  
  interface Notification {
    type: 'success' | 'error'
    message: string
  }
  
  // Reactive state
  const trashItems = ref<TrashItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(6)
  const totalItems = ref(0)
  const processingItems = ref(new Set<number>())
  const notification = ref<Notification | null>(null)
  
  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
  
  // API base URL - adjust according to your backend configuration
  const API_BASE_URL = 'http://localhost:8088/api/trash'
  
  // Fetch trash items
  const fetchTrashItems = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.get<TrashResponse>(`${API_BASE_URL}/findAll`, {
        params: {
          page: currentPage.value,
          size: pageSize.value
        }
      })
      
      trashItems.value = response.data.trashResponses
      totalItems.value = response.data.trashResponses.length
      
    } catch (err) {
      error.value = 'Ошибка при загрузке данных корзины'
      console.error('Error fetching trash items:', err)
    } finally {
      loading.value = false
    }
  }
  
  // Restore item
  const restoreItem = async (itemId: number) => {
    try {
      processingItems.value.add(itemId)
      
      const response = await axios.delete<ApiResponse>(`${API_BASE_URL}/restore/${itemId}`)
      
      showNotification('success', response.data.message || 'Элемент успешно восстановлен')
      await fetchTrashItems()
      
    } catch (err) {
      showNotification('error', 'Ошибка при восстановлении элемента')
      console.error('Error restoring item:', err)
    } finally {
      processingItems.value.delete(itemId)
    }
  }
  
  // Delete item permanently
  const deleteItem = async (itemId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент навсегда? Это действие нельзя отменить.')) {
      return
    }
    
    try {
      processingItems.value.add(itemId)
      
      const response = await axios.delete<ApiResponse>(`${API_BASE_URL}/${itemId}`)
      
      showNotification('success', response.data.message || 'Элемент успешно удален')
      await fetchTrashItems()
      
    } catch (err) {
      showNotification('error', 'Ошибка при удалении элемента')
      console.error('Error deleting item:', err)
    } finally {
      processingItems.value.delete(itemId)
    }
  }
  
  // Pagination
  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page
      await fetchTrashItems()
    }
  }
  
  const getVisiblePages = () => {
    const pages: number[] = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }
  
  // Utility functions
  const getTypeIcon = (type: TrashType): string => {
    const icons: Record<TrashType, string> = {
      STUDENT: '👨‍🎓',
      INSTRUCTOR: '👨‍🏫', 
      GROUP: '👥',
      COURSE: '📚',
      LINK: '🔗',
      PRESENTATION: '📊',
      VIDEO: '🎥',
      TEST: '📝',
      TASK: '📋',
      LESSON: '📖'
    }
    return icons[type] || '📄'
  }
  
  const getTypeLabel = (type: TrashType): string => {
    const labels: Record<TrashType, string> = {
      STUDENT: 'Студент',
      INSTRUCTOR: 'Инструктор',
      GROUP: 'Группа', 
      COURSE: 'Курс',
      LINK: 'Ссылка',
      PRESENTATION: 'Презентация',
      VIDEO: 'Видео',
      TEST: 'Тест',
      TASK: 'Задание',
      LESSON: 'Урок'
    }
    return labels[type] || type
  }
  
  const getItemTypeClass = (type: TrashType): string => {
    return `type-${type.toLowerCase()}`
  }
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const showNotification = (type: 'success' | 'error', message: string) => {
    notification.value = { type, message }
    setTimeout(() => {
      notification.value = null
    }, 3000)
  }
  
  // Lifecycle
  onMounted(() => {
    fetchTrashItems()
  })
  </script>
  
  <style scoped>
  .trash-management {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
    background-color: #f8f9fa;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .header h1 {
    margin: 0;
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 600;
  }
  
  .header-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .total-items {
    background: #e3f2fd;
    color: #1976d2;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
  }
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    color: #dc3545;
  }
  
  .retry-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 15px;
    transition: background-color 0.3s ease;
  }
  
  .retry-btn:hover {
    background: #0056b3;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }
  
  .empty-state h3 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 1.5rem;
  }
  
  .empty-state p {
    color: #999;
    margin: 0;
  }
  
  .trash-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  
  .trash-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .trash-item {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    border-left: 4px solid #dee2e6;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .trash-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
  
  .trash-item.type-student { border-left-color: #28a745; }
  .trash-item.type-instructor { border-left-color: #007bff; }
  .trash-item.type-group { border-left-color: #6f42c1; }
  .trash-item.type-course { border-left-color: #fd7e14; }
  .trash-item.type-link { border-left-color: #20c997; }
  .trash-item.type-presentation { border-left-color: #e83e8c; }
  .trash-item.type-video { border-left-color: #dc3545; }
  .trash-item.type-test { border-left-color: #ffc107; }
  .trash-item.type-task { border-left-color: #17a2b8; }
  .trash-item.type-lesson { border-left-color: #6c757d; }
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .item-type {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .type-icon {
    font-size: 1.2rem;
  }
  
  .type-label {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .item-actions {
    display: flex;
    gap: 8px;
  }
  
  .restore-btn, .delete-btn {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .restore-btn {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  .restore-btn:hover:not(:disabled) {
    background: #1976d2;
    color: white;
  }
  
  .delete-btn {
    background: #ffebee;
    color: #d32f2f;
  }
  
  .delete-btn:hover:not(:disabled) {
    background: #d32f2f;
    color: white;
  }
  
  .restore-btn:disabled, .delete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .item-content h3 {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .item-date {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 30px;
    padding: 20px 0;
  }
  
  .page-btn {
    background: white;
    border: 1px solid #dee2e6;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    color: #495057;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .page-btn:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
  }
  
  .page-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }
  
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-numbers {
    display: flex;
    gap: 5px;
  }
  
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  }
  
  .notification.success {
    background: #28a745;
  }
  
  .notification.error {
    background: #dc3545;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    .trash-management {
      padding: 10px;
    }
    
    .header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 1.5rem;
    }
    
    .trash-grid {
      grid-template-columns: 1fr;
    }
    
    .item-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
    
    .item-actions {
      align-self: flex-end;
    }
    
    .pagination {
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .page-btn {
      padding: 8px 12px;
      min-width: 40px;
      height: 40px;
      font-size: 0.9rem;
    }
  }
  </style>