<template>
  <!-- 模板部分无需修改，保持原有逻辑 -->
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
            <div v-if="productImages.length === 0" class="no-image-placeholder">
              <span>暂无商品图片</span>
            </div>
            <img
              v-else
              :src="productImages[currentIndex]"
              class="image"
              alt="Product Image"
              @click="toggleImageZoom"
              @error="handleImageError(currentIndex)"
            >
          </div>
          
          <div v-if="productImages.length > 1" class="thumbnails">
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
          
          <!-- 商品详细配置展示 -->
          <div v-if="productModelConfig" class="product-model-config">
            <span class="config-label">详细配置：</span>
            <span class="config-value">{{ productModelConfig }}</span>
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
      <div v-if="isZoomed && !loading && !error && productImages.length > 0" class="zoom-overlay" @click="toggleImageZoom">
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
// 兜底图片（无图片时使用）
import fallbackImage from '@/assets/logo.png'
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
    const productImages = ref([]) // 初始化为空数组，适配任意数量的图片
    const currentIndex = ref(0)
    const isZoomed = ref(false)
    const quantity = ref(1)
    const loading = ref(true)
    const error = ref(null)
    const selectedExtraPrice = ref(0)
    const productModelConfig = ref('')
    const extraPriceOptions = ref([])

    // 图片服务器基础URL（从你的日志中提取）
    const IMAGE_BASE_URL = 'http://ouc.it.srv.thinkpadstore.lighilit.top/'

    // 计算属性：将额外配置选项按行分组（每行2个）
    const extraPriceRows = computed(() => {
      const rows = []
      for (let i = 0; i < extraPriceOptions.value.length; i += 2) {
        rows.push(extraPriceOptions.value.slice(i, i + 2))
      }
      return rows
    })

    const formatPrice = (price) => {
      return Number(price || 0).toFixed(2)
    }

    const handleImageError = (index) => {
      console.warn(`图片加载失败，索引: ${index}`)
      if (productImages.value[index]) {
        productImages.value[index] = fallbackImage
      }
    }

    // 辅助函数：拼接完整的图片URL
    const getFullImageUrl = (imagePath) => {
      if (!imagePath) return ''
      // 如果已经是完整URL，直接返回
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      // 拼接基础URL和图片路径
      return `${IMAGE_BASE_URL}${imagePath}`
    }

    const fetchProductDetail = async () => {
      try {
        loading.value = true
        error.value = null

        const productId = route.params.id
        const productData = await productService.getById(productId)
        console.log('后端返回的商品数据:', productData)

        product.value = productData

        // 处理商品配置信息
        if (productData.model) {
          productModelConfig.value = productData.model.replace(/#/g, '/').replace(/^\/|\/$/g, '')
        } else {
          productModelConfig.value = ''
        }

        // 处理商品图片 - 核心修复点
        if (productData.images && Array.isArray(productData.images)) {
          // 过滤掉空值和无效图片地址，拼接完整URL
          const validImages = productData.images
            .filter(img => img && typeof img === 'string' && img.trim())
            .map(img => getFullImageUrl(img)) // 拼接完整URL
          productImages.value = validImages
          console.log(`加载到 ${validImages.length} 张有效商品图片`, validImages)
        } else if (productData.image) {
          // 兼容单个图片字段，拼接完整URL
          productImages.value = [getFullImageUrl(productData.image)]
        } else {
          // 无图片时置空
          productImages.value = []
        }

        // 处理配件配置
        if (productData.equipments && Array.isArray(productData.equipments)) {
          extraPriceOptions.value = productData.equipments.map(item => ({
            label: item.name || '未知配件',
            price: Number(item.extra_price) || 0
          }))
          if (extraPriceOptions.value.length === 0) {
            extraPriceOptions.value = [{ label: '基础配置', price: 0 }]
          }
        } else {
          extraPriceOptions.value = [
            { label: '基础配置', price: 0 },
            { label: '内存升级', price: 500 },
            { label: '硬盘升级', price: 800 },
            { label: '保修延长', price: 300 },
            { label: '配件套装', price: 200 }
          ]
        }

      } catch (err) {
        console.error('获取商品详情失败:', err)
        error.value = '获取商品详情失败，请稍后重试'

        // 异常时的模拟数据（模拟不同数量的图片）
        product.value = {
          id: route.params.id || 1,
          name: 'ThinkPad T14p 2023',
          price: 5699,
          description: '高性能商务笔记本',
          model: 'i7-13700H#32GB内存#1TB SSD#RTX4060#2.5K屏',
          // 模拟随机数量的图片（演示用）
          images: [fallbackImage, fallbackImage], 
          equiments: [
            { name: '基础配置', price: 0 },
            { name: '内存升级', price: 500 },
            { name: '硬盘升级', price: 800 },
            { name: '保修延长', price: 300 },
            { name: '配件套装', price: 200 }
          ]
        }
        productModelConfig.value = product.value.model.replace(/#/g, '/').replace(/^\/|\/$/g, '')
        productImages.value = product.value.images
        extraPriceOptions.value = product.value.equipments.map(item => ({
          label: item.name,
          price: item.extra_price
        }))
      } finally {
        loading.value = false
      }
    }

    const switchImage = (index) => {
      // 确保索引在有效范围内
      if (index >= 0 && index < productImages.value.length) {
        currentIndex.value = index
        isZoomed.value = false
      }
    }

    const toggleImageZoom = () => {
      // 无图片时不执行放大操作
      if (productImages.value.length === 0) return
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
        const totalPrice = Number(product.value.price || 0) + Number(selectedExtraPrice.value)
        const cartItemData = {
          product: product.value.id,
          quantity: quantity.value,
          extra_price: selectedExtraPrice.value,
          total_price: (totalPrice * quantity.value).toFixed(2)
        }

        const createdItem = await cartService.create(cartItemData)
        const localProductData = {
          id: createdItem.id,
          name: product.value.name || 'Unknown Product',
          price: product.value.price || 0,
          quantity: createdItem.quantity,
          // 🔥 优化6：购物车图片适配，无图片时用兜底图
          image: productImages.value[0] || fallbackImage,
          product: product.value.id,
          extra_price: selectedExtraPrice.value,
          total_price: createdItem.total_price || (totalPrice * quantity.value).toFixed(2)
        }

        const existingItemIndex = cartState.items.findIndex(item => item.product === product.value.id)
        if (existingItemIndex !== -1) {
          cartState.items[existingItemIndex] = localProductData
        } else {
          cartState.items.push(localProductData)
        }

        showCartSidebar()
        quantity.value = 1
        selectedExtraPrice.value = 0

        alert(`商品已添加到购物车，数量：${localProductData.quantity}，总价：¥${localProductData.total_price}`)
      } catch (error) {
        console.error('添加到购物车失败:', error)
        if (error.response?.status === 401) {
          alert('请先登录后再添加商品到购物车')
        } else if (error.response?.status === 400) {
          alert('商品信息有误或库存不足，请重试')
        } else {
          alert('添加到购物车失败，请重试')
        }
      }
    }

    const buyNow = () => {
      alert('立即购买功能开发中...')
    }

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
      productModelConfig,
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
  padding-top: 60px;
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
  /* 🔥 优化7：无图片时容器也能正常显示 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  display: block;
}

/* 🔥 新增：无图片占位样式 */
.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  text-align: center;
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
  max-height: 80px;
  scrollbar-width: thin;
}

.thumbnails::-webkit-scrollbar {
  height: 4px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 2px;
}

.thumbnail-container {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f8f8f8;
  flex-shrink: 0;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.thumbnail.active {
  border: 2px solid #409EFF;
}

.product-info {
  width: 50%;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  display: flex;
  align-items: center;
  font-size: 24px;
  margin-bottom: 5px;
}

.product-count {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
}

.product-model-config {
  font-size: 16px;
  color: #666;
  margin: 8px 0;
  padding: 6px 10px;
  background-color: #fdfdfd;
  border-left: 3px solid #409EFF;
  border-radius: 2px;
  width: 70%;
  text-align: left;
}

.config-label {
  font-weight: bold;
  color: #333;
  margin-right: 4px;
}

.config-value {
  display: inline-block;
  text-align: left;
  word-wrap: break-word;
}

.product-price {
  display: flex;
  font-weight: bold;
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
  align-items: center;
}

.extra-price-note {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
  font-weight: normal;
}

.product-back {
  background-color: #fbfbfb;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #ff5356;
  width: 70%;
}

.extra-price-config {
  margin: 15px 0;
  padding: 10px;
  background-color: #f9fdff;
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
  border: 2px solid #888;
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
  width: 70%;
}

.add-to-cart-btn,.buy-now-btn {
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
  max-width: 200px;
  min-width: 120px;
  text-align: center;
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

.product-description {
  color: #555;
  font-style: italic;
  font-size: 14px;
  margin-top: 10px;
  line-height: 1.5;
  text-align: left
}

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

  .image-container {
    aspect-ratio: 1/1;
  }
  .thumbnail-container {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  .extra-price-config {
    width: 100%;
  }
  .product-back {
    width: 100%;
  }
  .product-model-config {
    width: 100%;
    text-align: left;
  }
}
</style>