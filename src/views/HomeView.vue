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

    <!-- 优惠券入口 -->
    <section class="py-12 bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <router-link
          to="/coupons"
          class="block bg-gradient-to-r from-accent to-primary rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-4xl">🎫</span>
                <h2 class="text-2xl md:text-3xl font-bold text-white font-pet">
                  优惠券中心
                </h2>
              </div>
              <p class="text-white/90 text-lg mb-4">
                新人专享多重好礼，最高立减 200 元
              </p>
              <div class="flex items-center gap-4">
                <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  <span class="mr-1">💰</span> 满 99 减 20
                </span>
                <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  <span class="mr-1">🎁</span> 新人礼包
                </span>
                <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  <span class="mr-1">⚡</span> 限时折扣
                </span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-20">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            🔥 热销推荐
          </h2>
          <p class="text-text-muted text-lg md:text-xl">
            最受欢迎的宠物用品，万千铲屎官的共同选择
          </p>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
            @require-login="showLoginModal = true"
          />
        </div>
        <div class="flex justify-center mt-12">
          <router-link
            to="/products"
            class="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            查看全部商品
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="bg-warm-bg-alt py-20">
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            🏷️ 商品分类
          </h2>
          <p class="text-text-muted text-lg md:text-xl">
            按类别浏览，快速找到您需要的商品
          </p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <router-link
            v-for="cat in ['猫粮', '狗粮', '玩具', '用品']"
            :key="cat"
            :to="`/products?category=${cat}`"
            class="bg-card-bg rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
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
    <section class="py-20">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            ✨ 新品上架
          </h2>
          <p class="text-text-muted text-lg md:text-xl">
            精选好物，新鲜到货
          </p>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <ProductCard
            v-for="product in newProducts"
            :key="product.id"
            :product="product"
            @require-login="showLoginModal = true"
          />
        </div>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-20">
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            💝 为什么选择我们
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center bg-card-bg rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <span class="text-5xl block mb-5">🌍</span>
            <h3 class="text-xl font-bold text-text-dark mb-3">全球精选</h3>
            <p class="text-text-muted leading-relaxed">
              严选全球优质宠物品牌，从源头把控品质，让您的爱宠享受最好的
            </p>
          </div>
          <div class="text-center bg-card-bg rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <span class="text-5xl block mb-5">🚚</span>
            <h3 class="text-xl font-bold text-text-dark mb-3">闪电配送</h3>
            <p class="text-text-muted leading-relaxed">
              24 小时内发货，全国主要城市次日达，让等待不再漫长
            </p>
          </div>
          <div class="text-center bg-card-bg rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <span class="text-5xl block mb-5">💯</span>
            <h3 class="text-xl font-bold text-text-dark mb-3">品质保证</h3>
            <p class="text-text-muted leading-relaxed">
              7 天无理由退换，正品保障，让您购物无忧
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <GuestRestrictModal v-model:show="showLoginModal" />
</template>
