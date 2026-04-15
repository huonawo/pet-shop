<script setup>
import { computed } from 'vue'

interface Props {
  amount: number | string
  prefix?: string
  suffix?: string
  color?: string
  fontSize?: number
  fontWeight?: string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '¥',
  suffix: '',
  color: 'currentColor',
  fontSize: 24,
  fontWeight: 'bold',
  width: 100,
  height: 60,
})

const formattedAmount = computed(() => {
  const num = typeof props.amount === 'string' ? parseFloat(props.amount) : props.amount
  return isNaN(num) ? '0' : num.toFixed(num % 1 === 0 ? 0 : 2)
})

const viewBox = computed(() => `0 0 ${props.width} ${props.height}`)

const textX = computed(() => props.width / 2)
const textY = computed(() => props.height / 2 + props.fontSize / 3)
</script>

<template>
  <svg
    :viewBox="viewBox"
    :width="width"
    :height="height"
    xmlns="http://www.w3.org/2000/svg"
    class="overflow-visible"
  >
    <text
      :x="textX"
      :y="textY"
      :fill="color"
      :font-size="fontSize"
      :font-weight="fontWeight"
      text-anchor="middle"
      dominant-baseline="middle"
      class="font-fitting"
    >
      {{ prefix }}{{ formattedAmount }}{{ suffix }}
    </text>
  </svg>
</template>

<style scoped>
.font-fitting {
  font-family: inherit;
  letter-spacing: -0.02em;
}
</style>
