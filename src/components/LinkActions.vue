<script setup>
import { ref } from 'vue'

// Props
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

// Events
const emit = defineEmits(['modify', 'delete', 'copy'])

// État local
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

// Méthodes
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
    <!-- Bouton Modifier -->
    <button
      v-if="showModify"
      @click="handleModify"
      :disabled="disabled"
      class="px-3 py-1 bg-blue-500 text-white border-0 rounded text-sm cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      title="Modifier ce lien"
    >
      ✏️ Modifier
    </button>

    <!-- Bouton Copier -->
    <button
      v-if="showCopy"
      @click="handleCopy"
      :disabled="disabled"
      class="px-3 py-1 bg-gray-500 text-white border-0 rounded text-sm cursor-pointer transition-colors hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      title="Copier le lien"
    >
      📋 Copier
    </button>

    <!-- Bouton Ouvrir -->
    <a
      v-if="showOpen"
      :href="shortUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="px-3 py-1 bg-green-500 text-white border-0 rounded text-sm cursor-pointer transition-colors hover:bg-green-600 no-underline"
      :class="{ 'pointer-events-none bg-gray-300': disabled }"
      title="Ouvrir le lien"
    >
      🔗 Ouvrir
    </a>

    <!-- Bouton Supprimer -->
    <button
      v-if="showDelete"
      @click="confirmDelete"
      :disabled="disabled"
      class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      title="Supprimer ce lien"
    >
      🗑️ Supprimer
    </button>

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
            @click="handleDelete"
            :disabled="isDeleting"
            class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
          >
            <span v-if="isDeleting">Suppression...</span>
            <span v-else>Oui, supprimer</span>
          </button>
          <button
            @click="cancelDelete"
            :disabled="isDeleting"
            class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>