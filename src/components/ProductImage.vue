<script setup>
import { ref } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  emoji: { type: String, default: '🐾' },
  bgColor: { type: String, default: '' },
})

const loaded = ref(false)
const error = ref(false)

function onLoad() {
  loaded.value = true
}

function onError() {
  error.value = true
  loaded.value = true
}
</script>

<template>
  <div
    class="w-full aspect-square flex items-center justify-center overflow-hidden relative"
    :class="bgColor || 'bg-warm-bg-alt'"
  >
    <template v-if="src && !error">
      <img
        :src="src"
        :alt="alt"
        loading="lazy"
        class="w-full h-full object-cover transition-opacity duration-500"
        :class="loaded ? 'opacity-100' : 'opacity-0'"
        @load="onLoad"
        @error="onError"
      />
      <div
        v-if="!loaded"
        class="absolute inset-0 animate-shimmer"
      />
    </template>
    <span
      v-else
      class="text-7xl md:text-8xl select-none"
    >{{ emoji }}</span>
  </div>
</template>
