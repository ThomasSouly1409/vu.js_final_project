<script setup>
import { computed } from 'vue'
import ColorHash from 'color-hash'

const colorHash = new ColorHash()

// Props
const props = defineProps({
  tag: {
    type: String,
    required: true
  },
  removable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'sm', // 'xs', 'sm', 'md', 'lg'
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  }
})

// Events
const emit = defineEmits(['remove', 'click'])

// Computed
const tagColor = computed(() => colorHash.hex(props.tag))

const textColor = computed(() => {
  const hex = tagColor.value.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2 text-base'
  }
  return sizes[props.size]
})

// Methods
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.tag)
  }
}

const handleRemove = (event) => {
  event.stopPropagation()
  emit('remove', props.tag)
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-medium transition-all"
    :class="[
      sizeClasses, 
      clickable ? 'cursor-pointer hover:opacity-80' : '',
      removable ? 'pr-1' : ''
    ]"
    :style="{
      backgroundColor: tagColor,
      color: textColor
    }"
    @click="handleClick"
    :title="clickable ? 'Cliquer pour sélectionner' : ''"
  >
    {{ tag }}
    <button
      v-if="removable"
      type="button"
      @click="handleRemove"
      class="ml-1 rounded-full hover:bg-black hover:bg-opacity-20 w-4 h-4 flex items-center justify-center text-xs transition-colors"
      title="Retirer ce tag"
    >
      ×
    </button>
  </span>
</template>