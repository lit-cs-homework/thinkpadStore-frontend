<template>
  <div class="page">
    <AppHeader/>
    
    <!-- 轮播图部分 -->
    <header class="hero" v-if="heroImages.length > 0">
      <div class="carousel" @mouseenter="pause" @mouseleave="play">
        <div class="slides" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div class="slide" v-for="(item, i) in heroImages" :key="i">
            <img :src="item.image || defaultImage" :alt="item.name" />
          </div>
        </div>
        <div class="dots">
          <button v-for="(_, i) in heroImages" :key="i" 
                  :class="{ active: i === currentIndex }" 
                  @click="setIndex(i)">
          </button>
        </div>
      </div>
    </header>

    <!-- 商品网格 -->
    <main class="content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        加载中...
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="error">
        {{ error }}
        <button @click="fetchProducts" class="retry-btn">重试</button>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && products.length === 0" class="empty">
        暂无商品
      </div>
      
      <!-- 商品网格 -->
      <div class="grid" v-if="products.length > 0">
        <router-link class="card" v-for="product in displayedProducts" 
                     :key="product.id" 
                     :to="`/product/${product.id}`">
          <div class="card-inner">
            <img :src="product.image || defaultImage" 
                 :alt="product.name"
                 @error="handleImageError" />
            <div class="caption">{{ product.name }}</div>
            <div class="price" v-if="product.price">
              ¥{{ formatPrice(product.price) }}
            </div>
          </div>
        </router-link>
      </div>
      
      <!-- 分页控制（可选） -->
      <div class="pagination" v-if="products.length > pageSize">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { productService } from '@/services/api' // 导入API服务
import logo from '@/assets/logo.png'

export default {
  name: 'StoreApp',
  components: { AppHeader },
  setup() {
    // 响应式数据
    const defaultImage = logo
    const products = ref([]) // 商品列表
    const heroImages = ref([]) // 轮播图数据
    const loading = ref(false)
    const error = ref(null)
    const currentIndex = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(12) // 每页显示数量
    
    let timer = null

    // 计算属性
    const totalPages = computed(() => {
      return Math.ceil(products.value.length / pageSize.value)
    })

    const displayedProducts = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return products.value.slice(start, end)
    })

    // 轮播图控制
    const next = () => {
      if (heroImages.value.length > 0) {
        currentIndex.value = (currentIndex.value + 1) % heroImages.value.length
      }
    }
    
    const play = () => {
      stop()
      if (heroImages.value.length > 1) {
        timer = setInterval(next, 3000)
      }
    }
    
    const stop = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
    
    const pause = () => stop()
    const setIndex = (i) => (currentIndex.value = i)

    // 分页方法
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    // 数据格式化
    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2)
    }

    // 图片加载失败处理
    const handleImageError = (event) => {
      event.target.src = defaultImage
    }

    // 获取商品数据
    const fetchProducts = async () => {
      loading.value = true
      error.value = null
      
      try {
        // 调用API获取商品数据
        const response = await productService.getAll()
        
        // 根据你的API实际返回结构调整
        // 假设API返回的数据格式为：{ data: [...], success: true }
        if (response.success !== false) {
          // 如果API返回的是对象数组
          const data = response.data || response
          
          products.value = Array.isArray(data) ? data : []
          
          // 设置轮播图数据（取前3个商品）
          heroImages.value = products.value.slice(0, 3).map(product => ({
            id: product.id,
            name: product.name,
            image: product.image || defaultImage
          }))
        } else {
          throw new Error('API请求失败')
        }
      } catch (err) {
        console.error('获取商品数据失败:', err)
        error.value = err.message || '加载商品失败，请稍后重试'
        
        // 如果是开发环境，使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          console.log('使用模拟数据')
          products.value = generateMockProducts()
          heroImages.value = products.value.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            image: defaultImage
          }))
        }
      } finally {
        loading.value = false
      }
    }

    // 模拟数据生成（备用）
    const generateMockProducts = () => {
      const mockProducts = []
      for (let i = 1; i <= 16; i++) {
        mockProducts.push({
          id: i,
          name: `商品 ${i}`,
          price: (Math.random() * 1000 + 10).toFixed(2),
          image: defaultImage,
          description: `这是商品 ${i} 的描述`
        })
      }
      return mockProducts
    }

    // 生命周期
    onMounted(() => {
      fetchProducts()
      play()
    })

    onUnmounted(() => {
      stop()
    })

    return {
      products,
      heroImages,
      displayedProducts,
      loading,
      error,
      currentIndex,
      currentPage,
      pageSize,
      totalPages,
      defaultImage,
      
      // 方法
      setIndex,
      pause,
      play,
      nextPage,
      prevPage,
      fetchProducts,
      formatPrice,
      handleImageError
    }
  }
}
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

.content {
  padding: 16px;
  min-height: 400px;
}

.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  color: #f56c6c;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #66b1ff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  justify-items: stretch;
}

.card {
  text-decoration: none;
  color: inherit;
}

.card-inner {
  width: 100%;
  height: 100%;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-inner:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-inner img {
  width: 100%;
  height: calc(100% - 70px);
  object-fit: cover;
  display: block;
}

.caption {
  padding: 12px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  background: #fff;
  flex: 1;
}

.price {
  padding: 0 12px 12px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  background: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
}

.pagination button {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.pagination button:hover:not(:disabled) {
  background: #66b1ff;
}

.pagination button:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
  .card { height: calc(45vh - 16px); }
}

@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .card { height: calc(40vh - 16px); }
}

@media (max-width: 640px) {
  .hero { height: 40vh; }
  .grid { grid-template-columns: 1fr; }
  .card { height: calc(60vh - 16px); }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 