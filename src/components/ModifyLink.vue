<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/api'
import Tags from './Tags.vue'
import warning from './../assets/warning.svg'
import deleted from './../assets/delete.svg'
import valid from './../assets/valid.svg'

const $api = useApi()

const props = defineProps({
  shortCode: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['urlUpdated', 'urlDeleted', 'close'])

const originalData = ref(null)
const formData = ref({
  longUrl: '',
  title: '',
  tags: []
})

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

const isLoading = ref(false)
const isLoadingTags = ref(false)
const error = ref(null)
const success = ref(null)

const isValidUrl = computed(() => {
  if (!formData.value.longUrl) return false
  try {
    new URL(formData.value.longUrl)
    return true
  } catch {
    return false
  }
})

const hasChanges = computed(() => {
  if (!originalData.value) return false
  
  return originalData.value.longUrl !== formData.value.longUrl ||
         originalData.value.title !== formData.value.title ||
         JSON.stringify(originalData.value.tags || []) !== JSON.stringify(formData.value.tags)
})

const canSubmit = computed(() => {
  return isValidUrl.value && hasChanges.value && !isLoading.value
})

async function loadUrlInfo() {
  try {
    isLoading.value = true
    error.value = null

    const response = await $api(`/rest/v3/short-urls/${props.shortCode}`)
    
    originalData.value = {
      longUrl: response.longUrl,
      title: response.title || '',
      tags: response.tags || []
    }

    formData.value = {
      longUrl: response.longUrl,
      title: response.title || '',
      tags: [...(response.tags || [])]
    }

  } catch (err) {
    console.error('Erreur lors du chargement:', err)
    error.value = 'Impossible de charger les informations du lien'
  } finally {
    isLoading.value = false
  }
}

async function loadAvailableTags() {
  try {
    isLoadingTags.value = true
    const response = await $api('/rest/v3/tags')
    const apiTags = response.tags?.data || response.data || response || []
    
    const allTags = [...new Set([...availableTags.value, ...apiTags])]
    availableTags.value = allTags
    
  } catch (err) {
    console.error('Erreur lors du chargement des tags:', err)
  } finally {
    isLoadingTags.value = false
  }
}

const handleTagsChange = (newTags) => {
  formData.value.tags = newTags
}

async function updateShortUrl() {
  if (!canSubmit.value) return

  try {
    isLoading.value = true
    error.value = null
    success.value = null

    const payload = {
      longUrl: formData.value.longUrl,
      title: formData.value.title || null,
      tags: formData.value.tags
    }

    const response = await $api(`/rest/v3/short-urls/${props.shortCode}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    success.value = 'Lien mis à jour avec succès!'
    originalData.value = { ...formData.value }
    emit('urlUpdated', response)

  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err)
    error.value = err.message || 'Erreur lors de la mise à jour du lien'
  } finally {
    isLoading.value = false
  }
}

async function deleteShortUrl() {
  try {
    isLoading.value = true
    error.value = null

    await $api(`/rest/v3/short-urls/${props.shortCode}`, {
      method: 'DELETE'
    })

    emit('urlDeleted', props.shortCode)

  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
    error.value = err.message || 'Erreur lors de la suppression du lien'
  } finally {
    isLoading.value = false
  }
}

function cancelChanges() {
  if (originalData.value) {
    formData.value = {
      longUrl: originalData.value.longUrl,
      title: originalData.value.title,
      tags: [...originalData.value.tags]
    }
  }
  error.value = null
  success.value = null
}

function handleClose() {
  emit('close')
}

onMounted(() => {
  loadUrlInfo()
  loadAvailableTags()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-8 font-[Orbitron]">
    <div class="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 border border-cyan-500 rounded-xl shadow-2xl p-8">
      <div class="flex items-center justify-between mb-8 pb-4 border-b border-cyan-500/30">
        <div class="flex items-center gap-6">
          <button
            @click="handleClose"
            class="px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-cyan-300 border border-cyan-500/50 rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-lg hover:shadow-cyan-500/20">
            Retour
          </button>
          <h2 class="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider">
            Modifier {{ props.shortCode }}
          </h2>
        </div>  
        <button
          @click="deleteShortUrl"
          class="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white border border-red-500/50 rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 disabled:opacity-50"
          :disabled="isLoading">
          <span class="flex items-center gap-2">
            <img class="w-[18px]" :src="deleted" alt="">
          </span>
        </button>
      </div>
      <div v-if="error" class="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg backdrop-blur-sm">
        <img class="w-[18px]" :src="warning" /> {{ error }}
      </div>
      
      <div v-if="success" class="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-300 rounded-lg backdrop-blur-sm">
        <img class="w-[18px]" :src="valid" /> {{ success }}
      </div>
      <div v-if="isLoading && !originalData" class="text-center py-12">
        <div class="inline-block relative mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
          <div class="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping"></div>
        </div>
        <p class="text-cyan-300 uppercase tracking-wide">Chargement...</p>
      </div>
      <form v-else-if="originalData" @submit.prevent="updateShortUrl" class="space-y-8">
        <div class="space-y-3">
          <label class="block text-sm font-medium text-cyan-300 uppercase tracking-wide">
             URL initial *
          </label>
          <input
            v-model="formData.longUrl"
            type="url"
            class="w-full px-6 py-4 bg-gray-900/70 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-base font-[Orbitron] placeholder-cyan-500/70 transition-all duration-300 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
            :class="{ 'border-red-500 focus:border-red-400': formData.longUrl && !isValidUrl }"
            placeholder="https://reseau.neuronal/destination"
            required />
          <p v-if="formData.longUrl && !isValidUrl" class="text-sm text-red-400 uppercase tracking-wide">
            <img class="w-[18px]" :src="warning" />
              Addresse invalide
          </p>
        </div>
        <div class="space-y-3">
          <label class="block text-sm font-medium text-cyan-300 uppercase tracking-wide">
            Identifiant
          </label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="Description du lien neuronal"
            class="w-full px-6 py-4 bg-gray-900/70 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-base font-[Orbitron] placeholder-cyan-500/70 transition-all duration-300 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20" />
        </div>
        <div class="space-y-3">
          <Tags
            v-model:selected-tags="formData.tags"
            :available-tags="availableTags"
            :disabled="isLoading"
            title="Tags neuronaux"
            @tags-changed="handleTagsChange"
          />
        </div>
        <div class="flex gap-6 pt-6 border-t border-cyan-500/30">
          <button
            type="submit"
            :disabled="!canSubmit"
            class="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/50 rounded-lg font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50">
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              Mise à jour de la matrice...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              Sauvegarder
            </span>
          </button>
          <button
            type="button"
            @click="cancelChanges"
            :disabled="!hasChanges"
            class="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-cyan-300 border border-gray-600 rounded-lg font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-lg hover:shadow-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
            Réinitialiser
          </button>
        </div>
        <div v-if="hasChanges" class="text-center text-orange-400 text-sm uppercase tracking-wide pt-4">
          <img class="w-[18px]" :src="warning" /> Modifications neuronales non sauvegardées
        </div>
      </form>
    </div>
  </div>
</template>