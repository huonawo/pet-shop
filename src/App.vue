<script setup>
import { ref, provide } from 'vue'
import TopNavbar from './components/TopNavbar.vue'
import MobileTabBar from './components/MobileTabBar.vue'
import Footer from './components/Footer.vue'
import ToastContainer from './components/ToastContainer.vue'

const toastRef = ref(null)

function showToast(type, message, duration = 3000) {
  if (toastRef.value) {
    toastRef.value[type](message, duration)
  }
}

provide('toast', {
  success: (msg, d) => showToast('success', msg, d || 3000),
  error: (msg, d) => showToast('error', msg, d || 3000),
  warning: (msg, d) => showToast('warning', msg, d || 3000),
  info: (msg, d) => showToast('info', msg, d || 3000),
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TopNavbar />
    <main class="flex-1 pb-16 md:pb-0">
      <router-view />
    </main>
    <MobileTabBar />
    <Footer />
    <ToastContainer ref="toastRef" />
  </div>
</template>
