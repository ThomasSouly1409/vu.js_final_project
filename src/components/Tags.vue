<script setup>
import { ref, computed } from 'vue'
import TagBadge from './TagBadge.vue'
import tag from './../assets/tag.svg'
import add from './../assets/add.svg'
import cancel2 from './../assets/cancel2.svg'

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
    default: 'Tags neuronaux'
  }
})

const emit = defineEmits(['update:selectedTags', 'tagsChanged'])
const newTagInput = ref('')
const showNewTagInput = ref(false)

const unselectedTags = computed(() => {
  return props.availableTags.filter(tag => !props.selectedTags.includes(tag))
})

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
  <div class="flex flex-col space-y-4 font-[Orbitron]">
    <label class="text-sm font-medium text-cyan-300 uppercase tracking-wide">
      <span class="flex items-center gap-2">
        <img class="w-[18px]" :src="tag" />
        {{ title }}
      </span>
    </label>
    <div v-if="selectedTags.length > 0" class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-green-400 uppercase tracking-wide">Tags neuronaux actifs:</span>
        <div class="h-px flex-1 bg-gradient-to-r from-green-400/50 to-transparent"></div>
      </div>
      <div class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in selectedTags"
          :key="`selected-${tag}`"
          :tag="tag"
          :removable="!disabled"
          @remove="removeTag" />
      </div>
    </div>
    <div v-if="unselectedTags.length > 0 && !disabled" class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-purple-400 uppercase tracking-wide">Tags neuronaux disponibles:</span>
        <div class="h-px flex-1 bg-gradient-to-r from-purple-400/50 to-transparent"></div>
      </div>
      <div class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in unselectedTags"
          :key="`available-${tag}`"
          :tag="tag"
          clickable
          @click="addTag" />
      </div>
    </div>
    <div v-if="!disabled && allowCustomTags" class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-cyan-400 uppercase tracking-wide">Tags neuronaux personnalisés:</span>
        <div class="h-px flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="!showNewTagInput"
          type="button"
          @click="showNewTagInput = true"
          class="px-4 py-3 bg-gradient-to-r from-gray-800 to-purple-800 text-cyan-300 border border-cyan-500/50 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-purple-700 hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-400">
          <span class="flex items-center gap-2 text-cyan-400">
            Créer un tag neuronal
          </span>
        </button>
        <div v-else class="flex items-center gap-3 w-full">
          <div class="flex-1 relative">
            <input
              v-model="newTagInput"
              type="text"
              placeholder=">>> Identifiant du tag neuronal..."
              class="w-full px-4 py-3 pl-10 bg-gray-900/70 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-sm font-[Orbitron] placeholder-cyan-500/70 transition-all duration-300 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
              @keyup.enter="addNewTag"
              @keyup.escape="cancelNewTag" />
            <img class="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-[18px]" :src="tag" />
          </div>
          <button
            type="button"
            @click="addNewTag"
            class="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-500/50 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!newTagInput.trim()">
            <span class="flex items-center gap-1">
              <img class="w-[18px]" :src="add" />
              Ajouter
            </span>
          </button>
          <button
            type="button"
            @click="cancelNewTag"
            class="px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white border border-red-500/50 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105">
            <span class="flex items-center gap-1">
              <img class="w-[18px]" :src="cancel2" />
              Annuler
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>