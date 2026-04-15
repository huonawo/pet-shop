import { type Directive, type DirectiveBinding, type VNode } from 'vue'

export interface AutoFontOptions {
  minFontSize?: number
  maxFontSize?: number
  unit?: string
  paddingX?: number
  debug?: boolean
}

interface AutoFontElement extends HTMLElement {
  _autoFontObserver?: ResizeObserver
  _autoFontOriginalSize?: string
}

const defaultOptions: AutoFontOptions = {
  minFontSize: 10,
  maxFontSize: 48,
  unit: 'px',
  paddingX: 4,
  debug: false,
}

/**
 * v-auto-font 指令 - 动态字号计算
 * 
 * 功能：通过比较 scrollWidth 和 offsetWidth 自动调整字体大小
 * 使用：<div v-auto-font>内容</div>
 *       <div v-auto-font="{ minFontSize: 8, maxFontSize: 24 }">自定义</div>
 */
export const autoFont: Directive<HTMLElement, AutoFontOptions | undefined> = {
  mounted(el: AutoFontElement, binding: DirectiveBinding<AutoFontOptions | undefined>, _vnode: VNode) {
    const options = { ...defaultOptions, ...binding.value }
    
    // 保存原始字体大小
    if (!el._autoFontOriginalSize) {
      el._autoFontOriginalSize = getComputedStyle(el).fontSize
    }
    
    // 执行字号调整
    adjustFontSize(el, options)
    
    // 设置 ResizeObserver 监听尺寸变化
    const observer = new ResizeObserver(() => {
      adjustFontSize(el, options)
    })
    
    el._autoFontObserver = observer
    observer.observe(el)
    
    // 延迟执行处理异步加载数据
    setTimeout(() => adjustFontSize(el, options), 50)
    setTimeout(() => adjustFontSize(el, options), 200)
    setTimeout(() => adjustFontSize(el, options), 500)
    setTimeout(() => adjustFontSize(el, options), 1000)
  },

  updated(el: AutoFontElement, binding: DirectiveBinding<AutoFontOptions | undefined>, _vnode: VNode) {
    const options = { ...defaultOptions, ...binding.value }
    adjustFontSize(el, options)
  },

  unmounted(el: AutoFontElement) {
    if (el._autoFontObserver) {
      el._autoFontObserver.disconnect()
      delete el._autoFontObserver
    }
    // 恢复原始字体大小
    if (el._autoFontOriginalSize) {
      el.style.fontSize = el._autoFontOriginalSize
    }
  },
}

function adjustFontSize(el: AutoFontElement, options: AutoFontOptions): void {
  if (!el.textContent?.trim()) return
  
  const containerWidth = el.offsetWidth
  const padding = options.paddingX || 4
  const availableWidth = containerWidth - padding * 2
  
  if (availableWidth <= 0) return
  
  // 初始字号
  let currentSize = options.maxFontSize || 48
  el.style.fontSize = `${currentSize}${options.unit}`
  
  // 循环减小字号直到内容完全放入容器
  while (el.scrollWidth > availableWidth && currentSize > (options.minFontSize || 10)) {
    currentSize--
    el.style.fontSize = `${currentSize}${options.unit}`
  }
  
  // 额外检查：确保不会溢出
  if (el.scrollWidth > availableWidth) {
    el.style.overflow = 'hidden'
    el.style.whiteSpace = 'nowrap'
    el.style.textOverflow = 'ellipsis'
  }
  
  if (options.debug) {
    console.log(`[v-auto-font] container: ${containerWidth}, content: ${el.scrollWidth}, fontSize: ${currentSize}`)
  }
}

export default autoFont
