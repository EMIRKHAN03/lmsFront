// composables/useFiles.ts
import { ref, computed } from 'vue';
import FileService from '@/services/FileService';
import type { AwsResponse, UploadedFile } from '@/types/file';

export function useFiles() {
  const loading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);
  const files = ref<UploadedFile[]>([]);

  const isUploading = computed(() => loading.value && uploadProgress.value > 0);

  const uploadFile = async (file: File): Promise<AwsResponse | null> => {
    try {
      loading.value = true;
      error.value = null;
      success.value = null;
      uploadProgress.value = 0;

      // Simulate upload progress (you can implement real progress tracking)
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10;
        }
      }, 200);

      const response = await FileService.uploadFile(file);
      
      clearInterval(progressInterval);
      uploadProgress.value = 100;

      // Add to files list
      const uploadedFile: UploadedFile = {
        id: response.fileName,
        fileName: response.fileName,
        originalName: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: response.urlFile
      };
      
      files.value.push(uploadedFile);
      success.value = 'Файл успешно загружен';
      
      // Reset progress after delay
      setTimeout(() => {
        uploadProgress.value = 0;
      }, 1000);

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка при загрузке файла';
      uploadProgress.value = 0;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteFile = async (fileName: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;
      success.value = null;

      const response = await FileService.deleteFile(fileName);
      
      // Remove from files list
      files.value = files.value.filter(file => file.fileName !== fileName);
      success.value = response.message;
      
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка при удалении файла';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const downloadFile = async (fileName: string, originalName?: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const blob = await FileService.downloadFile(fileName);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      success.value = 'Файл успешно скачан';
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка при скачивании файла';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const validateFile = (file: File, maxSizeMB = 10, allowedTypes?: string[]): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Размер файла не должен превышать ${maxSizeMB}MB`;
    }

    // Check file type
    if (allowedTypes && allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return `Разрешены только файлы следующих типов: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearMessages = () => {
    error.value = null;
    success.value = null;
  };

  return {
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
  };
}
