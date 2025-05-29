<script setup>
import { computed } from 'vue'
import TagBadge from './TagBadge.vue'
import LinkActions from './LinkActions.vue'

// Props
const props = defineProps({
  url: {
    type: Object,
    required: true
  },
  visitsCount: {
    type: Number,
    default: 0
  },
  isLoadingStats: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['modify', 'delete', 'copy'])

// Computed
const shortCode = computed(() => props.url.shortCode || props.url.short_code)
const shortUrl = computed(() => props.url.shortUrl || props.url.short_url)
const longUrl = computed(() => props.url.longUrl || props.url.original_url)
const dateCreated = computed(() => props.url.dateCreated || props.url.date_created)
const tags = computed(() => props.url.tags || [])

// Méthodes
const handleModify = (shortCode) => {
  emit('modify', shortCode)
}

const handleDelete = (shortCode) => {
  emit('delete', shortCode)
}

const handleCopy = (shortUrl) => {
  emit('copy', shortUrl)
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex flex-col gap-3">
      <!-- En-tête avec titre et date -->
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 v-if="url.title" class="font-semibold text-gray-800 text-lg mb-1">{{ url.title }}</h3>
          <p class="text-sm text-gray-500">
            Créé le {{ new Date(dateCreated).toLocaleDateString('fr-FR') }}
          </p>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in tags"
          :key="tag"
          :tag="tag"
          size="xs"
        />
      </div>

      <!-- URLs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-medium text-gray-600 block mb-1">URL originale :</label>
          <div class="flex">
            <input 
              :value="longUrl" 
              readonly 
              class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm text-gray-700"
            />
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600 block mb-1">Lien court :</label>
          <div class="flex">
            <input 
              :value="shortUrl" 
              readonly 
              class="flex-1 px-3 py-2 border border-blue-500 rounded-l-lg bg-blue-50 text-sm font-semibold text-blue-600"
            />
          </div>
        </div>
      </div>

      <!-- Footer avec statistiques et actions -->
      <div class="flex justify-between items-center pt-2 border-t border-gray-100">
        <div class="flex gap-4 text-sm text-gray-600">
          <span class="flex items-center gap-1">
            👁️ 
            <span v-if="isLoadingStats" class="text-blue-500">...</span>
            <span v-else class="font-medium">{{ visitsCount }}</span>
            vues
          </span>
          <span>🔗 {{ shortCode }}</span>
        </div>
        
        <LinkActions
          :short-url="shortUrl"
          :short-code="shortCode"
          @modify="handleModify"
          @delete="handleDelete"
          @copy="handleCopy"
        />
      </div>
    </div>
  </div>
</template>