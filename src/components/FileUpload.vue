<!-- components/FileUpload.vue -->
<template>
    <div class="file-upload-container">
      <div class="upload-section">
        <h3 class="section-title">Загрузка файлов</h3>
        
        <!-- Drag and Drop Area -->
        <div 
          class="drop-zone"
          :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
          @drop="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @click="triggerFileInput"
        >
          <div v-if="!isUploading" class="drop-zone-content">
            <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="drop-text">
              Перетащите файлы сюда или <span class="click-text">нажмите для выбора</span>
            </p>
            <p class="drop-subtext">Максимальный размер: {{ maxSizeMB }}MB</p>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="isUploading" class="upload-progress">
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <p class="progress-text">Загрузка... {{ uploadProgress }}%</p>
          </div>
        </div>
        
        <!-- File Input -->
        <input
          ref="fileInput"
          type="file"
          multiple
          class="file-input"
          @change="handleFileSelect"
          :accept="acceptedTypes"
        />
        
        <!-- Messages -->
        <div v-if="error" class="message error-message">
          <svg class="message-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          {{ error }}
        </div>
        
        <div v-if="success" class="message success-message">
          <svg class="message-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          {{ success }}
        </div>
      </div>
      
      <!-- Files List -->
      <div v-if="files.length > 0" class="files-section">
        <h3 class="section-title">Загруженные файлы</h3>
        <div class="files-list">
          <div 
            v-for="file in files" 
            :key="file.id"
            class="file-item"
          >
            <div class="file-info">
              <div class="file-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="file-details">
                <p class="file-name">{{ file.originalName }}</p>
                <p class="file-meta">
                  {{ formatFileSize(file.size) }} • 
                  {{ formatDate(file.uploadDate) }}
                </p>
              </div>
            </div>
            
            <div class="file-actions">
              <button 
                @click="handleDownload(file)"
                class="action-btn download-btn"
                :disabled="loading"
                title="Скачать"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </button>
              
              <button 
                @click="handleDelete(file)"
                class="action-btn delete-btn"
                :disabled="loading"
                title="Удалить"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useFiles } from '@/composables/useFiles';
  import type { UploadedFile } from '@/types/file';
  
  interface Props {
    maxSizeMB?: number;
    allowedTypes?: string[];
    multiple?: boolean;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    maxSizeMB: 10,
    allowedTypes: () => [],
    multiple: true
  });
  
  const emit = defineEmits<{
    fileUploaded: [file: UploadedFile];
    fileDeleted: [fileName: string];
  }>();
  
  const {
    loading,
    uploadProgress,
    error,
    success,
    files,
    isUploading,
    uploadFile,
    deleteFile,
    downloadFile,
    validateFile,
    formatFileSize,
    clearMessages
  } = useFiles();
  
  const fileInput = ref<HTMLInputElement>();
  const isDragOver = ref<boolean>(false);
  
  const acceptedTypes = computed(() => {
    if (props.allowedTypes.length === 0) return '*';
    return props.allowedTypes.map(type => `.${type}`).join(',');
  });
  
  const triggerFileInput = () => {
    if (!isUploading.value) {
      fileInput.value?.click();
    }
  };
  
  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      handleFiles(Array.from(target.files));
    }
  };
  
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = false;
    
    if (event.dataTransfer?.files) {
      handleFiles(Array.from(event.dataTransfer.files));
    }
  };
  
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = true;
  };
  
  const handleDragLeave = () => {
    isDragOver.value = false;
  };
  
  const handleFiles = async (filesList: File[]) => {
    clearMessages();
    
    for (const file of filesList) {
      const validationError = validateFile(file, props.maxSizeMB, props.allowedTypes);
      if (validationError) {
        error.value = validationError;
        continue;
      }
      
      const response = await uploadFile(file);
      if (response) {
        const uploadedFile: UploadedFile = {
          id: response.fileName,
          fileName: response.fileName,
          originalName: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          url: response.urlFile
        };
        emit('fileUploaded', uploadedFile);
      }
      
      if (!props.multiple) break;
    }
    
    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };
  
  const handleDownload = async (file: UploadedFile) => {
    await downloadFile(file.fileName, file.originalName);
  };
  
  const handleDelete = async (file: UploadedFile) => {
    if (confirm(`Вы уверены, что хотите удалить файл "${file.originalName}"?`)) {
      const success = await deleteFile(file.fileName);
      if (success) {
        emit('fileDeleted', file.fileName);
      }
    }
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
  
  onMounted(() => {
    // Clear messages when component mounts
    clearMessages();
  });
  </script>
  
  <style scoped>
  .file-upload-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .upload-section {
    margin-bottom: 32px;
  }
  
  .drop-zone {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f9fafb;
  }
  
  .drop-zone:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
  
  .drop-zone.drag-over {
    border-color: #3b82f6;
    background-color: #eff6ff;
    transform: scale(1.02);
  }
  
  .drop-zone.uploading {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .upload-icon {
    width: 48px;
    height: 48px;
    color: #6b7280;
  }
  
  .drop-text {
    font-size: 1.1rem;
    color: #374151;
    margin: 0;
  }
  
  .click-text {
    color: #3b82f6;
    font-weight: 500;
  }
  
  .drop-subtext {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
  
  .upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .progress-bar-container {
    width: 200px;
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #3b82f6;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 0.9rem;
    color: #374151;
    margin: 0;
  }
  
  .file-input {
    display: none;
  }
  
  .message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-top: 16px;
    font-size: 0.9rem;
  }
  
  .message-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  .error-message {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
  
  .success-message {
    background-color: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }
  
  .files-section {
    border-top: 1px solid #e5e7eb;
    padding-top: 24px;
  }
  
  .files-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .file-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .file-icon {
    width: 40px;
    height: 40px;
    color: #6b7280;
    flex-shrink: 0;
  }
  
  .file-icon svg {
    width: 100%;
    height: 100%;
  }
  
  .file-details {
    flex: 1;
  }
  
  .file-name {
    font-weight: 500;
    color: #1f2937;
    margin: 0 0 4px 0;
    word-break: break-word;
  }
  
  .file-meta {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 0;
  }
  
  .file-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .action-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .download-btn {
    background-color: #eff6ff;
    color: #3b82f6;
  }
  
  .download-btn:hover:not(:disabled) {
    background-color: #dbeafe;
  }
  
  .delete-btn {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  .delete-btn:hover:not(:disabled) {
    background-color: #fee2e2;
  }
  
  @media (max-width: 640px) {
    .file-upload-container {
      padding: 16px;
    }
    
    .drop-zone {
      padding: 24px 16px;
    }
    
    .file-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .file-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  </style>