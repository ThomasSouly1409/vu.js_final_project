<script setup>
import { computed } from 'vue'
import ColorHash from 'color-hash'
import cancel from './../assets/cancel.svg'

const colorHash = new ColorHash()

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

const emit = defineEmits(['remove', 'click'])

const tagColor = computed(() => {
  const baseColor = colorHash.hex(props.tag)
  const hex = baseColor.replace('#', '')
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 50)
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 50)
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 50)
  return `rgb(${r}, ${g}, ${b})`
})

const glowColor = computed(() => {
  const baseColor = colorHash.hex(props.tag)
  return baseColor
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2 text-base'
  }
  return sizes[props.size]
})

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
    class="inline-flex items-center rounded-full font-[Orbitron] font-semibold transition-all duration-300 border border-gray-600/50 backdrop-blur-sm"
    :class="[
      sizeClasses, 
      clickable ? 'cursor-pointer hover:border-cyan-400/50 hover:shadow-lg' : '',
      removable ? 'pr-1' : ''
    ]"
    :style="{
      backgroundColor: tagColor,
      color: '#ffffff',
      boxShadow: clickable ? `0 0 10px ${glowColor}40` : 'none'
    }"
    @click="handleClick"
    :title="clickable ? 'Cliquer pour sélectionner' : ''">
    <span class="tracking-wider">{{ tag.toUpperCase() }}</span>
    <button
      v-if="removable"
      type="button"
      @click="handleRemove"
      class="ml-2 rounded-full hover:bg-red-500/30 w-5 h-5 flex items-center justify-center text-xs transition-all duration-300 font-bold border border-red-400/30 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/30"
      title="Retirer ce tag">
      <img class="w-[18px]" :src="cancel" />
    </button>
  </span>
</template>