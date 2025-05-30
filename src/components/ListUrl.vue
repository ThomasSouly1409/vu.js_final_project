<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/api'
import LinkCard from './LinkCard.vue'
import ModifyLink from './ModifyLink.vue'
import total from './../assets/total.svg'
import refresh from './../assets/refresh.svg'
import active from './../assets/active.svg'
import valid from './../assets/valid.svg'
import warning from './../assets/warning.svg'

const $api = useApi()

const urls = ref([])
const isLoading = ref(false)
const isLoadingStats = ref(false)
const error = ref(null)
const success = ref(null)
const editingShortCode = ref(null)
const urlStats = ref({})
const searchQuery = ref('')
const selectedTags = ref([])
const availableTags = ref([])
const filteredUrls = computed(() => {
  let filtered = urls.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(url => 
      url.title?.toLowerCase().includes(query) ||
      url.longUrl?.toLowerCase().includes(query) ||
      url.shortCode?.toLowerCase().includes(query) ||
      url.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

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

async function loadUrls() {
  try {
    isLoading.value = true
    error.value = null

    const response = await $api('/rest/v3/short-urls')
    urls.value = response.shortUrls?.data || response.data || response || []
    
    await loadAllStats()

  } catch (err) {
    console.error('Erreur lors du chargement des URLs:', err)
    error.value = 'Impossible de charger la liste des liens'
  } finally {
    isLoading.value = false
  }
}

async function loadAllStats() {
  if (urls.value.length === 0) return
  
  isLoadingStats.value = true
  
  try {
    const statsPromises = urls.value.map(async (url) => {
      try {
        const response = await $api(`/rest/v3/short-urls/${url.shortCode}/visits`)
        console.log(`Stats pour ${url.shortCode}:`, response)
        
        const visits = response.visits?.pagination?.totalItems || 
                      response.pagination?.totalItems ||
                      response.totalItems ||
                      response.visits?.length ||
                      response.length ||
                      0
        
        return { shortCode: url.shortCode, visits }
      } catch (err) {
        console.error(`Erreur stats pour ${url.shortCode}:`, err)
        return { shortCode: url.shortCode, visits: 0 }
      }
    })

    const results = await Promise.all(statsPromises)
    
    results.forEach(result => {
      urlStats.value[result.shortCode] = result.visits
    })
    
    console.log('Stats finales:', urlStats.value)
    
  } finally {
    isLoadingStats.value = false
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
  navigator.clipboard.writeText(shortUrl).then(() => {
    success.value = 'Lien copié dans le presse-papiers!'
    setTimeout(() => {
      success.value = null
    }, 2000)
  }).catch(() => {
    success.value = 'Lien prêt à être copié!'
    setTimeout(() => {
      success.value = null
    }, 2000)
  })
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

async function refreshData() {
  urlStats.value = {}
  await loadUrls()
}

onMounted(() => {
  loadUrls()
  loadAvailableTags()
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen font-[Orbitron]">
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider">
          Matrice neuronale
        </h1>
        <button 
          @click="refreshData"
          class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading">
          <span class="flex items-center gap-2">
            <img class="w-[18px]" :src="refresh" />
            Rafraichir 
          </span>
        </button>
      </div>
    </div>
    <div v-if="error" class="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg backdrop-blur-sm">
      <img class="w-[18px]" :src="warning" /> {{ error }}
    </div>    
    <div v-if="success" class="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-300 rounded-lg backdrop-blur-sm">
      <img class="w-[18px]" :src="valid" /> {{ success }}
    </div>
    <div v-if="isLoadingStats && !isLoading" class="mb-4 text-center">
      <p class="text-sm text-cyan-400 uppercase tracking-wide">
        Scan de la matrice...
      </p>
    </div>
    <div v-if="editingShortCode" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-gradient-to-br from-gray-900 to-purple-900 border border-cyan-500 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
        <ModifyLink
          :short-code="editingShortCode"
          @url-updated="handleUrlUpdated"
          @url-deleted="handleUrlDeleted"
          @close="handleCloseEditor"
        />
      </div>
    </div>
    <div class="bg-gradient-to-r from-gray-800/50 to-purple-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-lg p-6 mb-6">
      <div class="flex flex-col gap-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder=">>> Rechercher les données neuronales..."
            class="w-full px-6 py-4 pl-12 bg-gray-900/70 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-base font-[Orbitron] placeholder-cyan-500/70 transition-all duration-300 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"/>
          <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 text-lg">
            ⚡
          </div>
        </div>
        <div v-if="allTags.length > 0">
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-medium text-cyan-300 uppercase tracking-wide">Tags neuronaux:</label>
            <button
              v-if="selectedTags.length > 0 || searchQuery"
              @click="clearFilters"
              class="text-sm text-purple-400 hover:text-purple-300 cursor-pointer uppercase tracking-wide transition-colors duration-300">
              Vider la matrice
            </button>
          </div>
          <div class="flex flex-wrap gap-3">
            <TagBadge
              v-for="tag in allTags"
              :key="tag"
              :tag="tag"
              :clickable="true"
              :class="{
                'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900 scale-110': selectedTags.includes(tag)
              }"
              @click="toggleTagFilter"/>
          </div>
        </div>
        <div class="flex gap-8 text-sm text-cyan-300 pt-4 border-t border-cyan-500/30">
          <span class="flex items-center gap-2">
            <img class="w-[18px]" :src="total" />
            <span class="uppercase tracking-wide">Total: {{ urls.length }} Links</span>
          </span>
          <span class="flex items-center gap-2">
            <img class="w-[18px]" :src="active" />
            <span class="uppercase tracking-wide">Actifs: {{ filteredUrls.length }} Links</span>
          </span>
          <span v-if="selectedTags.length > 0" class="flex items-center gap-2">
            <span class="text-purple-400">🏷️</span>
            <span class="uppercase tracking-wide">Filtres: {{ selectedTags.length }}</span>
          </span>
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="text-center py-16">
      <div class="inline-block relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-400"></div>
        <div class="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping"></div>
      </div>
      <p class="mt-6 text-cyan-300 text-lg uppercase tracking-wide font-[Orbitron]">
        Initialisation du réseau neuronal...
      </p>
    </div>
    <div v-else-if="filteredUrls.length === 0" class="text-center py-16">
      <h3 class="text-2xl font-semibold text-cyan-300 mb-4 uppercase tracking-wide">
        {{ urls.length === 0 ? 'Base de données neuronales vide' : 'Aucune données neuronales trouvées' }}
      </h3>
      <p class="text-cyan-400 text-lg mb-8">
        {{ urls.length === 0 
          ? 'Initialize your first quantum link' 
          : 'Modifier vos paramètres' 
        }}
      </p>
      <button
        v-if="searchQuery || selectedTags.length > 0"
        @click="clearFilters"
        class="mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold uppercase tracking-wide hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
        Réinitialiser la matrice
      </button>
    </div>
    <div v-else class="grid gap-6">
      <LinkCard
        v-for="url in filteredUrls"
        :key="url.shortCode"
        :url="url"
        :visits-count="urlStats[url.shortCode] || 0"
        :is-loading-stats="isLoadingStats"
        @modify="handleModify"
        @delete="handleDelete"
        @copy="handleCopy"/>
    </div>
  </div>
</template>