<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/api'
import ModifyLink from './ModifyLink.vue'

const $api = useApi()

// État réactif
const urls = ref([])
const urlStats = ref({})
const isLoading = ref(false)
const isLoadingStats = ref(false)
const error = ref(null)
const searchTerm = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = ref(10)

// Charger les statistiques pour une URL spécifique
async function loadUrlStats(shortCode) {
  try {
    const response = await $api(`/rest/v3/short-urls/${shortCode}/visits`)
    return response.visits?.pagination?.totalItems || response.totalItems || 0
  } catch (err) {
    console.error(`Erreur lors du chargement des stats pour ${shortCode}:`, err)
    return 0
  }
}

// Charger les statistiques pour toutes les URLs visibles
async function loadAllUrlStats() {
  if (urls.value.length === 0) return
  
  isLoadingStats.value = true
  const statsPromises = urls.value.map(async (url) => {
    const shortCode = url.shortCode || url.short_code
    if (shortCode && !urlStats.value[shortCode]) {
      const visits = await loadUrlStats(shortCode)
      return { shortCode, visits }
    }
    return null
  })

  const results = await Promise.all(statsPromises)
  results.forEach(result => {
    if (result) {
      urlStats.value[result.shortCode] = result.visits
    }
  })
  
  isLoadingStats.value = false
}

// Charger la liste des URLs
async function loadUrls() {
  try {
    isLoading.value = true
    error.value = null
    
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
      ...(searchTerm.value && { searchTerm: searchTerm.value })
    })

    const response = await $api(`/rest/v3/short-urls?${params}`)
    
    if (response.shortUrls) {
      urls.value = response.shortUrls.data || response.shortUrls
      totalPages.value = Math.ceil((response.shortUrls.pagination?.totalItems || response.shortUrls.length) / itemsPerPage.value)
    } else {
      urls.value = response.data || response
      totalPages.value = Math.ceil((response.pagination?.totalItems || response.length) / itemsPerPage.value)
    }
    
    await loadAllUrlStats()
    
  } catch (err) {
    console.error('Erreur lors du chargement des URLs:', err)
    error.value = 'Impossible de charger la liste des URLs'
  } finally {
    isLoading.value = false
  }
}

// Fonction pour supprimer un lien court
async function deleteShortLink(shortCode) {
  if (!shortCode) return
  if (!confirm(`Voulez-vous vraiment supprimer le lien court "${shortCode}" ?`)) return

  try {
    await $api(`/rest/v3/short-urls/${shortCode}`, { method: 'DELETE' })
    // Retirer le lien supprimé de la liste locale
    urls.value = urls.value.filter(url => (url.shortCode || url.short_code) !== shortCode)
    // Optionnel : rafraîchir les stats
    urlStats.value = {}
    await loadAllUrlStats()
    alert('Lien supprimé avec succès')
  } catch (err) {
    console.error('Erreur lors de la suppression du lien :', err)
    alert('Erreur lors de la suppression du lien')
  }
}

// Obtenir le nombre de vues pour une URL
function getVisitsCount(url) {
  const shortCode = url.shortCode || url.short_code
  return urlStats.value[shortCode] || 
         url.visitsCount || 
         url.visits_count || 
         url.visitsSummary?.total || 
         0
}

// Recherche avec délai
let searchTimeout
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUrls()
  }, 500)
}

// Changer de page
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadUrls()
  }
}

// Actualiser avec rechargement des stats
async function refreshData() {
  urlStats.value = {}
  await loadUrls()
}

onMounted(() => {
  loadUrls()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-5">
    <div class="bg-white rounded-xl shadow-lg p-8">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-semibold text-gray-800">Liste des Liens Courts</h2>
        <button 
          @click="refreshData"
          class="px-4 py-2 bg-blue-500 text-white border-0 rounded-lg cursor-pointer text-sm transition-colors hover:bg-blue-600"
          :disabled="isLoading"
        >
          🔄 Actualiser
        </button>
      </div>

      <div class="mb-6">
        <input
          v-model="searchTerm"
          @input="handleSearch"
          type="text"
          placeholder="Rechercher par titre ou URL..."
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
        />
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ error }}
      </div>

      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <div v-if="isLoadingStats && !isLoading" class="mb-4 text-center">
        <p class="text-sm text-blue-600">📊 Chargement des statistiques...</p>
      </div>

      <div v-else-if="urls.length > 0" class="space-y-4">
        <div 
          v-for="url in urls" 
          :key="url.shortCode || url.short_code"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 v-if="url.title" class="font-semibold text-gray-800 text-lg">{{ url.title }}</h3>
                <p class="text-sm text-gray-500">
                  Créé le {{ new Date(url.dateCreated || url.date_created).toLocaleDateString('fr-FR') }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-medium text-gray-600 block mb-1">URL originale :</label>
                <div class="flex">
                  <input 
                    :value="url.longUrl || url.original_url" 
                    readonly 
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label class="text-xs font-medium text-gray-600 block mb-1">Lien court :</label>
                <div class="flex">
                  <input 
                    :value="url.shortUrl || url.short_url" 
                    readonly 
                    class="flex-1 px-3 py-2 border border-blue-500 rounded-l-lg bg-blue-50 text-sm font-semibold text-blue-600"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-gray-100">
              <div class="flex gap-4 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  👁️ 
                  <span v-if="isLoadingStats" class="text-blue-500">...</span>
                  <span v-else class="font-medium">{{ getVisitsCount(url) }}</span>
                  vues
                </span>
                <span>🔗 {{ url.shortCode || url.short_code }}</span>
              </div>
              <ModifyLink></ModifyLink>
              <div class="flex gap-2">
                <a 
                  :href="url.shortUrl || url.short_url" 
                  target="_blank"
                  class="px-3 py-1 bg-green-500 text-white border-0 rounded text-sm cursor-pointer transition-colors hover:bg-green-600 no-underline"
                >
                  🔗 Ouvrir
                </a>
                <button
                  @click="deleteShortLink(url.shortCode || url.short_code)"
                  class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  title="Supprimer ce lien"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!isLoading" class="text-center py-8">
        <p class="text-gray-600">Aucun lien court trouvé.</p>
      </div>

      <div v-if="totalPages > 1" class="mt-8 flex justify-center gap-2">
        <button 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-3 py-2 bg-gray-200 text-gray-700 border-0 rounded cursor-pointer transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>
        
        <span class="px-3 py-2 text-gray-700">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
        
        <button 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-2 bg-gray-200 text-gray-700 border-0 rounded cursor-pointer transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Suivant → 
        </button>
      </div>
    </div>
  </div>
</template>