<script setup>
import { computed } from 'vue'
import TagBadge from './TagBadge.vue'
import LinkActions from './LinkActions.vue'
import eye from './../assets/eye.svg'
import link from './../assets/link.svg'

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

const emit = defineEmits(['modify', 'delete', 'copy'])
const shortCode = computed(() => props.url.shortCode || props.url.short_code)
const shortUrl = computed(() => props.url.shortUrl || props.url.short_url)
const longUrl = computed(() => props.url.longUrl || props.url.original_url)
const dateCreated = computed(() => props.url.dateCreated || props.url.date_created)
const tags = computed(() => props.url.tags || [])

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
  <div class="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-2 border-gray-700/50 rounded-xl p-6 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transition-all duration-300 backdrop-blur-sm">
    <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 v-if="url.title" class="font-[Orbitron] font-bold text-cyan-300 text-lg mb-2 tracking-wide">
            {{ url.title }}
          </h3>
          <div class="flex items-center gap-2 text-xs font-[Orbitron] text-gray-400 tracking-wider">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>CRÉÉ LE {{ new Date(dateCreated).toLocaleDateString('fr-FR') }}</span>
          </div>
        </div>
      </div>
      <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in tags"
          :key="tag"
          :tag="tag"
          size="xs"
        />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-xs font-[Orbitron] font-semibold text-gray-400 tracking-wider block">URL INITIAL</label>
          <div class="relative">
            <input 
              :value="longUrl" 
              readonly 
              class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-sm text-gray-300 font-[Orbitron] focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-[Orbitron] font-semibold text-cyan-400 tracking-wider block">LIEN NEXUS</label>
          <div class="relative">
            <input 
              :value="shortUrl" 
              readonly 
              class="w-full px-4 py-3 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-400/50 rounded-lg text-sm font-[Orbitron] font-semibold text-cyan-300 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center pt-4 border-t border-gray-700/50">
        <div class="flex gap-6 text-sm font-[Orbitron] text-gray-400 tracking-wider">
          <div class="flex items-center gap-2">
            <img class="w-[18px]" :src="eye" />
            <span v-if="isLoadingStats" class="text-cyan-400 animate-pulse">SCAN...</span>
            <span v-else class="text-white font-semibold">{{ visitsCount }}</span>
            <span>VUES</span>
          </div>
          <div class="flex items-center gap-2">
            <img class="w-[18px]" :src="link" />
            <span class="text-white font-semibold">{{ shortCode }}</span>
          </div>
        </div>       
        <LinkActions
          :short-url="shortUrl"
          :short-code="shortCode"
          @modify="handleModify"
          @delete="handleDelete"
          @copy="handleCopy"/>
      </div>
    </div>
  </div>
</template>