<script setup>
</script>

<template>
  <footer class="bg-text-dark text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-3xl">🐾</span>
            <span class="text-xl font-bold font-pet">萌宠小店</span>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed">
            用心呵护每一个小生命<br>
            为您的爱宠提供最优质的产品和服务
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4 font-pet">快速导航</h3>
          <ul class="space-y-2">
            <li><router-link to="/" class="text-gray-400 hover:text-primary transition-colors text-sm">首页</router-link></li>
            <li><router-link to="/products" class="text-gray-400 hover:text-primary transition-colors text-sm">全部商品</router-link></li>
            <li><router-link to="/about" class="text-gray-400 hover:text-primary transition-colors text-sm">关于我们</router-link></li>
          </ul>
        </div>

        <!-- Categories -->
        <div>
          <h3 class="text-lg font-semibold mb-4 font-pet">商品分类</h3>
          <ul class="space-y-2">
            <li><router-link to="/products?category=猫粮" class="text-gray-400 hover:text-primary transition-colors text-sm">猫粮专区</router-link></li>
            <li><router-link to="/products?category=狗粮" class="text-gray-400 hover:text-primary transition-colors text-sm">狗粮专区</router-link></li>
            <li><router-link to="/products?category=玩具" class="text-gray-400 hover:text-primary transition-colors text-sm">宠物玩具</router-link></li>
            <li><router-link to="/products?category=用品" class="text-gray-400 hover:text-primary transition-colors text-sm">宠物用品</router-link></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-lg font-semibold mb-4 font-pet">联系我们</h3>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>📞 1433223</li>
            <li>🌐 <a href="https://pet-shop-54p.pages.dev/" class="hover:text-primary transition-colors">https://pet-shop-54p.pages.dev/</a></li>
            <li>📍 广东东软学院（小镇）</li>
            <li>🕐 周一至周日 9:00-21:00</li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
        <p>© 2026 萌宠小店. All rights reserved. Made with ❤️ for pets.</p>
      </div>
    </div>
  </footer>
</template>
