<template>
  <div class="product-page">
    <header>
      <AppHeader/>
    </header>
    <main class="detail-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="error">
        {{ error }}
        <button @click="fetchProductDetail" class="retry-btn">重试</button>
      </div>
      
      <div v-if="!loading && !error" class="product-detail">
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
            <h2>{{ productName }}</h2>
            <span class="product-count">数量: {{ haveQuantity }}</span>
          </div>
          <div class="product-back">
              <div class="product-price">
              价格: ¥{{ formatPrice(Number(basePrice) + Number(selectedExtraPrice)) }}
              <span v-if="selectedExtraPrice > 0" class="extra-price-note">
                (基础¥{{ formatPrice(basePrice) }} + 额外¥{{ formatPrice(selectedExtraPrice) }})
              </span>
            </div>
          </div>

          <!-- 新增：额外价格配置选择区域 -->
          <div class="extra-price-config">
            <h4>额外配置选择</h4>
            <!-- 每行2个选项，动态分组 -->
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
          <el-button type="primary" class="buy-button" @click="addToCart">立即购买</el-button>
        </div>
      </div>
      
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
import AppHeader from './AppHeader.vue'
import logo from '@/assets/logo.png'
import { productService } from '@/services/api' // 导入API服务
import { useRoute } from 'vue-router'

export default {
  name: 'ProductDetail',
  components: { AppHeader },
  data() {
    return {
      productName: 'ThinkPad T14p 2023', // 默认名称（API加载后会替换）
      basePrice: 5699, // 基础价格（原productPrice改为basePrice）
      selectedExtraPrice: 0, // 选中的额外配置价格
      // 额外配置选项（默认值：+10、+20、+40、+60，后续可从后端获取）
      extraPrices: [
        { label: "配置1", price: 10 },
        { label: "配置2", price: 20 },
        { label: "配置3", price: 40 },
        { label: "配置4", price: 60 },
      ],
      productImages: [logo], // 初始仅保留一张默认图（动态变化）
      currentIndex: 0,
      isZoomed: false,
      haveQuantity : 0,
      quantity: 1, // 购买数量
      loading: false, // 加载状态
      error: null, // 错误信息
      defaultImage: logo // 图片加载失败时的默认图
    }
  },
  // 计算属性：将额外配置按每行2个分组
  computed: {
    extraPriceRows() {
      const rows = [];
      for (let i = 0; i < this.extraPrices.length; i += 2) {
        rows.push(this.extraPrices.slice(i, i + 2));
      }
      return rows;
    }
  },
  mounted() {
    // 组件挂载后获取商品详情
    this.fetchProductDetail()
  },
  methods: {
    // 切换图片
    switchImage(index) {
      this.currentIndex = index;
      this.isZoomed = false;
    },
    // 图片放大/缩小
    toggleImageZoom() {
      this.isZoomed = !this.isZoomed;
    },
    // 增加数量（上限改为4）
    increaseQuantity() {
      if (this.quantity < 4) {
        this.quantity++;
      }
    },
    // 减少数量
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    // 选择额外配置价格
    selectExtraPrice(price) {
      this.selectedExtraPrice = price;
    },
    // 添加到购物车
    addToCart() {
      if(this.quantity > this.haveQuantity) {
        alert('商品存货不足，请重新确定数量');
      } else {
        const totalPrice = (Number(this.basePrice) + Number(this.selectedExtraPrice)) * this.quantity;
        alert(`商品【${this.productName}】已添加到购物车，数量：${this.quantity}，总价：¥${this.formatPrice(totalPrice)}`);
      }
    },
    // 价格格式化（保留2位小数）
    formatPrice(price) {
      return Number(price).toFixed(2);
    },
    // 图片加载失败处理
    handleImageError(index) {
      this.productImages[index] = this.defaultImage;
    },
    // 获取商品详情（默认ID=0）
    async fetchProductDetail() {
      this.loading = true;
      this.error = null;
      
      try {
        const route = useRoute();
        const productId = route.params.id || 0;
        const response = await productService.getById(productId);
        const product = response || {};
        
        this.haveQuantity = Number(product.stock) || 0; // 转数值
        this.productName = product.name || '默认商品名称';
        this.basePrice = Number(product.price) || 0; // 转数值（关键：确保是数字类型）

        this.handleProductImages(product);
      } catch (err) {
        console.error('获取商品详情失败:', err);
        this.error = err.message || '加载商品详情失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },
    // 处理商品图片的逻辑抽离
    handleProductImages(product) {
      let images = [];
      if (Array.isArray(product.images) && product.images.length > 0) {
        images = product.images.filter(img => img && typeof img === 'string');
      } 
      else if (product.image) {
        images = [product.image];
      }
      if (images.length === 0) {
        images = [this.defaultImage];
      }
      this.productImages = images;
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
  /* 新增：移除默认滚动条样式（可选，优化视觉） */
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
.product-back{
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
}

.quantity-control span {
  margin: 0 10px;
  font-size: 20px;
}

.buy-button {
  background-color: #409EFF;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start; /* 确保按钮靠右对齐 */
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

.loading {
  text-align: center;
  padding: 100px;
  font-size: 18px;
  color: #666;
  width: 100%;
}

.error {
  text-align: center;
  padding: 100px;
  font-size: 18px;
  color: #f56c6c;
  width: 100%;
}

.retry-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #66b1ff;
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