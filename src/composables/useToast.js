import { inject } from 'vue'

export function useToast() {
  const toast = inject('toast')
  if (!toast) {
    console.warn('Toast provider not found. Make sure ToastContainer is mounted in App.vue')
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    }
  }
  return toast
}
