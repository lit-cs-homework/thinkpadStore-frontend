<template>
  <div class="page">
    <AppHeader/>
    <header class="hero">
      <div class="carousel" @mouseenter="pause" @mouseleave="play">
        <div class="slides" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div class="slide" v-for="(img, i) in images" :key="i">
            <img :src="img" :alt="'hero-'+i" />
          </div>
        </div>
        <div class="dots">
          <button v-for="(_, i) in images" :key="i" :class="{ active: i === currentIndex }" @click="setIndex(i)"></button>
        </div>
      </div>
    </header>

    <main class="content">
      <div class="grid">
        <router-link class="card" v-for="n in 16" :key="n" :to="`/product/${n}`">
          <div class="card-inner">
            <img :src="cardImage" alt="item" />
            <div class="caption">商品 {{ n }}</div>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import logo from '@/assets/logo.png'

export default {
  name: 'StoreApp',
  components: { AppHeader },
  setup() {
    const images = [logo, logo, logo] // 用真实图片替换 logo.png
    const cardImage = logo
    const currentIndex = ref(0)
    let timer = null

    const next = () => {
      currentIndex.value = (currentIndex.value + 1) % images.length
    }
    const play = () => {
      stop()
      timer = setInterval(next, 3000)
    }
    const stop = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
    const pause = () => stop()
    const setIndex = (i) => (currentIndex.value = i)

    onMounted(() => play())
    onUnmounted(() => stop())

    return { images, cardImage, currentIndex, setIndex, pause, play }
  }
}
</script>

<style scoped>
.page {
  padding-top: 60px; /* 抵消 fixed header 高度，防止遮挡 */
  min-height: 100vh;
  background: #fff;
  color: #222;
}

/* hero: 占满宽度，高度为屏幕 50% */
.hero {
  width: 100%;
  height: 50vh;
  overflow: hidden;
  position: relative;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel {
  width: 100%;
  height: 100%;
  position: relative;
}

.slides {
  display: flex;
  height: 100%;
  transition: transform 0.6s ease;
  will-change: transform;
}

.slide {
  flex: 0 0 100%;
  height: 100%;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 指示点 */
.dots {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 12px;
  display: flex;
  gap: 8px;
  z-index: 5;
}
.dots button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 0;
}
.dots button.active {
  background: rgba(255,255,255,0.95);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.08);
}

/* 内容区：网格 4 列，卡片宽约 25vw，高约 50vh */
.content {
  padding: 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  justify-items: stretch;
}

/* 为了保证“当只显示小框图时屏幕可同时展示 8 张”，
   卡片高度使用基于视口高度的规则 */
.card {
  width: calc(25vw - 12px);
  height: calc(50vh - 12px);
}
.card-inner {
  width: 100%;
  height: 100%;
  background: #fafafa;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-inner img {
  width: 100%;
  height: calc(100% - 32px);
  object-fit: cover;
  display: block;
}
.caption {
  padding: 8px;
  text-align: center;
  font-size: 14px;
  background: #fff;
}

/* 响应式：窄屏改为 2 或 3 列 */
@media (max-width: 1000px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
  .card { width: calc(33.333vw - 12px); }
}
@media (max-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .card { width: calc(50vw - 12px); height: calc(40vh - 12px); }
}
</style>