<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visibleSections = ref(new Set())
const observer = ref(null)

function setupObserver() {
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.value.add(entry.target.dataset.section)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  document.querySelectorAll('[data-section]').forEach((el) => {
    observer.value.observe(el)
  })
}

onMounted(() => {
  setupObserver()
})

onUnmounted(() => {
  if (observer.value) observer.value.disconnect()
})

function isVisible(sectionId) {
  return visibleSections.value.has(sectionId)
}

const teamMembers = [
  { name: '小许', role: '创始人 & CEO', desc: '资深猫奴，养了 3 只布偶', emoji: '👨‍💼', color: 'primary' },
  { name: '小李', role: '首席宠物营养师', desc: '10 年兽医经验', emoji: '👩‍⚕️', color: 'secondary' },
  { name: '小许', role: '技术总监', desc: '狗派程序员', emoji: '👨‍💻', color: 'accent' },
  { name: '小方', role: '设计主管', desc: '养了一只柯基', emoji: '👩‍🎨', color: 'success' },
  { name: '小陈', role: '首席兽医官', desc: '专注宠物健康 8 年', emoji: '👨‍🔬', color: 'warning' },
]

const values = [
  { emoji: '❤️', title: '用心', desc: '像对待自己的宠物一样对待每一位顾客的需求', gradient: 'from-primary/10 to-primary/5' },
  { emoji: '🔍', title: '专业', desc: '专业宠物营养师团队，为您提供科学的喂养建议', gradient: 'from-secondary/10 to-secondary/5' },
  { emoji: '🤝', title: '诚信', desc: '正品保障，7 天无理由退换，让您购物无忧', gradient: 'from-accent/10 to-accent/5' },
]

const milestones = [
  { year: '2024', event: '萌宠小店成立', emoji: '🎉' },
  { year: '2024', event: '合作品牌突破 50 家', emoji: '🤝' },
  { year: '2025', event: '服务宠物家庭超 50 万', emoji: '🐾' },
  { year: '2026', event: '全国仓储物流体系建成', emoji: '🏭' },
]
</script>

<template>
  <div class="min-h-screen">
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 mr-4">

      <section
        data-section="hero"
        class="text-center mb-16"
      >
        <div
          class="transition-all duration-700"
          :class="isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <h1 class="text-4xl md:text-5xl font-bold text-text-dark font-pet mb-4">
            🐾 关于我们
          </h1>
          <p class="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            用心呵护每一个小生命
          </p>
        </div>
      </section>

      <section
        data-section="story"
        class="mb-12 md:mb-16"
      >
        <div
          class="bg-card-bg rounded-2xl p-6 md:p-10 shadow-sm border border-border/50 relative overflow-hidden transition-all duration-700"
          :class="isVisible('story') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>
          <h2 class="text-2xl font-bold text-text-dark font-pet mb-6 relative z-10">📖 我们的故事</h2>
          <div class="space-y-4 relative z-10">
            <p class="text-text-muted leading-relaxed">
              萌宠小店成立于 2024 年，由一群热爱宠物的年轻人创立。我们深知每一位宠物主人对毛孩子的爱，
              因此我们致力于为全球宠物家庭提供最优质、最安全、最具性价比的宠物用品。
            </p>
            <p class="text-text-muted leading-relaxed">
              从选品到售后，每一个环节我们都严格把关。我们与全球超过 50 个知名宠物品牌建立合作关系，
              确保每一件商品都经过严格的质量检测，让您的爱宠用得安心、吃得放心。
            </p>
          </div>
        </div>
      </section>

      <section
        data-section="values"
        class="mb-12 md:mb-16"
      >
        <h2
          class="text-2xl font-bold text-text-dark font-pet mb-8 text-center transition-all duration-700"
          :class="isVisible('values') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >💎 我们的价值观</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(item, index) in values"
            :key="item.title"
            class="bg-gradient-to-br rounded-2xl p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden transition-all duration-700"
            :class="[item.gradient, isVisible('values') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
            :style="{ transitionDelay: isVisible('values') ? `${index * 150}ms` : '0ms' }"
          >
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span class="text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">{{ item.emoji }}</span>
            <h3 class="text-xl font-bold text-text-dark mb-3 group-hover:text-primary transition-colors">{{ item.title }}</h3>
            <p class="text-text-muted leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </section>

      <section
        data-section="milestones"
        class="mb-12 md:mb-16"
      >
        <h2
          class="text-2xl font-bold text-text-dark font-pet mb-8 text-center transition-all duration-700"
          :class="isVisible('milestones') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >🚀 发展历程</h2>
        <div
          class="bg-card-bg rounded-2xl p-6 md:p-10 shadow-sm border border-border/50 transition-all duration-700"
          :class="isVisible('milestones') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              v-for="(milestone, index) in milestones"
              :key="milestone.event"
              class="text-center group transition-all duration-500"
              :style="{ transitionDelay: isVisible('milestones') ? `${index * 100}ms` : '0ms' }"
            >
              <span class="text-3xl block mb-2 group-hover:scale-125 transition-transform duration-300">{{ milestone.emoji }}</span>
              <div class="text-lg font-bold text-primary font-pet">{{ milestone.year }}</div>
              <div class="text-sm text-text-muted mt-1">{{ milestone.event }}</div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="team"
        class="mb-12 md:mb-16"
      >
        <h2
          class="text-2xl font-bold text-text-dark font-pet mb-8 text-center transition-all duration-700"
          :class="isVisible('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >👥 我们的团队</h2>
        <div
          class="bg-card-bg rounded-2xl p-6 md:p-10 shadow-sm border border-border/50 transition-all duration-700"
          :class="isVisible('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <div
              v-for="(member, index) in teamMembers"
              :key="member.name + member.role"
              class="text-center group transition-all duration-500"
              :style="{ transitionDelay: isVisible('team') ? `${index * 80}ms` : '0ms' }"
            >
              <div
                class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl ring-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                :class="`bg-${member.color}/20 ring-${member.color}/30`"
              >
                {{ member.emoji }}
              </div>
              <h3 class="font-semibold text-text-dark group-hover:text-primary transition-colors">{{ member.name }}</h3>
              <p class="text-text-muted text-sm">{{ member.role }}</p>
              <p class="text-text-light text-xs mt-1">{{ member.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="contact"
        class="mb-0"
      >
        <div
          class="w-full bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden transition-all duration-700"
          :class="isVisible('contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <h2 class="text-2xl md:text-3xl font-bold font-pet mb-4 relative z-10">
            有任何问题？联系我们吧！
          </h2>
          <p class="text-white/80 mb-6 relative z-10">
            我们的宠物顾问团队随时为您服务
          </p>
          <div class="flex flex-wrap justify-center gap-6 text-sm relative z-10">
            <span class="hover:text-white/90 transition-colors">📞 1433223</span>
            <span>🌐 <a href="https://pet-shop-54p.pages.dev/" class="underline hover:text-white/80 transition-colors">https://pet-shop-54p.pages.dev/</a></span>
            <span>🕐 周一至周日 9:00-21:00</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
