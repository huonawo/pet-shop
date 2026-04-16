<script setup>
import { ref, onMounted } from 'vue'

const isLoaded = ref(false)
const animatedStats = ref([0, 0, 0, 0])

const targetStats = [1000, 50, 98, 24]
const statLabels = ['精选商品', '服务宠物(万)', '好评率', '闪电发货']
const statSuffixes = ['+', '万+', '%', 'h']
const statColors = ['text-primary', 'text-secondary', 'text-accent', 'text-success']

function animateStats() {
  const duration = 1500
  const startTime = Date.now()

  function update() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)

    animatedStats.value = targetStats.map((target, i) => {
      const val = Math.round(target * eased)
      if (i === 2) return val
      return val
    })

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
    animateStats()
  }, 200)
})
</script>

<template>
  <section class="relative overflow-hidden w-full bg-gradient-to-br from-warm-bg via-warm-bg-alt to-accent-light/30 pt-28 pb-16 md:pt-36 md:pb-24">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <span class="absolute top-20 left-10 text-6xl opacity-20 animate-float" style="animation-delay: 0s;">🐱</span>
      <span class="absolute top-32 right-20 text-5xl opacity-20 animate-float" style="animation-delay: 0.5s;">🐶</span>
      <span class="absolute bottom-16 left-1/4 text-4xl opacity-15 animate-float" style="animation-delay: 1s;">🐾</span>
      <span class="absolute top-16 right-1/3 text-4xl opacity-15 animate-float" style="animation-delay: 1.5s;">🦴</span>
      <span class="absolute bottom-24 right-10 text-3xl opacity-10 animate-float" style="animation-delay: 2s;">🐟</span>
      <span class="absolute top-1/2 left-16 text-3xl opacity-10 animate-float" style="animation-delay: 0.8s;">🎾</span>
    </div>

    <div class="flex justify-center items-center max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
      <div class="flex flex-col items-center text-center max-w-4xl">
        <h1
          class="text-4xl md:text-6xl lg:text-7xl font-bold text-text-dark font-pet mb-6 transition-all duration-1000"
          :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          给毛孩子最好的 <span class="text-primary inline-block" :class="isLoaded ? 'animate-pulse-soft' : ''">🐾</span>
        </h1>
        <p
          class="text-lg md:text-xl lg:text-2xl text-text-muted mb-8 leading-relaxed transition-all duration-1000"
          :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          :style="{ transitionDelay: '200ms' }"
        >
          精选全球优质宠物用品，从口粮到玩具，从清洁到保健<br>
          一站式满足您爱宠的所有需求
        </p>
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center whitespace-nowrap transition-all duration-1000"
          :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          :style="{ transitionDelay: '400ms' }"
        >
          <router-link
            to="/products"
            class="px-10 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-lg min-w-[120px] group"
          >
            🛍️ 开始选购
          </router-link>
          <router-link
            to="/about"
            class="px-10 py-4 bg-white hover:bg-warm-bg-alt text-text-dark font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-lg border-2 border-primary/20 min-w-[120px]"
          >
            了解更多
          </router-link>
        </div>
      </div>
    </div>

    <div
      class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 transition-all duration-1000"
      :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      :style="{ transitionDelay: '600ms' }"
    >
      <div
        v-for="(stat, index) in targetStats"
        :key="index"
        class="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      >
        <div class="text-3xl md:text-4xl lg:text-5xl font-bold font-pet" :class="statColors[index]">
          {{ animatedStats[index] }}{{ statSuffixes[index] }}
        </div>
        <div class="text-text-muted text-sm md:text-base mt-1">{{ statLabels[index] }}</div>
      </div>
    </div>
  </section>
</template>
