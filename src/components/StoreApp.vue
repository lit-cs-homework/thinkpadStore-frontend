<template>
  <div class="page">
    <AppHeader />

    <!-- 轮播图 -->
    <header class="hero" v-if="heroImages.length">
      <div class="carousel" @mouseenter="stop" @mouseleave="play">
        <button class="nav-btn prev" @click="prev">
          <i class="arrow-left"></i>
        </button>
        <button class="nav-btn next" @click="next">
          <i class="arrow-right"></i>
        </button>
        <div class="slides" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div class="slide" v-for="(item, i) in heroImages" :key="i">
            <img :src="item.image || defaultImage" :alt="item.name" />
          </div>
        </div>
        <div class="dots">
          <button
            v-for="(_, i) in heroImages"
            :key="i"
            :class="{ active: i === currentIndex }"
            @click="currentIndex = i"
          ></button>
        </div>
      </div>
    </header>

    <!-- 分类导航栏 -->
    <div class="category-nav">
      <div class="category-tabs">
        <div
          class="category-tab"
          v-for="category in categoryList"
          :key="category.type"
          @click="switchCategory(category.type)"
          :class="{ active: currentCategory === category.type }"
        >
          <img
            :src="currentCategory === category.type ? category.activeIcon : category.icon"
            :alt="category.name"
            class="category-icon"
          />
          <span>{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 商品网格 -->
    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">
        {{ error }}
        <button @click="fetchProducts" class="retry-btn">重试</button>
      </div>
      <div v-else-if="!products.length" class="empty">暂无商品</div>
      <div v-else>
        <div class="grid">
          <router-link
            class="card"
            v-for="product in displayedProducts"
            :key="product.id"
            :to="`/product/${product.id}`"
          >
            <div class="card-inner">
              <img
                :src="product.image || defaultImage"
                :alt="product.name"
                @error="(e) => e.target.src = defaultImage"
              />
              <div class="caption">{{ product.name }}</div>
              <div class="desc">{{ product.desc }}</div>
              <div class="price" v-if="product.price">¥{{ formatPrice(product.price) }}</div>
            </div>
          </router-link>
        </div>

        <div class="pagination" v-if="products.length > pageSize">
          <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
          <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from "./AppHeader.vue";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { productService } from "@/services/api";
import logo from "@/assets/Lenovo.png";
import hero1 from "@/assets/l1.jpg";
import hero2 from "@/assets/l2.jpg";
import hero3 from "@/assets/l3.jpg";
import allDefault from "@/assets/icons/all-default.png";
import desktopDefault from "@/assets/icons/desktop-default.png";
import desktopActive from "@/assets/icons/desktop-active.png";
import laptopDefault from "@/assets/icons/laptop-default.png";
import laptopActive from "@/assets/icons/laptop-active.png";
import thinkpadDefault from "@/assets/icons/thinkpad-default.png";
import thinkpadActive from "@/assets/icons/thinkpad-active.png";
import tabletDefault from "@/assets/icons/tablet-default.png";
import tabletActive from "@/assets/icons/tablet-active.png";
import phoneDefault from "@/assets/icons/phone-default.png";
import phoneActive from "@/assets/icons/phone-active.png";
import serviceDefault from "@/assets/icons/service-default.png";
import serviceActive from "@/assets/icons/service-active.png";
import monitorDefault from "@/assets/icons/monitor-default.png";
import monitorActive from "@/assets/icons/monitor-active.png";
import smartDefault from "@/assets/icons/smart-default.png";
import smartActive from "@/assets/icons/smart-active.png";

export default {
  name: "StoreApp",
  components: { AppHeader },
  setup() {
    // 基础常量 无需响应式
    const defaultImage = logo;
    const pageSize = 12;

    // 响应式数据
    const products = ref([]);
    const allProducts = ref([]);
    // 轮播图
    const heroImages = ref([
      { id: "hero-1", name: "轮播图 1", image: hero1 },
      { id: "hero-2", name: "轮播图 2", image: hero2 },
      { id: "hero-3", name: "轮播图 3", image: hero3 },
    ]);
    const loading = ref(false);
    const error = ref(null);
    const currentIndex = ref(0);
    const currentPage = ref(1);
    const currentCategory = ref("all");

    // 分类列表
    const categoryList = ref([
      { type: "all", name: "全部", icon: allDefault, activeIcon: allDefault },
      { type: "desktop", name: "Lenovo台式机", icon: desktopDefault, activeIcon: desktopActive },
      { type: "laptop", name: "Lenovo笔记本", icon: laptopDefault, activeIcon: laptopActive },
      { type: "thinkpad", name: "ThinkPad电脑", icon: thinkpadDefault, activeIcon: thinkpadActive },
      { type: "tablet", name: "平板", icon: tabletDefault, activeIcon: tabletActive },
      { type: "phone", name: "手机", icon: phoneDefault, activeIcon: phoneActive },
      { type: "service", name: "选件/服务", icon: serviceDefault, activeIcon: serviceActive },
      { type: "monitor", name: "显示器/IP周边", icon: monitorDefault, activeIcon: monitorActive },
      { type: "smart", name: "智能产品", icon: smartDefault, activeIcon: smartActive },
    ]);

    // 轮播相关
    let timer = null;
    const next = () => currentIndex.value = (currentIndex.value + 1) % heroImages.value.length;
    const prev = () => currentIndex.value = (currentIndex.value - 1 + heroImages.value.length) % heroImages.value.length;
    const play = () => heroImages.value.length > 1 && !timer && (timer = setInterval(next, 3000));
    const stop = () => timer && (clearInterval(timer), timer = null);

    // 分页计算
    const totalPages = computed(() => Math.ceil(products.value.length / pageSize));
    const displayedProducts = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return products.value.slice(start, start + pageSize);
    });
    const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
    const prevPage = () => currentPage.value > 1 && currentPage.value--;

    // 工具函数
    const formatPrice = (price) => parseFloat(price).toFixed(2);

    // 分类切换
    const switchCategory = (type) => {
      currentCategory.value = type;
      currentPage.value = 1;
      products.value = type === "all" ? [...allProducts.value] : allProducts.value.filter(p => p.category === type);
    };

    const fetchProducts = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await productService.getAll();
        const data = Array.isArray(response.data || response) ? (response.data || response) : [];
        // 自动分配商品分类
        allProducts.value = data.map(product => {
          if (!product.category) {
            const name = product.name.toLowerCase();
            switch (true) {
              case name.includes("斗战者") || name.includes("r7000p"): product.category = "desktop"; break;
              case name.includes("笔记本") || name.includes("thinkbook"): product.category = "laptop"; break;
              case name.includes("thinkpad"): product.category = "thinkpad"; break;
              case name.includes("平板") || name.includes("pad"): product.category = "tablet"; break;
              case name.includes("手机") || name.includes("摩托罗拉"): product.category = "phone"; break;
              case name.includes("显示器"): product.category = "monitor"; break;
              case name.includes("智能"): product.category = "smart"; break;
              default: product.category = "service";
            }
          }
          return product;
        });
        // 初始化分类（轮播图已改为前端写死配置，不再依赖商品数据）
        switchCategory(currentCategory.value);
      } catch (err) {
        console.error("获取商品失败:", err);
        error.value = err.message || "加载商品失败，请稍后重试";
      } finally {
        loading.value = false;
      }
    };

    // 生命周期
    onMounted(() => { fetchProducts(); play(); });
    onUnmounted(() => stop());

    return {
      defaultImage, products, heroImages, loading, error,
      currentIndex, currentPage, pageSize, totalPages, displayedProducts,
      categoryList, currentCategory, prev, next, play, stop,
      nextPage, prevPage, formatPrice, switchCategory, fetchProducts
    };
  }
};
</script>

<style scoped>
.page {
  padding-top: 60px;
  min-height: 100vh;
  background: #fff;
  color: #222;
}
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
  --btn-opacity: 0.5;
}
.carousel:hover { --btn-opacity: 1; }
.slides {
  display: flex;
  height: 100%;
  transition: transform 0.6s ease;
  will-change: transform;
}
.slide { flex: 0 0 100%; height: 100%; }
.slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
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
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 80px;
  border-radius: 6px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: var(--btn-opacity);
  border: 2px solid rgba(255,255,255,0.2);
}
.nav-btn:hover {
  background: rgba(0,0,0,0.8);
  transform: translateY(-50%) scale(1.05);
  opacity: 1;
}
.prev { left: 20px; }
.next { right: 20px; }
.arrow-left, .arrow-right {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-width: 0 2px 2px 0;
}
.arrow-left { transform: rotate(135deg); }
.arrow-right { transform: rotate(-45deg); }

.category-nav {
  width: 100%;
  margin: 0 auto;
  padding: 30px 0;
  border-bottom: 1px solid #eee;
}
.category-tabs {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}
.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #8C8C8C;
  font-size: 15px;
  transition: color 0.2s ease;
}
.category-tab.active, .category-tab:hover { color: #000000; }
.category-icon {
  width: 80px;
  height: 60px;
  object-fit: contain;
  border-radius: 4px;
}

.content { padding: 16px; min-height: 400px; }
.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}
.error { color: #f56c6c; }
.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}
.retry-btn:hover { background: #66b1ff; }

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 95%;
  margin: 0 auto;
  padding: 8px 0;
}
.card { text-decoration: none; color: inherit; }
.card-inner {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08); 
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-inner:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.card-inner img {
  width: 80%;
  height: 80%;
  object-fit: contain;
  display: block;
  margin: 20px 0 10px;
}
.caption {
  padding: 0 12px;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.desc {
  padding: 0 12px;
  text-align: center;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.price {
  padding: 10px 12px 20px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #c81f1f;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap:20px;
  margin-top:30px;
  padding:20px;
}
.pagination button {
  padding:8px 16px;
  background:#409eff;
  color:white;
  border:none;
  border-radius:4px;
  cursor:pointer;
  transition:background 0.3s;
}
.pagination button:hover:not(:disabled) { background:#66b1ff; }
.pagination button:disabled {
  background:#c0c4cc;
  cursor:not-allowed;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .grid { grid-template-columns: repeat(3,1fr); }
  .card { height: calc(45vh - 16px); }
}
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2,1fr); }
  .card { height: calc(40vh - 16px); }
}
@media (max-width: 640px) {
  .hero { height:40vh; }
  .grid { grid-template-columns:1fr; }
  .card { height: calc(60vh - 16px); }
  .pagination { flex-direction: column; gap:10px; }
  .nav-btn { width:50px; height:35px; }
  .arrow-left, .arrow-right { width:12px; height:12px; }
}
</style>