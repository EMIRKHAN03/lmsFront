<template>
  <div class="task-form">
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Название задания <span class="required">*</span></label>
        <input 
          v-model="formData.title" 
          id="title" 
          type="text"
          required
          class="form-control"
          placeholder="Введите название задания"
        />
      </div>
      
      <div class="form-group">
        <label for="description">Описание <span class="required">*</span></label>
        <textarea 
          v-model="formData.description" 
          id="description" 
          required
          class="form-control textarea"
          placeholder="Введите описание задания"
          rows="4"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="code">Код</label>
        <textarea 
          v-model="formData.code" 
          id="code" 
          class="form-control textarea code-editor"
          placeholder="Введите код (если применимо)"
          rows="6"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="deadline">Крайний срок <span class="required">*</span></label>
        <input 
          v-model="formData.deadline" 
          id="deadline" 
          type="datetime-local"
          required
          class="form-control"
          :min="minDate"
        />
      </div>
      
      <div class="form-group">
        <label for="file">Файл</label>
        <input 
          v-model="formData.file" 
          id="file" 
          type="url"
          class="form-control"
          placeholder="URL файла"
        />
      </div>
      
      <div class="form-group">
        <label for="image">Изображение</label>
        <input 
          v-model="formData.image" 
          id="image" 
          type="url"
          class="form-control"
          placeholder="URL изображения"
        />
      </div>
      
      <div class="form-group">
        <label>Ссылки</label>
        <div class="links-container">
          <div 
            v-for="(link, index) in formData.links" 
            :key="index" 
            class="link-input-group"
          >
            <input 
              v-model="formData.links[index]" 
              type="url"
              class="form-control"
              :placeholder="`Ссылка ${index + 1}`"
            />
            <button 
              type="button" 
              @click="removeLink(index)" 
              class="btn-remove-link"
              :disabled="formData.links.length <= 1"
            >
              ✕
            </button>
          </div>
          <button 
            type="button" 
            @click="addLink" 
            class="btn-add-link"
          >
            + Добавить ссылку
          </button>
        </div>
      </div>
      
      <div class="form-actions">
        <button 
          type="button" 
          @click="$emit('cancel')" 
          class="btn-cancel"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          class="btn-submit"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? 'Сохранение...' : submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, onMounted, watch, ref } from 'vue';
import { TaskRequest } from '@/types/task';

export default defineComponent({
  name: 'TaskForm',
  props: {
    initialData: {
      type: Object as () => Partial<TaskRequest>,
      default: () => ({})
    },
    submitButtonText: {
      type: String,
      default: 'Сохранить'
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const isSubmitting = ref(false);
    
    const formData = reactive<TaskRequest>({
      title: '',
      description: '',
      code: '',
      deadline: '',
      file: '',
      image: '',
      links: ['']
    });
    
    const minDate = computed(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    });
    
    const isFormValid = computed(() => {
      return formData.title.trim() !== '' && 
             formData.description.trim() !== '' && 
             formData.deadline !== '';
    });
    
    const initializeForm = () => {
      if (props.initialData) {
        formData.title = props.initialData.title || '';
        formData.description = props.initialData.description || '';
        formData.code = props.initialData.code || '';
        formData.file = props.initialData.file || '';
        formData.image = props.initialData.image || '';
        formData.links = props.initialData.links?.length ? [...props.initialData.links] : [''];
        
        if (props.initialData.deadline) {
          // Convert from ISO to datetime-local format
          const date = new Date(props.initialData.deadline);
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          formData.deadline = date.toISOString().slice(0, 16);
        } else {
          formData.deadline = '';
        }
      }
    };
    
    const addLink = () => {
      formData.links.push('');
    };
    
    const removeLink = (index: number) => {
      if (formData.links.length > 1) {
        formData.links.splice(index, 1);
      }
    };
    
    const submitForm = async () => {
      if (!isFormValid.value || isSubmitting.value) return;
      
      isSubmitting.value = true;
      
      try {
        console.log('Form data before processing:', formData);
        
        // Filter out empty links and convert deadline to ISO format
        const filteredLinks = formData.links.filter(link => link.trim() !== '');
        const isoDeadline = new Date(formData.deadline).toISOString();
        
        const processedData: TaskRequest = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  code: formData.code || undefined,
  file: formData.file || undefined,
  image: formData.image || undefined,
  deadline: isoDeadline,
  links: filteredLinks // ✅ гарантированно string[]
};

        
        console.log('Processed form data:', processedData);
        
        emit('submit', processedData);
      } catch (error) {
        console.error('Error processing form data:', error);
      } finally {
        // Задержка для предотвращения множественных отправок
        setTimeout(() => {
          isSubmitting.value = false;
        }, 1000);
      }
    };
    
    watch(() => props.initialData, () => {
      initializeForm();
    }, { deep: true });
    
    onMounted(() => {
      initializeForm();
    });
    
    return {
      formData,
      minDate,
      isFormValid,
      isSubmitting,
      addLink,
      removeLink,
      submitForm
    };
  }
});
</script>

<style scoped>
.task-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e53935;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #4a6bff;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.code-editor {
  font-family: 'Courier New', monospace;
  background-color: #f8f9fa;
}

.links-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-remove-link {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 40px;
  flex-shrink: 0;
}

.btn-remove-link:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-add-link {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-cancel {
  background-color: #9e9e9e;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-cancel:hover {
  background-color: #757575;
}

.btn-submit {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #43a047;
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>