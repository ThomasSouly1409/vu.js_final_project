<script setup>
import { ref } from 'vue'
import { useApi } from '@/composables/api'
import Tags from './Tags.vue'
import ColorHash from 'color-hash'
import './../../index.css'
import copy from './../assets/copy.svg'
import link from './../assets/link.svg'
import valid from './../assets/valid.svg'
import id from './../assets/id.svg'
import link2 from './../assets/link2.svg'
import key from './../assets/key.svg'
import id2 from './../assets/id2.svg'

const $api = useApi()

const colorHash = new ColorHash()

const defaultUrlLength = ref(8)
const form = ref({
  originalUrl: '',
  title: '',
  urlLength: null,
  tags: []
})
const generatedLink = ref(null)
const isLoading = ref(false)

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

const handleTagsChange = (newTags) => {
  form.value.tags = newTags
}

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

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
  }
}

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
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 font-[Orbitron]">
    <div class="max-w-4xl mx-auto p-8">
      <div class="mb-12 text-center">
        <h2 class="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider mb-4">
          Génération de lien neuronal
        </h2>
        <div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full"></div>
        <p class="mt-4 text-cyan-300 text-lg tracking-wide">
          Transformer les URLs en lien neuronal
        </p>
      </div>
      <div class="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8">
        <form v-if="!generatedLink" @submit.prevent="generateShortLink" class="space-y-8">
          <div class="space-y-3">
            <label for="originalUrl" class="block text-sm font-medium text-cyan-300 uppercase tracking-wide">
              <span class="flex items-center gap-2">
                URL initial *
              </span>
            </label>
            <div class="relative">
              <input
                id="originalUrl"
                v-model="form.originalUrl"
                type="url"
                class="w-full px-6 py-4 pl-12 bg-gray-900/70 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-lg font-[Orbitron] placeholder-cyan-500/70 transition-all duration-300 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
                placeholder="https://reseau.neuronal/destination"
                required
                :disabled="isLoading"/>
              <img class="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 text-xl" :src="link2" />
            </div>
          </div>
          <div class="space-y-3">
            <label for="title" class="block text-sm font-medium text-cyan-300 uppercase tracking-wide">
              <span class="flex items-center gap-2">       
                Identifant neuronal
              </span>
            </label>
            <div class="relative">
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="w-full px-6 py-4 pl-12 bg-gray-900/70 border-2 border-purple-500/50 rounded-lg text-cyan-100 text-lg font-[Orbitron] placeholder-cyan-500/70 transition-all duration-300 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20"
                placeholder="Description du code neuronal..."
                :disabled="isLoading"/>
              <img class="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-xl" :src="id" />
            </div>
          </div>
          <div class="space-y-3">
            <label for="urlLength" class="block text-sm font-medium text-cyan-300 uppercase tracking-wide">
              <span class="flex items-center gap-2">
                Longueur du code neuronal
              </span>
            </label>
            <div class="relative">
              <input
                id="urlLength"
                v-model.number="form.urlLength"
                type="number"
                class="w-full px-6 py-4 pl-12 bg-gray-900/70 border-2 border-green-500/50 rounded-lg text-cyan-100 text-lg font-[Orbitron] placeholder-cyan-500/70 transition-all duration-300 focus:outline-none focus:border-green-400 focus:shadow-lg focus:shadow-green-500/20"
                min="4"
                max="20"
                :placeholder="`Initial: ${defaultUrlLength} caractères`"
                :disabled="isLoading" />
              <img class="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 text-xl" :src="key" />
            </div>
            <p class="text-xs text-gray-400 uppercase tracking-wide pl-12">
              Spécifications (min: 4, max: 20 caractères)
            </p>
          </div>
          <div class="p-6 bg-gray-900/30 border border-gray-700/50 rounded-xl">
            <Tags
              v-model:selectedTags="form.tags"
              :disabled="isLoading"
              @tagsChanged="handleTagsChange" />
          </div>
          <div class="pt-6">
            <button 
              type="submit" 
              class="w-full px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-2 border-cyan-400/50 rounded-xl text-xl font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:opacity-50"
              :disabled="!form.originalUrl || isLoading">
              <span v-if="isLoading" class="flex items-center justify-center gap-3">
                <div class="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
                Initialisation de la matrice neuronale...
              </span>
              <span v-else class="flex items-center justify-center gap-3">
                <span class="text-2xl">Générer lien neuronal</span>
              </span>
            </button>
          </div>
        </form>
        <div v-if="generatedLink" class="space-y-8">
          <div class="flex justify-between items-center pb-6 border-b border-cyan-500/30">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <img class="w-[18px]" :src="valid" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-green-400 uppercase tracking-wide">Lien neuronal actif!</h3>
                <p class="text-green-300 text-sm uppercase tracking-wide">Connexion établit</p>
              </div>
            </div>
            <button 
              @click="resetForm" 
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500/50 rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105">
              <span class="flex items-center gap-2">
                <img class="w-[18px]" :src="link" />
                Créer un nouveau lien neuronal
              </span>
            </button>
          </div>
          <div class="space-y-6">
            <div v-if="generatedLink.title" class="p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/50 rounded-lg backdrop-blur-sm">
              <div class="flex items-center gap-3">
                <img class="w-[18px]" :src="id2" />
                <span class="text-xl font-semibold text-blue-300 uppercase tracking-wide">{{ generatedLink.title }}</span>
              </div>
            </div>
            <div v-if="form.tags.length > 0" class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-sm text-purple-400 uppercase tracking-wide">Tags neuronaux:</span>
                <div class="h-px flex-1 bg-gradient-to-r from-purple-400/50 to-transparent"></div>
              </div>
              <div class="flex flex-wrap gap-3">
                <span
                  v-for="tag in form.tags"
                  :key="`result-${tag}`"
                  class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm"
                  :style="{
                    backgroundColor: getTagColor(tag) + '40',
                    borderColor: getTagColor(tag),
                    color: getTagColor(tag)
                  }">
                  {{ tag.toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-sm text-cyan-400 uppercase tracking-wide">URL initial:</span>
                <div class="h-px flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
              </div>
              <div class="flex gap-3">
                <input 
                  :value="generatedLink.originalUrl || generatedLink.original_url || form.originalUrl" 
                  readonly 
                  class="flex-1 px-4 py-3 bg-gray-900/70 border border-cyan-500/50 rounded-lg text-cyan-100 text-sm font-[Orbitron] backdrop-blur-sm" />
                <button 
                  @click="copyToClipboard(generatedLink.originalUrl || generatedLink.original_url || form.originalUrl)"
                  class="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-500/50 rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
                  title="Copy Neural Address">
                  <img class="w-[18px]" :src="copy" />
                </button>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-sm text-green-400 uppercase tracking-wide">Lien neuronal:</span>
                <div class="h-px flex-1 bg-gradient-to-r from-green-400/50 to-transparent"></div>
              </div>
              <div class="p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-xl backdrop-blur-sm shadow-lg shadow-green-500/20">
                <div class="flex gap-3">
                  <input 
                    :value="generatedLink.shortUrl || generatedLink.short_url" 
                    readonly 
                    class="flex-1 px-6 py-4 bg-gray-900/70 border-2 border-green-400/50 rounded-lg text-green-300 text-lg font-bold font-[Orbitron] backdrop-blur-sm focus:outline-none focus:border-green-300" />
                  <button 
                    @click="copyToClipboard(generatedLink.shortUrl || generatedLink.short_url)"
                    class="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-500/50 rounded-lg font-bold text-lg uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
                    title="Copier lien neuronal">
                    <span class="flex items-center gap-2">
                      <img class="w-[18px]" :src="copy" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>