<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <span class="text-9xl block mb-6">404</span>
      <h1 class="text-3xl font-bold text-text-dark mb-4">
        页面不存在
      </h1>
      <p class="text-text-muted mb-8">
        抱歉，您访问的页面不存在或已被删除
      </p>
      <div class="flex gap-4 justify-center">
        <button
          class="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
          @click="goHome"
        >
          返回首页
        </button>
        <button
          class="px-6 py-3 bg-card-bg hover:bg-surface-alt text-text-dark font-semibold rounded-full shadow-md hover:shadow-lg transition-all border border-border"
          @click="goBack"
        >
          返回上一页
        </button>
      </div>
    </div>
  </div>
</template>
