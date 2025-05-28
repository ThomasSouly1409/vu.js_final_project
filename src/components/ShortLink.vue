<script setup>
import { ref } from 'vue'
import { useApi } from '@/composables/api'
import Tags from './Tags.vue' // Ajustez le chemin selon votre structure
import ColorHash from 'color-hash'
import './../../index.css'

const $api = useApi()
const colorHash = new ColorHash()

// État réactif
const defaultUrlLength = ref(8)
const form = ref({
  originalUrl: '',
  title: '',
  urlLength: null,
  tags: []
})
const generatedLink = ref(null)
const isLoading = ref(false)

// Fonctions utilitaires pour les couleurs (pour l'affichage des résultats)
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

// Gestion des tags
const handleTagsChange = (newTags) => {
  form.value.tags = newTags
}

// Générer un lien court
async function generateShortLink() {
  if (!form.value.originalUrl) return

  try {
    isLoading.value = true
    
    const payload = {
      longUrl: form.value.originalUrl,
      ...(form.value.title && { title: form.value.title }),
      ...(form.value.urlLength && { customSlugLength: form.value.urlLength || defaultUrlLength.value }),
      ...(form.value.tags.length > 0 && { tags: form.value.tags })
    }

    console.log('Payload envoyé:', payload)

    const newLink = await $api("/rest/v3/short-urls", {
      method: 'POST',
      body: payload
    })

    console.log('Réponse reçue:', newLink)
    generatedLink.value = newLink
    
  } catch (error) {
    console.error('Erreur:', error.message)
    
    if (error.status === 400) {
      try {
        const alternativePayload = {
          url: form.value.originalUrl,
          ...(form.value.title && { title: form.value.title }),
          ...(form.value.urlLength && { shortCodeLength: form.value.urlLength || defaultUrlLength.value }),
          ...(form.value.tags.length > 0 && { tags: form.value.tags })
        }
        
        console.log('Tentative avec payload alternatif:', alternativePayload)
        
        const newLink = await $api("/rest/v3/short-urls", {
          method: 'POST',
          body: alternativePayload
        })
        
        generatedLink.value = newLink
      } catch (secondError) {
        console.error('Deuxième tentative échouée:', secondError)
        alert('Erreur lors de la génération du lien court. Vérifiez la console pour plus de détails.')
      }
    }
  } finally {
    isLoading.value = false
  }
}

// Copier dans le presse-papiers
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
  }
}

// Réinitialiser pour créer un nouveau lien
function resetForm() {
  form.value = {
    originalUrl: '',
    title: '',
    urlLength: null,
    tags: []
  }
  generatedLink.value = null
}
</script>

<template>
  <div class="w-full">
    <div class="bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-8 text-center">Générateur de Liens Courts</h2>
      
      <!-- Formulaire de création -->
      <form v-if="!generatedLink" @submit.prevent="generateShortLink" class="flex flex-col gap-5">
        <!-- URL originale -->
        <div class="flex flex-col">
          <label for="originalUrl" class="mb-2 text-sm font-medium text-gray-700">URL à raccourcir *</label>
          <input
            id="originalUrl"
            v-model="form.originalUrl"
            type="url"
            class="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="https://exemple.com/tres-long-lien"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- Titre (optionnel) -->
        <div class="flex flex-col">
          <label for="title" class="mb-2 text-sm font-medium text-gray-700">Titre (optionnel)</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Mon lien personnalisé"
            :disabled="isLoading"
          />
        </div>

        <!-- Longueur de l'URL courte -->
        <div class="flex flex-col">
          <label for="urlLength" class="mb-2 text-sm font-medium text-gray-700">Nombre de caractères</label>
          <input
            id="urlLength"
            v-model.number="form.urlLength"
            type="number"
            class="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            min="4"
            max="20"
            :placeholder="defaultUrlLength.toString()"
            :disabled="isLoading"
          />
          <small class="text-gray-500 text-xs mt-1">Par défaut: {{ defaultUrlLength }} caractères (min: 4, max: 20)</small>
        </div>

        <!-- Composant de gestion des tags -->
        <Tags
          v-model:selectedTags="form.tags"
          :disabled="isLoading"
          @tagsChanged="handleTagsChange"
        />

        <!-- Bouton de génération -->
        <button 
          type="submit" 
          class="mt-3 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-lg text-base font-semibold cursor-pointer transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          :disabled="!form.originalUrl || isLoading"
        >
          <span v-if="isLoading">Génération en cours...</span>
          <span v-else>Générer le lien court</span>
        </button>
      </form>

      <!-- Résultat -->
      <div v-if="generatedLink" class="animate-fade-in">
        <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
          <h3 class="text-green-600 text-xl font-semibold m-0">✅ Lien court créé !</h3>
          <button @click="resetForm" class="px-4 py-2 bg-gray-500 text-white border-0 rounded-md text-sm cursor-pointer transition-colors hover:bg-gray-600">
            Créer un nouveau lien
          </button>
        </div>

        <div class="flex flex-col gap-5">
          <!-- Titre si présent -->
          <div v-if="generatedLink.title" class="bg-gray-50 px-4 py-3 rounded-lg border-l-4 border-blue-500 text-base text-gray-800">
            <strong>{{ generatedLink.title }}</strong>
          </div>

          <!-- Tags du lien généré -->
          <div v-if="form.tags.length > 0" class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">Tags :</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in form.tags"
                :key="`result-${tag}`"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :style="{
                  backgroundColor: getTagColor(tag),
                  color: getTextColor(getTagColor(tag))
                }"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- URL originale -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">URL originale :</label>
            <div class="flex gap-2">
              <input 
                :value="generatedLink.originalUrl || generatedLink.original_url || form.originalUrl" 
                readonly 
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700"
              />
              <button 
                @click="copyToClipboard(generatedLink.originalUrl || generatedLink.original_url || form.originalUrl)"
                class="px-4 py-3 bg-blue-500 text-white border-0 rounded-lg cursor-pointer text-sm transition-colors min-w-12 hover:bg-blue-600"
                title="Copier"
              >
                📋
              </button>
            </div>
          </div>

          <!-- Lien court -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">Lien court :</label>
            <div class="flex gap-2">
              <input 
                :value="generatedLink.shortUrl || generatedLink.short_url" 
                readonly 
                class="flex-1 px-4 py-3 border border-blue-500 rounded-lg bg-blue-50 text-sm font-semibold text-blue-600"
              />
              <button 
                @click="copyToClipboard(generatedLink.shortUrl || generatedLink.short_url)"
                class="px-4 py-3 bg-blue-500 text-white border-0 rounded-lg cursor-pointer text-sm transition-colors min-w-12 hover:bg-blue-600"
                title="Copier"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>