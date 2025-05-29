<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/api'
import Tags from './Tags.vue'

const $api = useApi()

// Props et émissions
const props = defineProps({
  shortCode: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['urlUpdated', 'urlDeleted', 'close'])

// État réactif
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

// Validation
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

// Charger les informations de l'URL
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

// Charger les tags disponibles depuis l'API
async function loadAvailableTags() {
  try {
    isLoadingTags.value = true
    const response = await $api('/rest/v3/tags')
    const apiTags = response.tags?.data || response.data || response || []
    
    // Fusionner avec les tags par défaut
    const allTags = [...new Set([...availableTags.value, ...apiTags])]
    availableTags.value = allTags
    
  } catch (err) {
    console.error('Erreur lors du chargement des tags:', err)
    // Garder les tags par défaut en cas d'erreur
  } finally {
    isLoadingTags.value = false
  }
}

// Gestion des tags
const handleTagsChange = (newTags) => {
  formData.value.tags = newTags
}

// Mettre à jour le lien court
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

// Supprimer le lien court
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

// Annuler les modifications
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

// Fermer l'éditeur
function handleClose() {
  emit('close')
}

onMounted(() => {
  loadUrlInfo()
  loadAvailableTags()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-5">
    <div class="bg-white rounded-xl shadow-lg p-8">
      <!-- En-tête -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="handleClose"
            class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Retour
          </button>
          <h2 class="text-2xl font-semibold text-gray-800">
            Modifier le lien {{ props.shortCode }}
          </h2>
        </div>
        
        <button
          @click="deleteShortUrl"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          :disabled="isLoading"
        >
          🗑️ Supprimer
        </button>
      </div>

      <!-- Messages -->
      <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ error }}
      </div>
      
      <div v-if="success" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
        {{ success }}
      </div>

      <!-- État de chargement initial -->
      <div v-if="isLoading && !originalData" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <!-- Formulaire -->
      <form v-else-if="originalData" @submit.prevent="updateShortUrl" class="space-y-6">
        <!-- URL longue -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            URL longue <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.longUrl"
            type="url"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
            :class="{ 'border-red-300': formData.longUrl && !isValidUrl }"
            required
          />
          <p v-if="formData.longUrl && !isValidUrl" class="mt-1 text-sm text-red-600">
            Veuillez entrer une URL valide
          </p>
        </div>

        <!-- Titre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Titre (optionnel)
          </label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="Titre descriptif du lien"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Gestionnaire de Tags -->
        <Tags
          v-model:selected-tags="formData.tags"
          :available-tags="availableTags"
          :disabled="isLoading"
          @tags-changed="handleTagsChange"
        />

        <!-- Boutons -->
        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            :disabled="!canSubmit"
            class="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Mise à jour...</span>
            <span v-else>💾 Sauvegarder les modifications</span>
          </button>
          
          <button
            type="button"
            @click="cancelChanges"
            :disabled="!hasChanges"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium transition-colors hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        </div>

        <!-- Indicateur de modifications -->
        <div v-if="hasChanges" class="text-sm text-orange-600 text-center">
          ⚠️ Vous avez des modifications non sauvegardées
        </div>
      </form>
    </div>
  </div>
</template>