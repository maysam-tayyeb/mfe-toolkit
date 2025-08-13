<template>
  <div class="ds-card ds-p-4">
    <div class="ds-flex ds-justify-between ds-items-center ds-mb-4">
      <h4 class="ds-card-title ds-mb-0">📝 Document Editor</h4>
      <span class="ds-badge-success">{{ isSaved ? 'Saved' : 'Editing' }}</span>
    </div>

    <div class="ds-space-y-3">
      <div class="ds-flex ds-gap-2">
        <button 
          @click="createDocument"
          class="ds-btn-primary ds-btn-sm"
        >
          📄 New Document
        </button>
        <button 
          @click="saveDocument"
          class="ds-btn-secondary ds-btn-sm"
        >
          💾 Save
        </button>
        <button 
          @click="shareDocument"
          class="ds-btn-outline ds-btn-sm"
        >
          🔗 Share
        </button>
      </div>

      <input
        v-model="documentTitle"
        @input="onTitleChange"
        class="ds-input ds-input-sm"
        placeholder="Document title..."
      />

      <textarea
        v-model="content"
        @input="onTyping"
        class="ds-textarea ds-text-sm"
        rows="8"
        placeholder="Start typing your document..."
      ></textarea>

      <div class="ds-text-xs ds-text-muted ds-flex ds-justify-between">
        <span>{{ wordCount }} words • {{ charCount }} characters</span>
        <span v-if="lastEdit">Last edit: {{ lastEdit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  services: any;
}>();

const documentTitle = ref('Untitled Document');
const content = ref('');
const isSaved = ref(true);
const lastEdit = ref('');
const typingTimeout = ref<NodeJS.Timeout | null>(null);

const wordCount = computed(() => {
  return content.value.trim() ? content.value.trim().split(/\s+/).length : 0;
});

const charCount = computed(() => {
  return content.value.length;
});

const onTyping = () => {
  isSaved.value = false;
  lastEdit.value = new Date().toLocaleTimeString();
  
  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  
  // Emit typing event
  props.services.eventBus.emit('user:typing', { 
    user: 'Document Editor',
    documentId: 'doc-001'
  });
  
  // Stop typing after 1 second of inactivity
  typingTimeout.value = setTimeout(() => {
    props.services.eventBus.emit('user:stopped-typing', { 
      user: 'Document Editor',
      documentId: 'doc-001'
    });
  }, 1000);
};

const onTitleChange = () => {
  isSaved.value = false;
  props.services.eventBus.emit('document:title-changed', {
    title: documentTitle.value,
    documentId: 'doc-001'
  });
};

const createDocument = () => {
  documentTitle.value = 'Untitled Document';
  content.value = '';
  isSaved.value = true;
  lastEdit.value = '';
  
  props.services.eventBus.emit('document:created', {
    documentId: `doc-${Date.now()}`,
    title: documentTitle.value,
    author: 'Current User'
  });
  
  props.services.notifications?.addNotification({
    type: 'success',
    title: 'Document Created',
    message: 'New document has been created'
  });
};

const saveDocument = () => {
  isSaved.value = true;
  
  props.services.eventBus.emit('document:saved', {
    documentId: 'doc-001',
    title: documentTitle.value,
    content: content.value,
    wordCount: wordCount.value,
    timestamp: Date.now()
  });
  
  props.services.notifications?.addNotification({
    type: 'success',
    title: 'Document Saved',
    message: `${documentTitle.value} has been saved`
  });
};

const shareDocument = () => {
  const shareUrl = `https://docs.example.com/share/${Date.now()}`;
  
  props.services.eventBus.emit('document:shared', {
    documentId: 'doc-001',
    title: documentTitle.value,
    shareUrl,
    sharedBy: 'Current User'
  });
  
  props.services.notifications?.addNotification({
    type: 'info',
    title: 'Document Shared',
    message: 'Share link copied to clipboard'
  });
};

onMounted(() => {
  props.services.eventBus.emit('user:joined', {
    user: 'Document Editor User',
    timestamp: Date.now()
  });
});

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  
  props.services.eventBus.emit('user:left', {
    user: 'Document Editor User',
    timestamp: Date.now()
  });
});
</script>