<script setup>
import { ref, computed } from 'vue'
import HeroBanner from '../components/HeroBanner.vue'
import ProductCard from '../components/ProductCard.vue'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'
import { products } from '../data/products'

const showLoginModal = ref(false)

const featuredProducts = computed(() => products.slice(0, 4))
const newProducts = computed(() => products.slice(4, 8))
</script>

<template>
  <div class="min-h-screen">
    <HeroBanner />

    <!-- Featured Products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-3">
          🔥 热销推荐
        </h2>
        <p class="text-text-muted text-lg">
          最受欢迎的宠物用品，万千铲屎官的共同选择
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          @require-login="showLoginModal = true"
        />
      </div>
      <div class="text-center mt-10">
        <router-link
          to="/products"
          class="inline-block px-10 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
        >
          查看全部商品 →
        </router-link>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="bg-warm-bg-alt py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-3">
            🏷️ 商品分类
          </h2>
          <p class="text-text-muted text-lg">
            按类别浏览，快速找到您需要的商品
          </p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <router-link
            v-for="cat in ['猫粮', '狗粮', '玩具', '用品']"
            :key="cat"
            :to="`/products?category=${cat}`"
            class="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <span class="text-5xl block mb-4 group-hover:animate-wiggle">
              {{ cat === '猫粮' ? '🐱' : cat === '狗粮' ? '🐶' : cat === '玩具' ? '🎾' : '🏠' }}
            </span>
            <h3 class="text-lg font-semibold text-text-dark group-hover:text-primary transition-colors">
              {{ cat }}
            </h3>
          </router-link>
        </div>
      </div>
    </section>

    <!-- New Arrivals -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-3">
          ✨ 新品上架
        </h2>
        <p class="text-text-muted text-lg">
          精选好物，新鲜到货
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in newProducts"
          :key="product.id"
          :product="product"
          @require-login="showLoginModal = true"
        />
      </div>
    </section>

    <!-- Trust Section -->
    <section class="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-3">
            💝 为什么选择我们
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center bg-white rounded-2xl p-8 shadow-sm">
            <span class="text-5xl block mb-4">🌍</span>
            <h3 class="text-xl font-bold text-text-dark mb-3">全球精选</h3>
            <p class="text-text-muted">
              严选全球优质宠物品牌，从源头把控品质，让您的爱宠享受最好的
            </p>
          </div>
          <div class="text-center bg-white rounded-2xl p-8 shadow-sm">
            <span class="text-5xl block mb-4">🚚</span>
            <h3 class="text-xl font-bold text-text-dark mb-3">闪电配送</h3>
            <p class="text-text-muted">
              24小时内发货，全国主要城市次日达，让等待不再漫长
            </p>
          </div>
          <div class="text-center bg-white rounded-2xl p-8 shadow-sm">
            <span class="text-5xl block mb-4">💯</span>
            <h3 class="text-xl font-bold text-text-dark mb-3">品质保证</h3>
            <p class="text-text-muted">
              7天无理由退换，正品保障，让您购物无忧
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <GuestRestrictModal v-model:show="showLoginModal" />
</template>
