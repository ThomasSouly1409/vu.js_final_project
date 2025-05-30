<script setup>
import { ref } from 'vue'
import copy from './../assets/copy.svg'
import deleted from './../assets/delete.svg'
import internet from './../assets/internet.svg'
import modify from './../assets/modify.svg'

const props = defineProps({
  shortUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showModify: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  showOpen: {
    type: Boolean,
    default: true
  },
  showCopy: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['modify', 'delete', 'copy'])

const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

const handleModify = () => {
  emit('modify', props.shortCode)
}

const handleDelete = async () => {
  isDeleting.value = true
  try {
    emit('delete', props.shortCode)
    showDeleteConfirm.value = false
  } finally {
    isDeleting.value = false
  }
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.shortUrl)
    emit('copy', props.shortUrl)
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      v-if="showModify"
      @click="handleModify"
      :disabled="disabled"
      class="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white border border-cyan-400/30 rounded-lg text-xs font-[Orbitron] font-semibold tracking-wider cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/30 hover:border-cyan-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:border-gray-600"
      title="Modifier ce lien">
      <img class="w-[18px]" :src="modify" />
    </button>
    <button
      v-if="showCopy"
      @click="handleCopy"
      :disabled="disabled"
      class="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white border border-purple-400/30 rounded-lg text-xs font-[Orbitron] font-semibold tracking-wider cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/30 hover:border-purple-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:border-gray-600"
      title="Copier le lien">
      <img class="w-[18px]" :src="copy" />
    </button>
    <a
      v-if="showOpen"
      :href="shortUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="px-3 py-2 bg-gradient-to-r from-black-600 to-gray-900 text-white border border-green-400/30 rounded-lg text-xs font-[Orbitron] font-semibold tracking-wider cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-green-400/30 hover:border-green-400 no-underline"
      :class="{ 'pointer-events-none from-gray-600 to-gray-700 border-gray-600': disabled }"
      title="Ouvrir le lien">
      <img class="w-[18px]" :src="internet" />
    </a>
    <button
      v-if="showDelete"
      @click="confirmDelete"
      :disabled="disabled"
      class="px-3 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white border border-red-400/30 rounded-lg text-xs font-[Orbitron] font-semibold tracking-wider cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-red-400/30 hover:border-red-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:border-gray-600"
      title="Supprimer ce lien">
      <img class="w-[18px]" :src="deleted" />
    </button>
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-8 max-w-md mx-4 border-2 border-red-400/30 shadow-2xl shadow-red-400/20">
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <span class="text-2xl">⚠️</span>
          </div>
          <h3 class="text-xl font-[Orbitron] font-bold text-red-400 mb-2 tracking-wider">
            ALERTE SUPPRESSION
          </h3>
          <p class="text-gray-300 font-[Orbitron] text-sm leading-relaxed">
            Cette action est irréversible.<br>
            Toutes les données associées seront perdues définitivement.
          </p>
        </div>  
        <div class="flex gap-4">
          <button
            @click="handleDelete"
            :disabled="isDeleting"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-[Orbitron] font-semibold tracking-wider hover:shadow-lg hover:shadow-red-400/30 transition-all duration-300 disabled:from-red-800 disabled:to-orange-800">
            <span v-if="isDeleting">SUPPRESSION...</span>
            <span v-else>CONFIRMER</span>
          </button>
          <button
            @click="cancelDelete"
            :disabled="isDeleting"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-[Orbitron] font-semibold tracking-wider hover:shadow-lg hover:shadow-gray-400/30 transition-all duration-300">
            ANNULER
          </button>
        </div>
      </div>
    </div>
  </div>
</template>