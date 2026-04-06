<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  show: { type: Boolean, required: true },
  message: { type: String, default: '请先登录后再进行此操作' },
})

const emit = defineEmits(['update:show'])
const router = useRouter()
const authStore = useAuthStore()

function goToLogin() {
  emit('update:show', false)
  router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
}

function close() {
  emit('update:show', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
          <span class="text-5xl block mb-4">🔒</span>
          <h3 class="text-xl font-bold text-text-dark font-pet mb-2">需要登录</h3>
          <p class="text-text-muted mb-6">{{ message }}</p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-3 bg-warm-bg-alt hover:bg-warm-bg-alt/80 text-text-dark font-semibold rounded-xl transition-colors"
              @click="close"
            >
              稍后再说
            </button>
            <button
              class="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              @click="goToLogin"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
