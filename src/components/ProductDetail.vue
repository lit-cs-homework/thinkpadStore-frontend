<template>
  <div class="product-page">
    <header>
      <AppHeader/>
    </header>
    <main class="detail-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">加载商品信息中...</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchProductDetail" class="retry-btn">重试</button>
      </div>

      <!-- 商品详情 -->
      <div v-else-if="product" class="product-detail">
        <div class="product-images">
          <div class="image-container">
            <img
              :src="productImages[currentIndex]"
              class="image"
              alt="Product Image"
              @click="toggleImageZoom"
              @error="handleImageError(currentIndex)"
            >
          </div>
          <div v-if="productImages.length > 0" class="thumbnails">
            <div v-for="(image, index) in productImages" :key="index" class="thumbnail-container">
              <img
                :src="image"
                class="thumbnail"
                :class="{ active: currentIndex === index }"
                @click="switchImage(index)"
                @error="handleImageError(index)"
                alt="Thumbnail Image"
              />
            </div>
          </div>
        </div>
        <div class="product-info">
          <div class="product-title">
            <h2>{{ product.name }}</h2>
            <span class="product-count">数量: {{ quantity }}</span>
          </div>
          <div class="product-back">
            <div class="product-price">
              价格: ¥{{ formatPrice(Number(product.price || 0) + Number(selectedExtraPrice)) }}
              <span v-if="selectedExtraPrice > 0" class="extra-price-note">
                (基础¥{{ formatPrice(product.price || 0) }} + 额外¥{{ formatPrice(selectedExtraPrice) }})
              </span>
            </div>
            <p v-if="product.description" class="product-description">{{ product.description }}</p>
          </div>

          <!-- 额外配置选择区域 -->
          <div class="extra-price-config">
            <h4>额外配置选择</h4>
            <div class="config-row" v-for="(row, rowIndex) in extraPriceRows" :key="rowIndex">
              <div
                class="config-option"
                v-for="(option, optIndex) in row"
                :key="optIndex"
                @click="selectExtraPrice(option.price)"
                :class="{ active: selectedExtraPrice === option.price }"
              >
                {{ option.label }} (¥{{ option.price }})
              </div>
            </div>
          </div>

          <div class="quantity-control">
            <button @click="decreaseQuantity">-</button>
            <span>{{ quantity }}</span>
            <button @click="increaseQuantity">+</button>
          </div>

          <div class="action-buttons">
            <button class="add-to-cart-btn" @click="addToCart">
              🛒 加入购物车
            </button>
            <button class="buy-now-btn" @click="buyNow">
              ⚡ 立即购买
            </button>
          </div>
        </div>
      </div>

      <!-- 图片放大显示 -->
      <div v-if="isZoomed && !loading && !error" class="zoom-overlay" @click="toggleImageZoom">
        <img
          :src="productImages[currentIndex]"
          class="zoomed-image"
          alt="Zoomed Product Image"
          @error="handleImageError(currentIndex)"
        >
      </div>
    </main>
  </div>
</template>

<script>
import { inject, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import logo from '@/assets/logo.png'
import logo1 from '@/assets/ouc.png'
import { productService, cartService } from '@/services/api'

export default {
  name: 'ProductDetail',
  components: { AppHeader },
  setup() {
    const route = useRoute()
    const showCartSidebar = inject('showCartSidebar', () => {})
    const cartState = inject('cartState', { items: [] })

    // 响应式数据
    const product = ref(null)
    const productImages = ref([logo, logo1, logo, logo, logo])
    const currentIndex = ref(0)
    const isZoomed = ref(false)
    const quantity = ref(1)
    const loading = ref(true)
    const error = ref(null)
    const selectedExtraPrice = ref(0)

    // 额外配置选项
    const extraPriceOptions = ref([
      { label: '基础配置', price: 0 },
      { label: '内存升级', price: 500 },
      { label: '硬盘升级', price: 800 },
      { label: '保修延长', price: 300 },
      { label: '配件套装', price: 200 }
    ])

    // 计算属性：将额外配置选项按行分组（每行2个）
    const extraPriceRows = computed(() => {
      const rows = []
      for (let i = 0; i < extraPriceOptions.value.length; i += 2) {
        rows.push(extraPriceOptions.value.slice(i, i + 2))
      }
      return rows
    })

    // 价格格式化函数
    const formatPrice = (price) => {
      return Number(price || 0).toFixed(2)
    }

    // 图片错误处理
    const handleImageError = (index) => {
      console.warn(`图片加载失败，索引: ${index}`)
      // 可以在这里设置默认图片
    }

    // 获取商品详情
    const fetchProductDetail = async () => {
      try {
        loading.value = true
        error.value = null

        const productId = route.params.id
        const productData = await productService.getById(productId)

        product.value = productData

        // 设置商品图片，如果API有图片数据就使用，否则使用默认图片
        if (productData.image) {
          productImages.value = [productData.image, logo1, logo, logo, logo]
        }

      } catch (err) {
        console.error('获取商品详情失败:', err)
        error.value = '获取商品详情失败，请稍后重试'

        // 如果API失败，使用模拟数据
        product.value = {
          id: route.params.id || 1,
          name: 'ThinkPad T14p 2023',
          price: 5699,
          description: '高性能商务笔记本'
        }
      } finally {
        loading.value = false
      }
    }

    // 方法
    const switchImage = (index) => {
      currentIndex.value = index
      isZoomed.value = false
    }

    const toggleImageZoom = () => {
      isZoomed.value = !isZoomed.value
    }

    const increaseQuantity = () => {
      if (quantity.value < 10) {
        quantity.value++
      }
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const selectExtraPrice = (price) => {
      selectedExtraPrice.value = price
    }

    const addToCart = async () => {
      if (!product.value) {
        alert('商品信息加载中，请稍后重试')
        return
      }

      try {
        // 计算总价（基础价格 + 额外配置价格）
        const totalPrice = Number(product.value.price || 0) + Number(selectedExtraPrice.value)

        // 根据API文档构造购物车数据
        const cartItemData = {
          product: product.value.id,  // 商品ID（必填字段）
          quantity: quantity.value,   // 商品数量
          extra_price: selectedExtraPrice.value, // 额外配置价格
          total_price: (totalPrice * quantity.value).toFixed(2) // 总价
        }

        // 调用API添加到购物车
        const createdItem = await cartService.create(cartItemData)

        // 根据API响应构造本地显示数据
        const localProductData = {
          id: createdItem.id, // 使用后端返回的真实ID
          name: product.value.name || 'Unknown Product',
          price: product.value.price || 0,
          quantity: createdItem.quantity, // 使用后端返回的数量（可能已合并）
          image: productImages.value[0],
          product: product.value.id, // 保存商品ID
          extra_price: selectedExtraPrice.value,
          total_price: createdItem.total_price || (totalPrice * quantity.value).toFixed(2)
        }

        // 检查购物车中是否已存在该商品，如果存在则更新，否则添加
        const existingItemIndex = cartState.items.findIndex(item => item.product === product.value.id)
        if (existingItemIndex !== -1) {
          // 更新现有商品
          cartState.items[existingItemIndex] = localProductData
        } else {
          // 添加新商品
          cartState.items.push(localProductData)
        }

        // 显示购物车侧边栏
        showCartSidebar()

        // 重置数量和配置
        quantity.value = 1
        selectedExtraPrice.value = 0

        alert(`商品已添加到购物车，数量：${localProductData.quantity}，总价：¥${localProductData.total_price}`)
      } catch (error) {
        console.error('添加到购物车失败:', error)
        // 如果是认证错误，提示用户登录
        if (error.response?.status === 401) {
          alert('请先登录后再添加商品到购物车')
        } else if (error.response?.status === 400) {
          alert('商品信息有误或库存不足，请重试')
        } else {
          alert('添加到购物车失败，请重试')
        }
      }
    }

    // 立即购买功能（暂时空实现）
    const buyNow = () => {
      alert('立即购买功能开发中...')
    }

    // 组件挂载时获取商品数据
    onMounted(() => {
      fetchProductDetail()
    })

    return {
      product,
      productImages,
      currentIndex,
      isZoomed,
      quantity,
      loading,
      error,
      selectedExtraPrice,
      extraPriceRows,
      showCartSidebar,
      cartState,
      switchImage,
      toggleImageZoom,
      increaseQuantity,
      decreaseQuantity,
      selectExtraPrice,
      addToCart,
      buyNow,
      fetchProductDetail,
      formatPrice,
      handleImageError
    }
  }
}
</script>

<style scoped>
.product-page {
  padding-top: 60px; /* 抵消固定头部 */
  min-height: 100vh;
  background: #fff;
}

.detail-content {
  display: flex;
  padding: 2%;
}

.product-detail {
  display: flex;
  width: 100%;
}

/*主预览图*/
.product-images {
  width: 25%;
  padding-right: 2%;
  position: relative;
  margin-left: 150px;
}

.image-container {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  box-shadow: 0 0 10px #d6d5d5;
  border: 2px solid #ababab;
  border-radius: 4px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  display: block;
}

/*缩略图*/
.thumbnails {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  margin-top: 10px;
  box-shadow: 0 0 10px #d6d5d5;
  border: 2px solid #ababab;
  border-radius: 4px;
  padding: 8px;
  gap: 5px;
  max-height: 80px; /* 限制容器高度，避免过高 */
  scrollbar-width: thin; /* 火狐浏览器 */
}

.thumbnails::-webkit-scrollbar {
  height: 4px; /* 横向滚动条高度 */
}

.thumbnails::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 2px;
}

.thumbnail-container {
  width: 50px; /* 固定缩略图宽度（可根据需求调整） */
  height: 50px; /* 固定高度（替代aspect-ratio，避免自适应导致的高度问题） */
  overflow: hidden;
  border-radius: 4px;
  background-color: #f8f8f8;
  flex-shrink: 0;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填满容器 */
  cursor: pointer;
}

.thumbnail.active {
  border: 2px solid #409EFF;
}

.product-info {
  width: 50%;
  padding-left: 20px; /* 添加左边距 */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 使按钮靠下对齐 */
}

.product-title {
  display: flex;
  align-items: center;
  font-size: 24px;
  margin-bottom: 5px; /* 减少上下间距 */
}

.product-count {
  font-size: 14px;
  color: #666;
  margin-left: 10px; /* 添加左边距 */
}

.product-price {
  display: flex;
  font-weight: bold;
  font-size: 20px;
  color: #333;
  margin-bottom: 10px; /* 减少上下间距 */
  align-items: center;
}

/* 额外价格说明样式 */
.extra-price-note {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
  font-weight: normal;
}

.product-back {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  width: 70%;
}

/* 额外价格配置样式 */
.extra-price-config {
  margin: 15px 0;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  width: 70%;
}

.extra-price-config h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.config-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.config-option {
  flex: 1;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.config-option.active {
  background-color: #409EFF;
  color: #fff;
  border-color: #409EFF;
}

.config-option:hover {
  border-color: #409EFF;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  border: 2px solid #888; /* 添加黑边 */
  box-shadow: 0 0 8px #d6d5d5;
  padding: 5px;
  border-radius: 4px;
  width: fit-content;
}

.quantity-control button {
  background-color: #f0f0f0;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 2px;
}

.quantity-control button:hover {
  background-color: #e0e0e0;
}

.quantity-control span {
  margin: 0 10px;
  font-size: 20px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.add-to-cart-btn, .buy-now-btn {
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
  transition: all 0.3s ease;
}

.add-to-cart-btn {
  background-color: #ff6700;
}

.add-to-cart-btn:hover {
  background-color: #ff8533;
  transform: translateY(-2px);
}

.buy-now-btn {
  background-color: #ff4757;
}

.buy-now-btn:hover {
  background-color: #ff6b81;
  transform: translateY(-2px);
}

/* 产品描述样式 */
.product-description {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
  line-height: 1.5;
}

/*点击图片后，图片放大并移动到屏幕中央 */
.zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.zoomed-image {
  width: 600px;
  height: 600px;
  object-fit: contain;
  cursor: pointer;
}

/* 加载和错误状态样式 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  font-size: 18px;
  color: #666;
  padding: 20px;
}

.error-state {
  color: #f56c6c;
}

.error-state p {
  font-size: 16px;
  margin-bottom: 20px;
}

.retry-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background-color: #66b1ff;
}

@media (max-width: 768px) {
  .detail-content {
    flex-direction: column;
  }
  .product-images,
  .product-info {
    width: 100%;
  }
  .product-images {
    padding-right: 0;
    margin-left: 0;
  }
  .thumbnails {
    justify-content: flex-start;
  }

  /* 移动端保持1:1比例 */
  .image-container {
    aspect-ratio: 1/1;
  }
  .thumbnail-container {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  /* 移动端配置选项适配 */
  .extra-price-config {
    width: 100%;
  }
  .product-back {
    width: 100%;
  }
}
</style>