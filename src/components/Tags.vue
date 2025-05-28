<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue'
import ColorHash from 'color-hash'

const colorHash = new ColorHash()

// Props
const props = defineProps({
  selectedTags: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['update:selectedTags', 'tagsChanged'])

// État local
const availableTags = ref([
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
])

const newTagInput = ref('')
const showNewTagInput = ref(false)

// Fonctions utilitaires pour les couleurs
const getTagColor = (tagName) => {
  return colorHash.hex(tagName)
}

const getTextColor = (backgroundColor) => {
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Computed
const unselectedTags = computed(() => {
  return availableTags.value.filter(tag => !props.selectedTags.includes(tag))
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
  if (tagName && !availableTags.value.includes(tagName) && !props.selectedTags.includes(tagName)) {
    availableTags.value.push(tagName)
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
    <label class="mb-2 text-sm font-medium text-gray-700">Tags</label>
    
    <!-- Tags sélectionnés -->
    <div v-if="selectedTags.length > 0" class="mb-3">
      <p class="text-xs text-gray-600 mb-2">Tags sélectionnés :</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in selectedTags"
          :key="`selected-${tag}`"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all"
          :class="disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80'"
          :style="{
            backgroundColor: getTagColor(tag),
            color: getTextColor(getTagColor(tag))
          }"
          @click="!disabled && removeTag(tag)"
          :title="disabled ? '' : 'Cliquer pour retirer'"
        >
          {{ tag }}
          <span v-if="!disabled" class="ml-1 text-xs">×</span>
        </span>
      </div>
    </div>

    <!-- Tags disponibles -->
    <div v-if="unselectedTags.length > 0 && !disabled" class="mb-3">
      <p class="text-xs text-gray-600 mb-2">Tags disponibles :</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in unselectedTags"
          :key="`available-${tag}`"
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 border border-gray-300"
          :style="{
            backgroundColor: getTagColor(tag) + '20',
            color: getTagColor(tag),
            borderColor: getTagColor(tag)
          }"
          @click="addTag(tag)"
          title="Cliquer pour ajouter"
        >
          {{ tag }}
          <span class="ml-1 text-xs">+</span>
        </span>
      </div>
    </div>

    <!-- Ajouter un nouveau tag -->
    <div v-if="!disabled" class="flex items-center gap-2">
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