<!-- views/FileManagerView.vue -->
<template>
    <div class="file-manager">
      <div class="header">
        <h1 class="page-title">Управление файлами</h1>
        <p class="page-description">
          Загружайте, скачивайте и управляйте файлами
        </p>
      </div>
  
      <div class="content">
        <!-- File Upload Component -->
        <FileUpload
          :max-size-m-b="maxFileSize"
          :allowed-types="allowedFileTypes"
          :multiple="true"
          @file-uploaded="handleFileUploaded"
          @file-deleted="handleFileDeleted"
        />
  
        <!-- Statistics -->
        <div v-if="statistics" class="statistics">
          <div class="stat-card">
            <div class="stat-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-value">{{ statistics.totalFiles }}</p>
              <p class="stat-label">Всего файлов</p>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-value">{{ formatFileSize(statistics.totalSize) }}</p>
              <p class="stat-label">Общий размер</p>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2L3 8v10a1 1 0 001 1h12a1 1 0 001-1V8l-7-6z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-value">{{ formatFileSize(statistics.remainingSpace) }}</p>
              <p class="stat-label">Свободное место</p>
            </div>
          </div>
        </div>
  
        <!-- File Filters -->
        <div class="filters">
          <div class="filter-group">
            <label class="filter-label">Поиск файлов:</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Введите название файла..."
              class="search-input"
            />
          </div>
  
          <div class="filter-group">
            <label class="filter-label">Тип файла:</label>
            <select v-model="selectedFileType" class="filter-select">
              <option value="">Все типы</option>
              <option value="image">Изображения</option>
              <option value="document">Документы</option>
              <option value="video">Видео</option>
              <option value="audio">Аудио</option>
              <option value="archive">Архивы</option>
              <option value="other">Другие</option>
            </select>
          </div>
  
          <div class="filter-group">
            <label class="filter-label">Сортировка:</label>
            <select v-model="sortBy" class="filter-select">
              <option value="name">По названию</option>
              <option value="date">По дате</option>
              <option value="size">По размеру</option>
            </select>
          </div>
  
          <div class="filter-group">
            <button @click="toggleSortOrder" class="sort-toggle-btn">
              <svg v-if="sortOrder === 'asc'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
              </svg>
              <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
              </svg>
            </button>
          </div>
        </div>
  
        <!-- Filtered Files Display -->
        <div v-if="filteredFiles.length > 0" class="filtered-files">
          <h3 class="section-title">
            Файлы ({{ filteredFiles.length }})
          </h3>
          
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'"
              :class="['view-btn', { active: viewMode === 'grid' }]"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="['view-btn', { active: viewMode === 'list' }]"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
  
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="files-grid">
            <div 
              v-for="file in filteredFiles" 
              :key="file.id"
              class="file-card"
              @click="handleFileClick(file)"
            >
              <div class="file-preview">
                <div class="file-type-icon" :class="getFileTypeClass(file.originalName)">
                  <component :is="getFileIcon(file.originalName)" />
                </div>
              </div>
              
              <div class="file-card-content">
                <h4 class="file-card-title" :title="file.originalName">
                  {{ truncateFileName(file.originalName, 20) }}
                </h4>
                <p class="file-card-meta">
                  {{ formatFileSize(file.size) }}
                </p>
                <p class="file-card-date">
                  {{ formatDate(file.uploadDate) }}
                </p>
              </div>
              
              <div class="file-card-actions">
                <button 
                  @click.stop="downloadFile(file.fileName, file.originalName)"
                  class="card-action-btn download"
                  title="Скачать"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                </button>
                
                <button 
                  @click.stop="confirmDelete(file)"
                  class="card-action-btn delete"
                  title="Удалить"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
  
          <!-- List View -->
          <div v-if="viewMode === 'list'" class="files-table">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Размер</th>
                  <th>Дата загрузки</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in filteredFiles" :key="file.id" class="file-row">
                  <td class="file-name-cell">
                    <div class="file-name-content">
                      <div class="file-type-icon small" :class="getFileTypeClass(file.originalName)">
                        <component :is="getFileIcon(file.originalName)" />
                      </div>
                      <span class="file-name" :title="file.originalName">
                        {{ file.originalName }}
                      </span>
                    </div>
                  </td>
                  <td>{{ formatFileSize(file.size) }}</td>
                  <td>{{ formatDate(file.uploadDate) }}</td>
                  <td class="actions-cell">
                    <button 
                      @click="downloadFile(file.fileName, file.originalName)"
                      class="table-action-btn download"
                      title="Скачать"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      </svg>
                    </button>
                    
                    <button 
                      @click="confirmDelete(file)"
                      class="table-action-btn delete"
                      title="Удалить"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <h3 class="empty-title">Файлы не найдены</h3>
          <p class="empty-description">
            {{ searchQuery ? 'Попробуйте изменить параметры поиска' : 'Загрузите файлы для начала работы' }}
          </p>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>Подтверждение удаления</h3>
            <button @click="cancelDelete" class="close-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <p>Вы уверены, что хотите удалить файл?</p>
            <p class="file-name-highlight">{{ fileToDelete?.originalName }}</p>
            <p class="warning-text">Это действие нельзя отменить.</p>
          </div>
          
          <div class="modal-footer">
            <button @click="cancelDelete" class="cancel-btn">
              Отмена
            </button>
            <button @click="executeDelete" class="confirm-delete-btn" :disabled="loading">
              {{ loading ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useFiles } from '@/composables/useFiles';
  import FileUpload from '@/components/FileUpload.vue';
  import type { UploadedFile } from '@/types/file';
  
  // Configuration
  const maxFileSize = ref<number>(10);
  const allowedFileTypes = ref<string[]>(['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'zip', 'rar']);
  
  // File management
  const { 
    loading, 
    files, 
    deleteFile, 
    downloadFile, 
    formatFileSize 
  } = useFiles();
  
  // UI state
  const searchQuery = ref<string>('');
  const selectedFileType = ref<string>('');
  const sortBy = ref<string>('date');
  const sortOrder = ref<'asc' | 'desc'>('desc');
  const viewMode = ref<'grid' | 'list'>('grid');
  const showDeleteModal = ref<boolean>(false);
  const fileToDelete = ref<UploadedFile | null>(null);
  
  // Statistics
  const statistics = computed(() => {
    if (files.value.length === 0) return null;
    
    const totalSize = files.value.reduce((sum, file) => sum + file.size, 0);
    const maxStorage = 1024 * 1024 * 1024; // 1GB
    
    return {
      totalFiles: files.value.length,
      totalSize,
      remainingSpace: maxStorage - totalSize
    };
  });
  
  // Filtered and sorted files
  const filteredFiles = computed(() => {
    let filtered = files.value;
  
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(file => 
        file.originalName.toLowerCase().includes(query)
      );
    }
  
    // Apply file type filter
    if (selectedFileType.value) {
      filtered = filtered.filter(file => {
        const extension = getFileExtension(file.originalName);
        return getFileCategory(extension) === selectedFileType.value;
      });
    }
  
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy.value) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case 'date':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      
      return sortOrder.value === 'desc' ? -comparison : comparison;
    });
  
    return filtered;
  });
  
  // File type utilities
  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };
  
  const getFileCategory = (extension: string): string => {
    const categories = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
      document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
      video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
      audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
      archive: ['zip', 'rar', '7z', 'tar', 'gz']
    };
  
    for (const [category, extensions] of Object.entries(categories)) {
      if (extensions.includes(extension)) {
        return category;
      }
    }
    
    return 'other';
  };
  
  const getFileTypeClass = (fileName: string): string => {
    const extension = getFileExtension(fileName);
    const category = getFileCategory(extension);
    return `file-type-${category}`;
  };
  
  const getFileIcon = (fileName: string) => {
    const extension = getFileExtension(fileName);
    const category = getFileCategory(extension);
    
    const iconMap = {
      image: 'svg',
      document: 'svg',
      video: 'svg',
      audio: 'svg',
      archive: 'svg',
      other: 'svg'
    };
    
    // Return appropriate SVG component based on file type
    return 'svg';
  };
  
  // Utility functions
  const truncateFileName = (fileName: string, maxLength: number): string => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.substring(0, maxLength - extension!.length - 4);
    
    return `${truncatedName}...${extension}`;
  };
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Event handlers
  const handleFileUploaded = (file: UploadedFile) => {
    console.log('File uploaded:', file);
  };
  
  const handleFileDeleted = (fileName: string) => {
    console.log('File deleted:', fileName);
  };
  
  const handleFileClick = (file: UploadedFile) => {
    // Handle file preview or details view
    console.log('File clicked:', file);
  };
  
  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  };
  
  const confirmDelete = (file: UploadedFile) => {
    fileToDelete.value = file;
    showDeleteModal.value = true;
  };
  
  const cancelDelete = () => {
    fileToDelete.value = null;
    showDeleteModal.value = false;
  };
  
  const executeDelete = async () => {
    if (fileToDelete.value) {
      const success = await deleteFile(fileToDelete.value.fileName);
      if (success) {
        handleFileDeleted(fileToDelete.value.fileName);
      }
    }
    cancelDelete();
  };
  
  onMounted(() => {
    // Load initial data if needed
  });
  </script>
  
  <style scoped>
  .file-manager {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .page-description {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .statistics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin: 24px 0;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    color: #3b82f6;
    background-color: #eff6ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .stat-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 4px 0;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
  
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: end;
    padding: 20px;
    background-color: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .filter-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
  }
  
  .search-input,
  .filter-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    background-color: #ffffff;
    min-width: 180px;
  }
  
  .search-input:focus,
  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .sort-toggle-btn {
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .sort-toggle-btn:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .sort-toggle-btn svg {
    width: 18px;
    height: 18px;
    color: #6b7280;
  }
  
  .filtered-files {
    margin-top: 24px;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .view-toggle {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
  }
  
  .view-btn {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    background-color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .view-btn:first-child {
    border-radius: 6px 0 0 6px;
  }
  
  .view-btn:last-child {
    border-radius: 0 6px 6px 0;
    border-left: none;
  }
  
  .view-btn.active {
    background-color: #3b82f6;
    border-color: #3b82f6;
    color: #ffffff;
  }
  
  .view-btn:not(.active):hover {
    background-color: #f3f4f6;
  }
  
  .view-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .file-card {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }
  
  .file-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
    transform: translateY(-2px);
  }
  
  .file-preview {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .file-type-icon {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .file-type-icon.small {
    width: 32px;
    height: 32px;
  }
  
  .file-type-icon svg {
    width: 32px;
    height: 32px;
    color: #ffffff;
  }
  
  .file-type-icon.small svg {
    width: 20px;
    height: 20px;
  }
  
  .file-type-image { background-color: #ef4444; }
  .file-type-document { background-color: #3b82f6; }
  .file-type-video { background-color: #8b5cf6; }
  .file-type-audio { background-color: #f59e0b; }
  .file-type-archive { background-color: #10b981; }
  .file-type-other { background-color: #6b7280; }
  
  .file-card-content {
    text-align: center;
    margin-bottom: 16px;
  }
  
  .file-card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
    word-break: break-word;
  }
  
  .file-card-meta {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0 0 4px 0;
  }
  
  .file-card-date {
    font-size: 0.8rem;
    color: #9ca3af;
    margin: 0;
  }
  
  .file-card-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
  
  .card-action-btn {
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-action-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .card-action-btn.download {
    background-color: #eff6ff;
    color: #3b82f6;
  }
  
  .card-action-btn.download:hover {
    background-color: #dbeafe;
  }
  
  .card-action-btn.delete {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  .card-action-btn.delete:hover {
    background-color: #fee2e2;
  }
  
  .files-table {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  
  .files-table table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .files-table th,
  .files-table td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .files-table th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
  }
  
  .files-table tr:last-child td {
    border-bottom: none;
  }
  
  .file-row:hover {
    background-color: #f9fafb;
  }
  
  .file-name-cell {
    min-width: 300px;
  }
  
  .file-name-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .file-name {
    font-weight: 500;
    color: #1f2937;
  }
  
  .actions-cell {
    width: 120px;
  }
  
  .table-action-btn {
    padding: 6px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .table-action-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .table-action-btn.download {
    background-color: #eff6ff;
    color: #3b82f6;
  }
  
  .table-action-btn.download:hover {
    background-color: #dbeafe;
  }
  
  .table-action-btn.delete {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  .table-action-btn.delete:hover {
    background-color: #fee2e2;
  }
  
  .empty-state {
    text-align: center;
    padding: 48px 20px;
    background-color: #f9fafb;
    border-radius: 12px;
    border: 2px dashed #d1d5db;
  }
  
  .empty-icon {
    width: 64px;
    height: 64px;
    color: #9ca3af;
    margin: 0 auto 16px;
  }
  
  .empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
  }
  
  .empty-description {
    color: #6b7280;
    margin: 0;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background-color: #ffffff;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  
  .close-btn {
    padding: 4px;
    border: none;
    background: none;
    cursor: pointer;
    color: #6b7280;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .close-btn:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .close-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .modal-body p {
    margin: 0 0 12px 0;
    color: #374151;
    line-height: 1.5;
  }
  
  .file-name-highlight {
    font-weight: 600;
    color: #1f2937;
    background-color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 6px;
    word-break: break-word;
  }
  
  .warning-text {
    color: #dc2626;
    font-size: 0.9rem;
    font-style: italic;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }
  
  .cancel-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    background-color: #ffffff;
    color: #374151;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .cancel-btn:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
  
  .confirm-delete-btn {
    padding: 8px 16px;
    border: none;
    background-color: #dc2626;
    color: #ffffff;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .confirm-delete-btn:hover:not(:disabled) {
    background-color: #b91c1c;
  }
  
  .confirm-delete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .file-manager {
      padding: 16px;
    }
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .statistics {
      grid-template-columns: 1fr;
    }
    
    .filters {
      flex-direction: column;
      align-items: stretch;
    }
    
    .filter-group {
      width: 100%;
    }
    
    .search-input,
    .filter-select {
      min-width: auto;
      width: 100%;
    }
    
    .files-grid {
      grid-template-columns: 1fr;
    }
    
    .files-table {
      overflow-x: auto;
    }
    
    .file-name-cell {
      min-width: 200px;
    }
    
    .modal {
      margin: 16px;
      width: calc(100% - 32px);
    }
    
    .modal-footer {
      flex-direction: column-reverse;
    }
    
    .cancel-btn,
    .confirm-delete-btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  @media (max-width: 480px) {
    .view-toggle {
      justify-content: center;
    }
    
    .stat-card {
      flex-direction: column;
      text-align: center;
    }
    
    .file-card-actions {
      flex-direction: column;
    }
    
    .card-action-btn {
      width: 100%;
      justify-content: center;
      padding: 12px;
    }
  }
  </style>