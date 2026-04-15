<script setup>
</script>

<template>
  <section class="relative overflow-hidden w-full bg-gradient-to-br from-warm-bg via-warm-bg-alt to-accent-light/30 pt-28 pb-16 md:pt-36 md:pb-24">
    <!-- Decorative Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <span class="absolute top-20 left-10 text-6xl opacity-20 animate-float" style="animation-delay: 0s;">🐱</span>
      <span class="absolute top-32 right-20 text-5xl opacity-20 animate-float" style="animation-delay: 0.5s;">🐶</span>
      <span class="absolute bottom-16 left-1/4 text-4xl opacity-15 animate-float" style="animation-delay: 1s;">🐾</span>
      <span class="absolute top-16 right-1/3 text-4xl opacity-15 animate-float" style="animation-delay: 1.5s;">🦴</span>
    </div>

    <div class="flex justify-center items-center max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
      <div class="flex flex-col items-center text-center max-w-4xl">
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-text-dark font-pet mb-6 animate-fade-in-up">
          给毛孩子最好的 <span class="text-primary">🐾</span>
        </h1>
        <p class="text-lg md:text-xl lg:text-2xl text-text-muted mb-8 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s;">
          精选全球优质宠物用品，从口粮到玩具，从清洁到保健<br>
          一站式满足您爱宠的所有需求
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up whitespace-nowrap" style="animation-delay: 0.4s;">
          <router-link
            to="/products"
            class="px-10 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-lg min-w-[120px]"
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

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16" style="animation-delay: 0.6s;">
        <div class="text-center bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-primary font-pet">1000+</div>
          <div class="text-text-muted text-sm md:text-base mt-1">精选商品</div>
        </div>
        <div class="text-center bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary font-pet">50 万+</div>
          <div class="text-text-muted text-sm md:text-base mt-1">服务宠物</div>
        </div>
        <div class="text-center bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-accent font-pet">98%</div>
          <div class="text-text-muted text-sm md:text-base mt-1">好评率</div>
        </div>
        <div class="text-center bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-success font-pet">24h</div>
          <div class="text-text-muted text-sm md:text-base mt-1">闪电发货</div>
        </div>
    </div>
  </section>
</template>
