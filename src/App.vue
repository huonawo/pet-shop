<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const sidebarCollapsed = ref(false)
</script>

<template>
  <div class="flex min-h-screen">
    <Navbar v-model:collapsed="sidebarCollapsed" />
    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
    >
      <main class="flex-1">
        <div class="pl-8 pr-80 transition-all duration-300 ease-in-out" :class="sidebarCollapsed ? 'mr-20' : 'mr-72'">
          <router-view />
        </div>
      </main>
      <Footer />
    </div>
  </div>
</template>
