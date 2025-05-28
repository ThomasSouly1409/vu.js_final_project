<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/api'

const $api = useApi()

// Props et émissions
const props = defineProps({
  shortCode: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['urlUpdated', 'urlDeleted'])

// État réactif
const originalData = ref(null)
const formData = ref({
  longUrl: '',
  title: '',
  tags: []
})

const availableTags = ref([])
const newTag = ref('')
const isLoading = ref(false)
const isLoadingTags = ref(false)
const isDeleting = ref(false)
const error = ref(null)
const success = ref(null)
const showDeleteConfirm = ref(false)

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

// Charger les tags disponibles
async function loadTags() {
  try {
    isLoadingTags.value = true
    const response = await $api('/rest/v3/tags')
    availableTags.value = response.tags?.data || response.data || response || []
  } catch (err) {
    console.error('Erreur lors du chargement des tags:', err)
  } finally {
    isLoadingTags.value = false
  }
}

// Ajouter un tag
function addTag(tag) {
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
  newTag.value = ''
}

// Retirer un tag
function removeTag(tag) {
  const index = formData.value.tags.indexOf(tag)
  if (index > -1) {
    formData.value.tags.splice(index, 1)
  }
}

// Générer une couleur pour un tag
function getTagColor(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 85%)`
}

function getTagTextColor(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 25%)`
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
    isDeleting.value = true
    error.value = null

    await $api(`/rest/v3/short-urls/${props.shortCode}`, {
      method: 'DELETE'
    })

    emit('urlDeleted', props.shortCode)
    showDeleteConfirm.value = false

  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
    error.value = err.message || 'Erreur lors de la suppression du lien'
    showDeleteConfirm.value = false
  } finally {
    isDeleting.value = false
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

</script>

<template>
  <div class="max-w-2xl mx-auto p-5">
    <div class="p-8">
      <!-- En-tête -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="$router?.back() || history.back()"
            class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Retour
          </button>
          <h2 class="text-1xl text-gray-800">
            Modifier {{ props.shortCode }}
          </h2>
        </div>
        
        <button
          @click="showDeleteConfirm = true"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          :disabled="isDeleting"
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

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          
          <!-- Tags sélectionnés -->
          <div v-if="formData.tags.length > 0" class="mb-3 flex flex-wrap gap-2">
            <span
              v-for="tag in formData.tags"
              :key="tag"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer"
              :style="{
                backgroundColor: getTagColor(tag),
                color: getTagTextColor(tag)
              }"
              @click="removeTag(tag)"
            >
              {{ tag }}
              <button type="button" class="ml-2 text-current hover:text-red-600">×</button>
            </span>
          </div>

          <!-- Ajouter un nouveau tag -->
          <div class="flex gap-2 mb-3">
            <input
              v-model="newTag"
              type="text"
              placeholder="Nouveau tag"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              @keydown.enter.prevent="addTag(newTag)"
            />
            <button
              type="button"
              @click="addTag(newTag)"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              :disabled="!newTag.trim()"
            >
              Ajouter
            </button>
          </div>

          <!-- Tags disponibles -->
          <div v-if="availableTags.length > 0 && !isLoadingTags">
            <p class="text-xs text-gray-600 mb-2">Tags existants :</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in availableTags"
                :key="tag"
                type="button"
                @click="addTag(tag)"
                class="inline-flex items-center px-2 py-1 rounded text-xs border border-gray-300 hover:bg-gray-50 transition-colors"
                :class="{
                  'bg-gray-100 cursor-not-allowed': formData.tags.includes(tag),
                  'hover:border-blue-500': !formData.tags.includes(tag)
                }"
                :disabled="formData.tags.includes(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>

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

      <!-- Modal de confirmation de suppression -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Confirmer la suppression
          </h3>
          <p class="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer définitivement ce lien court ? 
            Cette action est irréversible et toutes les statistiques associées seront perdues.
          </p>
          <div class="flex gap-4">
            <button
              @click="deleteShortUrl"
              :disabled="isDeleting"
              class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
            >
              <span v-if="isDeleting">Suppression...</span>
              <span v-else>Oui, supprimer</span>
            </button>
            <button
              @click="showDeleteConfirm = false"
              :disabled="isDeleting"
              class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
    