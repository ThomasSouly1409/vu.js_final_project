<script setup>
import { ref, computed } from 'vue'
import TagBadge from './TagBadge.vue'

// Props
const props = defineProps({
  selectedTags: {
    type: Array,
    default: () => []
  },
  availableTags: {
    type: Array,
    default: () => [
      'Marketing',
      'Social Media',
      'Blog',
      'Documentation',
      'E-commerce',
      'Personnel',
      'Professionnel',
      'Temporaire',
      'Important',
      'Archive'
    ]
  },
  disabled: {
    type: Boolean,
    default: false
  },
  allowCustomTags: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Tags'
  }
})

// Events
const emit = defineEmits(['update:selectedTags', 'tagsChanged'])

// État local
const newTagInput = ref('')
const showNewTagInput = ref(false)

// Computed
const unselectedTags = computed(() => {
  return props.availableTags.filter(tag => !props.selectedTags.includes(tag))
})

// Méthodes
const addTag = (tagName) => {
  if (!props.selectedTags.includes(tagName)) {
    const newTags = [...props.selectedTags, tagName]
    emit('update:selectedTags', newTags)
    emit('tagsChanged', newTags)
  }
}

const removeTag = (tagName) => {
  const newTags = props.selectedTags.filter(tag => tag !== tagName)
  emit('update:selectedTags', newTags)
  emit('tagsChanged', newTags)
}

const addNewTag = () => {
  const tagName = newTagInput.value.trim()
  if (tagName && !props.selectedTags.includes(tagName)) {
    addTag(tagName)
    newTagInput.value = ''
    showNewTagInput.value = false
  }
}

const cancelNewTag = () => {
  newTagInput.value = ''
  showNewTagInput.value = false
}
</script>

<template>
  <div class="flex flex-col">
    <label class="mb-2 text-sm font-medium text-gray-700">{{ title }}</label>
    
    <!-- Tags sélectionnés -->
    <div v-if="selectedTags.length > 0" class="mb-3">
      <p class="text-xs text-gray-600 mb-2">Tags sélectionnés :</p>
      <div class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in selectedTags"
          :key="`selected-${tag}`"
          :tag="tag"
          :removable="!disabled"
          @remove="removeTag"
        />
      </div>
    </div>

    <!-- Tags disponibles -->
    <div v-if="unselectedTags.length > 0 && !disabled" class="mb-3">
      <p class="text-xs text-gray-600 mb-2">Tags disponibles :</p>
      <div class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in unselectedTags"
          :key="`available-${tag}`"
          :tag="tag"
          clickable
          @click="addTag"
        />
      </div>
    </div>

    <!-- Ajouter un nouveau tag -->
    <div v-if="!disabled && allowCustomTags" class="flex items-center gap-2">
      <button
        v-if="!showNewTagInput"
        type="button"
        @click="showNewTagInput = true"
        class="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm cursor-pointer transition-colors hover:bg-gray-200"
      >
        + Ajouter un tag personnalisé
      </button>
      
      <div v-else class="flex items-center gap-2 flex-1">
        <input
          v-model="newTagInput"
          type="text"
          placeholder="Nom du nouveau tag"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          @keyup.enter="addNewTag"
          @keyup.escape="cancelNewTag"
        />
        <button
          type="button"
          @click="addNewTag"
          class="px-3 py-2 bg-green-500 text-white rounded-lg text-sm cursor-pointer transition-colors hover:bg-green-600"
          :disabled="!newTagInput.trim()"
        >
          ✓
        </button>
        <button
          type="button"
          @click="cancelNewTag"
          class="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm cursor-pointer transition-colors hover:bg-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>