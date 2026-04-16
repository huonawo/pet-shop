<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HeroBanner from '../components/HeroBanner.vue'
import ProductCard from '../components/ProductCard.vue'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'
import { products } from '../data/products'

const showLoginModal = ref(false)

const featuredProducts = computed(() => products.slice(0, 4))
const newProducts = computed(() => products.slice(4, 8))

const visibleSections = ref(new Set())
const observer = ref(null)

function setupObserver() {
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.value.add(entry.target.dataset.section)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  document.querySelectorAll('[data-section]').forEach((el) => {
    observer.value.observe(el)
  })
}

onMounted(() => {
  setupObserver()
})

onUnmounted(() => {
  if (observer.value) observer.value.disconnect()
})

function isVisible(sectionId) {
  return visibleSections.value.has(sectionId)
}
</script>

<template>
  <div class="min-h-screen">
    <HeroBanner />

    <section
      data-section="coupon"
      class="py-12 bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10"
    >
      <div
        class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 transition-all duration-700"
        :class="isVisible('coupon') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <router-link
          to="/coupons"
          class="block bg-gradient-to-r from-accent to-primary rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative"
        >
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-4xl group-hover:animate-wiggle transition-transform">🎫</span>
                <h2 class="text-2xl md:text-3xl font-bold text-white font-pet">
                  优惠券中心
                </h2>
              </div>
              <p class="text-white/90 text-lg mb-4">
                新人专享多重好礼，最高立减 200 元
              </p>
              <div class="flex items-center gap-4">
                <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors">
                  <span class="mr-1">💰</span> 满 99 减 20
                </span>
                <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors">
                  <span class="mr-1">🎁</span> 新人礼包
                </span>
                <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors">
                  <span class="mr-1">⚡</span> 限时折扣
                </span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <section
      data-section="featured"
      class="py-20"
    >
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div
          class="text-center mb-14 transition-all duration-700"
          :class="isVisible('featured') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            🔥 热销推荐
          </h2>
          <p class="text-text-muted text-lg md:text-xl">
            最受欢迎的宠物用品，万千铲屎官的共同选择
          </p>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          <div
            v-for="(product, index) in featuredProducts"
            :key="product.id"
            class="transition-all duration-700"
            :class="isVisible('featured') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
            :style="{ transitionDelay: isVisible('featured') ? `${index * 100}ms` : '0ms' }"
          >
            <ProductCard
              :product="product"
              @require-login="showLoginModal = true"
            />
          </div>
        </div>
        <div
          class="flex justify-center mt-12 transition-all duration-700 delay-500"
          :class="isVisible('featured') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <router-link
            to="/products"
            class="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
          >
            查看全部商品
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <section
      data-section="categories"
      class="bg-warm-bg-alt py-20"
    >
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div
          class="text-center mb-14 transition-all duration-700"
          :class="isVisible('categories') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            🏷️ 商品分类
          </h2>
          <p class="text-text-muted text-lg md:text-xl">
            按类别浏览，快速找到您需要的商品
          </p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <router-link
            v-for="(cat, index) in ['猫粮', '狗粮', '玩具', '用品']"
            :key="cat"
            :to="`/products?category=${cat}`"
            class="bg-card-bg rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden transition-all duration-700"
            :class="isVisible('categories') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
            :style="{ transitionDelay: isVisible('categories') ? `${index * 120}ms` : '0ms' }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span class="text-5xl block mb-4 group-hover:animate-wiggle relative z-10 transition-transform duration-300 group-hover:scale-110">
              {{ cat === '猫粮' ? '🐱' : cat === '狗粮' ? '🐶' : cat === '玩具' ? '🎾' : '🏠' }}
            </span>
            <h3 class="text-lg font-semibold text-text-dark group-hover:text-primary transition-colors relative z-10">
              {{ cat }}
            </h3>
            <div class="mt-2 text-xs text-text-light group-hover:text-primary/70 transition-colors relative z-10">
              {{ cat === '猫粮' ? '营养美味' : cat === '狗粮' ? '健康活力' : cat === '玩具' ? '快乐互动' : '生活必备' }}
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <section
      data-section="newarrivals"
      class="py-20"
    >
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div
          class="text-center mb-14 transition-all duration-700"
          :class="isVisible('newarrivals') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            ✨ 新品上架
          </h2>
          <p class="text-text-muted text-lg md:text-xl">
            精选好物，新鲜到货
          </p>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          <div
            v-for="(product, index) in newProducts"
            :key="product.id"
            class="transition-all duration-700"
            :class="isVisible('newarrivals') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
            :style="{ transitionDelay: isVisible('newarrivals') ? `${index * 100}ms` : '0ms' }"
          >
            <ProductCard
              :product="product"
              @require-login="showLoginModal = true"
            />
          </div>
        </div>
      </div>
    </section>

    <section
      data-section="trust"
      class="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-20"
    >
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div
          class="text-center mb-14 transition-all duration-700"
          :class="isVisible('trust') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark font-pet mb-4">
            💝 为什么选择我们
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div
            v-for="(item, index) in [
              { emoji: '🌍', title: '全球精选', desc: '严选全球优质宠物品牌，从源头把控品质，让您的爱宠享受最好的' },
              { emoji: '🚚', title: '闪电配送', desc: '24 小时内发货，全国主要城市次日达，让等待不再漫长' },
              { emoji: '💯', title: '品质保证', desc: '7 天无理由退换，正品保障，让您购物无忧' },
            ]"
            :key="item.title"
            class="text-center bg-card-bg rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden transition-all duration-700"
            :class="isVisible('trust') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
            :style="{ transitionDelay: isVisible('trust') ? `${index * 150}ms` : '0ms' }"
          >
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span class="text-5xl block mb-5 group-hover:scale-110 transition-transform duration-300">{{ item.emoji }}</span>
            <h3 class="text-xl font-bold text-text-dark mb-3 group-hover:text-primary transition-colors">{{ item.title }}</h3>
            <p class="text-text-muted leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <GuestRestrictModal v-model:show="showLoginModal" />
</template>
