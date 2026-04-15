<script setup>
defineProps({
  count: { type: Number, default: 4 },
})
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
    <div v-for="i in count" :key="i" class="bg-card-bg rounded-2xl shadow-md overflow-hidden">
      <div class="w-full aspect-square bg-warm-bg-alt animate-shimmer" />
      <div class="p-4 space-y-3">
        <div class="h-4 bg-warm-bg-alt rounded-lg w-3/4 animate-shimmer" />
        <div class="flex items-center gap-2">
          <div class="h-3 bg-warm-bg-alt rounded w-8 animate-shimmer" />
          <div class="h-3 bg-warm-bg-alt rounded w-12 animate-shimmer" />
        </div>
        <div class="flex items-baseline gap-2">
          <div class="h-5 bg-warm-bg-alt rounded w-16 animate-shimmer" />
          <div class="h-3 bg-warm-bg-alt rounded w-12 animate-shimmer" />
        </div>
        <div class="h-9 bg-warm-bg-alt rounded-xl animate-shimmer" />
      </div>
    </div>
  </div>
</template>
