<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

function addToast(message, type = 'info', duration = 3000) {
  const id = nextId++
  const toast = { id, message, type, visible: false }
  toasts.value.push(toast)
  requestAnimationFrame(() => {
    const t = toasts.value.find(item => item.id === id)
    if (t) t.visible = true
  })
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

function removeToast(id) {
  const t = toasts.value.find(item => item.id === id)
  if (t) t.visible = false
  setTimeout(() => {
    const idx = toasts.value.findIndex(item => item.id === id)
    if (idx > -1) toasts.value.splice(idx, 1)
  }, 300)
}

function success(message, duration) { addToast(message, 'success', duration) }
function error(message, duration) { addToast(message, 'error', duration) }
function warning(message, duration) { addToast(message, 'warning', duration) }
function info(message, duration) { addToast(message, 'info', duration) }

defineExpose({ success, error, warning, info, addToast })
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style="max-width: 360px;">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-sm font-medium backdrop-blur-xl"
          :class="[
            toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
            toast.type === 'success' ? 'toast-success' : '',
            toast.type === 'error' ? 'toast-error' : '',
            toast.type === 'warning' ? 'toast-warning' : '',
            toast.type === 'info' ? 'toast-info' : '',
          ]"
          style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
        >
          <span class="text-lg shrink-0">
            {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}
          </span>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-success {
  background-color: rgba(6, 78, 59, 0.9);
  border-color: rgba(34, 197, 94, 0.3);
  color: #6ee7b7;
}
.toast-error {
  background-color: rgba(127, 29, 29, 0.9);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}
.toast-warning {
  background-color: rgba(120, 53, 15, 0.9);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}
.toast-info {
  background-color: rgba(30, 58, 138, 0.9);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

[data-theme="warm"] .toast-success,
[data-theme="ocean"] .toast-success,
[data-theme="forest"] .toast-success,
[data-theme="pastel"] .toast-success {
  background-color: rgba(240, 253, 244, 0.95);
  border-color: rgba(34, 197, 94, 0.3);
  color: #166534;
}
[data-theme="warm"] .toast-error,
[data-theme="ocean"] .toast-error,
[data-theme="forest"] .toast-error,
[data-theme="pastel"] .toast-error {
  background-color: rgba(254, 242, 242, 0.95);
  border-color: rgba(239, 68, 68, 0.3);
  color: #991b1b;
}
[data-theme="warm"] .toast-warning,
[data-theme="ocean"] .toast-warning,
[data-theme="forest"] .toast-warning,
[data-theme="pastel"] .toast-warning {
  background-color: rgba(255, 251, 235, 0.95);
  border-color: rgba(245, 158, 11, 0.3);
  color: #92400e;
}
[data-theme="warm"] .toast-info,
[data-theme="ocean"] .toast-info,
[data-theme="forest"] .toast-info,
[data-theme="pastel"] .toast-info {
  background-color: rgba(239, 246, 255, 0.95);
  border-color: rgba(59, 130, 246, 0.3);
  color: #1e40af;
}
</style>
