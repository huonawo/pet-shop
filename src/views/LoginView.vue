<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const username = ref('')
const password = ref('')
const phone = ref('')
const errorMsg = ref('')
const loading = ref(false)

const pageTitle = computed(() => isLogin.value ? '登录' : '注册')
const submitLabel = computed(() => isLogin.value ? '登录' : '注册')

// 如果已登录，直接跳转
if (authStore.isLoggedIn) {
  router.push('/')
}

function handleSubmit() {
  errorMsg.value = ''
  if (!username.value.trim() || !password.value) {
    errorMsg.value = '请填写完整信息'
    return
  }
  loading.value = true
  setTimeout(() => {
    let result
    if (isLogin.value) {
      result = authStore.login(username.value, password.value)
    } else {
      if (password.value.length < 4) {
        errorMsg.value = '密码至少4位'
        loading.value = false
        return
      }
      result = authStore.register(username.value, password.value, phone.value)
    }
    loading.value = false
    if (result.success) {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      errorMsg.value = result.message
    }
  }, 500)
}

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  username.value = ''
  password.value = ''
  phone.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Back Button -->
      <button
        class="flex items-center gap-1 text-text-muted hover:text-primary transition-colors mb-6"
        @click="router.back()"
      >
        ← 返回
      </button>

      <!-- Auth Card -->
      <div class="bg-white rounded-2xl p-8 shadow-lg">
        <!-- Header -->
        <div class="text-center mb-8">
          <span class="text-5xl block mb-4">🐾</span>
          <h1 class="text-2xl font-bold text-text-dark font-pet mb-2">
            {{ pageTitle }}
          </h1>
          <p class="text-text-muted">
            {{ isLogin ? '欢迎回来，请登录您的账号' : '创建新账号，开始购物之旅' }}
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-6">
          <p class="text-accent text-sm text-center">{{ errorMsg }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-text-dark mb-1">手机号（选填）</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="请输入手机号"
              class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              处理中...
            </span>
            <span v-else>{{ submitLabel }}</span>
          </button>
        </form>

        <!-- Toggle -->
        <div class="text-center mt-6">
          <button
            class="text-primary hover:text-primary-dark text-sm font-medium"
            @click="toggleMode"
          >
            {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
