<script setup>
import { useCartStore } from '../stores/cart'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const cartStore = useCartStore()
</script>

<template>
  <div class="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
    <!-- Product Emoji -->
    <div
      class="w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center flex-shrink-0"
      :class="item.bgColor || 'bg-warm-bg-alt'"
    >
      <span class="text-4xl md:text-5xl select-none">{{ item.emoji || '🐾' }}</span>
    </div>

    <!-- Product Info -->
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-text-dark text-base truncate">{{ item.name }}</h3>
      <p class="text-primary font-bold text-lg mt-1">¥{{ item.price }}</p>
    </div>

    <!-- Quantity Controls -->
    <div class="flex items-center gap-3">
      <button
        class="w-8 h-8 rounded-full bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-colors flex items-center justify-center"
        @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
      >
        −
      </button>
      <span class="w-8 text-center font-semibold text-text-dark">{{ item.quantity }}</span>
      <button
        class="w-8 h-8 rounded-full bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-colors flex items-center justify-center"
        @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
      >
        +
      </button>
    </div>

    <!-- Subtotal -->
    <div class="text-right hidden sm:block">
      <p class="text-text-muted text-sm">小计</p>
      <p class="text-primary font-bold text-lg">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
    </div>

    <!-- Remove Button -->
    <button
      class="p-2 text-text-light hover:text-accent transition-colors"
      @click="cartStore.removeFromCart(item.id)"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>
