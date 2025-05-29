<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/api'
import LinkCard from './LinkCard.vue'
import ModifyLink from './ModifyLink.vue'

const $api = useApi()

// État réactif
const urls = ref([])
const isLoading = ref(false)
const error = ref(null)
const success = ref(null)
const editingShortCode = ref(null)
const urlStats = ref({})
const searchQuery = ref('')
const selectedTags = ref([])
const availableTags = ref([])

// Computed
const filteredUrls = computed(() => {
  let filtered = urls.value

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(url => 
      url.title?.toLowerCase().includes(query) ||
      url.longUrl?.toLowerCase().includes(query) ||
      url.shortCode?.toLowerCase().includes(query) ||
      url.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Filtrage par tags
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(url => 
      selectedTags.value.every(tag => url.tags?.includes(tag))
    )
  }

  return filtered
})

const allTags = computed(() => {
  const tagSet = new Set()
  urls.value.forEach(url => {
    if (url.tags) {
      url.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet).sort()
})

// Méthodes
async function loadUrls() {
  try {
    isLoading.value = true
    error.value = null

    const response = await $api('/rest/v3/short-urls')
    urls.value = response.shortUrls?.data || response.data || response || []
    
    // Charger les statistiques pour chaque URL
    await loadAllStats()

  } catch (err) {
    console.error('Erreur lors du chargement des URLs:', err)
    error.value = 'Impossible de charger la liste des liens'
  } finally {
    isLoading.value = false
  }
}

async function loadAllStats() {
  for (const url of urls.value) {
    try {
      const response = await $api(`/rest/v3/short-urls/${url.shortCode}/visits`)
      urlStats.value[url.shortCode] = response.visits?.length || 0
    } catch (err) {
      console.error(`Erreur stats pour ${url.shortCode}:`, err)
      urlStats.value[url.shortCode] = 0
    }
  }
}

async function loadAvailableTags() {
  try {
    const response = await $api('/rest/v3/tags')
    availableTags.value = response.tags?.data || response.data || response || []
  } catch (err) {
    console.error('Erreur lors du chargement des tags:', err)
  }
}

function handleModify(shortCode) {
  editingShortCode.value = shortCode
}

async function handleDelete(shortCode) {
  try {
    await $api(`/rest/v3/short-urls/${shortCode}`, {
      method: 'DELETE'
    })
    
    urls.value = urls.value.filter(url => url.shortCode !== shortCode)
    delete urlStats.value[shortCode]
    success.value = 'Lien supprimé avec succès!'
    
    setTimeout(() => {
      success.value = null
    }, 3000)

  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
    error.value = 'Erreur lors de la suppression du lien'
  }
}

function handleCopy(shortUrl) {
  success.value = 'Lien copié dans le presse-papiers!'
  setTimeout(() => {
    success.value = null
  }, 2000)
}

function handleUrlUpdated(updatedUrl) {
  const index = urls.value.findIndex(url => url.shortCode === updatedUrl.shortCode)
  if (index !== -1) {
    urls.value[index] = updatedUrl
  }
  editingShortCode.value = null
  success.value = 'Lien mis à jour avec succès!'
  setTimeout(() => {
    success.value = null
  }, 3000)
}

function handleUrlDeleted(shortCode) {
  urls.value = urls.value.filter(url => url.shortCode !== shortCode)
  delete urlStats.value[shortCode]
  editingShortCode.value = null
  success.value = 'Lien supprimé avec succès!'
  setTimeout(() => {
    success.value = null
  }, 3000)
}

function handleCloseEditor() {
  editingShortCode.value = null
}

function toggleTagFilter(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedTags.value = []
}

onMounted(() => {
  loadUrls()
  loadAvailableTags()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-5">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Mes liens courts</h1>
      <p class="text-gray-600">Gérez vos liens raccourcis, leurs tags et leurs statistiques</p>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      {{ error }}
    </div>
    
    <div v-if="success" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
      {{ success }}
    </div>

    <!-- Éditeur de lien (modal) -->
    <div v-if="editingShortCode" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <ModifyLink
          :short-code="editingShortCode"
          @url-updated="handleUrlUpdated"
          @url-deleted="handleUrlDeleted"
          @close="handleCloseEditor"
        />
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div class="flex flex-col gap-4">
        <!-- Barre de recherche -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par titre, URL, code court ou tag..."
            class="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        <!-- Filtres par tags -->
        <div v-if="allTags.length > 0">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-700">Filtrer par tags :</label>
            <button
              v-if="selectedTags.length > 0 || searchQuery"
              @click="clearFilters"
              class="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Effacer les filtres
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <TagBadge
              v-for="tag in allTags"
              :key="tag"
              :tag="tag"
              :clickable="true"
              :class="{
                'ring-2 ring-blue-500 ring-offset-1': selectedTags.includes(tag)
              }"
              @click="toggleTagFilter"
            />
          </div>
        </div>

        <!-- Statistiques -->
        <div class="flex gap-6 text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span>📊 Total: {{ urls.length }} liens</span>
          <span>🔍 Affichés: {{ filteredUrls.length }} liens</span>
          <span v-if="selectedTags.length > 0">🏷️ Filtres actifs: {{ selectedTags.length }}</span>
        </div>
      </div>
    </div>

    <!-- Liste des liens -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p class="mt-4 text-gray-600">Chargement des liens...</p>
    </div>

    <div v-else-if="filteredUrls.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🔗</div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">
        {{ urls.length === 0 ? 'Aucun lien trouvé' : 'Aucun résultat' }}
      </h3>
      <p class="text-gray-600">
        {{ urls.length === 0 
          ? 'Commencez par créer votre premier lien court' 
          : 'Essayez de modifier vos critères de recherche' 
        }}
      </p>
      <button
        v-if="searchQuery || selectedTags.length > 0"
        @click="clearFilters"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Effacer les filtres
      </button>
    </div>

    <div v-else class="grid gap-4">
      <LinkCard
        v-for="url in filteredUrls"
        :key="url.shortCode"
        :url="url"
        :visits-count="urlStats[url.shortCode] || 0"
        :is-loading-stats="!(url.shortCode in urlStats)"
        @modify="handleModify"
        @delete="handleDelete"
        @copy="handleCopy"
      />
    </div>
  </div>
</template>