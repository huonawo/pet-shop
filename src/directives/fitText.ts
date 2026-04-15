import { type Directive, type DirectiveBinding, type VNode } from 'vue'

export interface FitTextOptions {
  minFontSize?: number
  maxFontSize?: number
  fontUnit?: 'px' | 'rem' | 'em'
  paddingX?: number
  paddingY?: number
  observerOptions?: ResizeObserverOptions
}

interface FitTextElement extends HTMLElement {
  _fitTextOriginalFontSize?: string
  _fitTextResizeObserver?: ResizeObserver
}

const defaultOptions: FitTextOptions = {
  minFontSize: 10,
  maxFontSize: 72,
  fontUnit: 'px',
  paddingX: 8,
  paddingY: 4,
  observerOptions: {
    box: 'content-box',
  },
}

/**
 * v-fit-text 指令 - 自动调整文字大小以适应容器
 * 
 * 使用方式:
 * <div v-fit-text>需要自动缩放的文字</div>
 * <div v-fit-text="{ minFontSize: 12, maxFontSize: 24 }">自定义范围</div>
 */
export const fitText: Directive<HTMLElement, FitTextOptions | undefined> = {
  mounted(el: FitTextElement, binding: DirectiveBinding<FitTextOptions | undefined>, _vnode: VNode) {
    const options = { ...defaultOptions, ...binding.value }
    
    // 使用 ResizeObserver 监听尺寸变化
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        fitTextContent(el, options)
      }
    })
    
    el._fitTextResizeObserver = observer
    observer.observe(el, options.observerOptions)
    
    // 初始拟合
    fitTextContent(el, options)
    
    // 延迟执行以处理异步加载的数据
    setTimeout(() => fitTextContent(el, options), 100)
    setTimeout(() => fitTextContent(el, options), 500)
    setTimeout(() => fitTextContent(el, options), 1000)
  },

  updated(el: FitTextElement, binding: DirectiveBinding<FitTextOptions | undefined>, _vnode: VNode) {
    const newOptions = { ...defaultOptions, ...binding.value }
    fitTextContent(el, newOptions)
  },

  unmounted(el: FitTextElement) {
    if (el._fitTextResizeObserver) {
      el._fitTextResizeObserver.disconnect()
      delete el._fitTextResizeObserver
    }
    // 恢复原始字体大小
    if (el._fitTextOriginalFontSize) {
      el.style.fontSize = el._fitTextOriginalFontSize
    }
  },
}

function fitTextContent(el: FitTextElement, options: FitTextOptions): void {
  if (!el.textContent?.trim()) return

  // 保存原始字体大小（仅一次）
  if (!el._fitTextOriginalFontSize) {
    el._fitTextOriginalFontSize = getComputedStyle(el).fontSize
  }

  const containerWidth = el.offsetWidth
  const containerHeight = el.offsetHeight
  
  // 计算可用的内容区域（减去内边距）
  const availableWidth = containerWidth - (options.paddingX || 0) * 2
  const availableHeight = containerHeight - (options.paddingY || 0) * 2
  
  if (availableWidth <= 0 || availableHeight <= 0) return

  // 使用 scrollWidth 检查是否溢出
  const isOverflowing = () => {
    el.style.overflow = 'hidden'
    const scrollWidth = el.scrollWidth
    const scrollHeight = el.scrollHeight
    
    // 检查水平溢出
    if (scrollWidth > containerWidth || scrollHeight > containerHeight) {
      return true
    }
    
    // 确保内容至少填满容器的一定比例
    return scrollWidth > availableWidth * 0.95 || scrollHeight > availableHeight * 0.95
  }

  if (!isOverflowing()) {
    // 没有溢出，恢复到最大字体
    el.style.fontSize = `${options.maxFontSize}${options.fontUnit}`
    return
  }

  // 二分查找最佳字体大小
  let low = options.minFontSize || 10
  let high = options.maxFontSize || 72
  let bestSize = low

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    el.style.fontSize = `${mid}${options.fontUnit}`
    
    if (isOverflowing()) {
      high = mid - 1
    } else {
      bestSize = mid
      low = mid + 1
    }
  }

  el.style.fontSize = `${bestSize}${options.fontUnit}`
}

// 便捷的 composable 版本
export function useFitText(options: FitTextOptions = {}) {
  const elementRef = ref<HTMLElement | null>(null)
  const currentFontSize = ref(options.minFontSize || 14)

  const fit = () => {
    if (!elementRef.value) return
    fitTextContent(elementRef.value, { ...defaultOptions, ...options })
  }

  onMounted(() => {
    if (elementRef.value) {
      fitTextContent(elementRef.value, { ...defaultOptions, ...options })
      
      const observer = new ResizeObserver(fit)
      observer.observe(elementRef.value)
      
      // 延迟执行处理异步数据
      setTimeout(fit, 100)
      setTimeout(fit, 500)
    }
  })

  return {
    elementRef,
    currentFontSize,
    fit,
  }
}

export default fitText
