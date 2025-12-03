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
      
      <!-- 商品详情（加载成功后显示） -->
      <div v-if="!loading && !error" class="product-detail">
        <div class="product-images">
          <!-- 主图：1:1比例容器 -->
          <div class="image-container">
            <img 
              :src="productImages[currentIndex]" 
              class="image" 
              alt="Product Image" 
              @click="toggleImageZoom"
              @error="handleImageError(currentIndex)"
            >
          </div>
          <div class="thumbnails">
            <!-- 缩略图：1:1比例容器 -->
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
              <div class="product-price">价格: ¥{{ formatPrice(productPrice) }}</div>
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
      productPrice: 5699, // 默认价格（API加载后会替换）
      productImages: [
        logo,
        logo,
        logo,
        logo,
        logo,
      ], // 默认图片（API加载后会替换）
      currentIndex: 0,
      isZoomed: false,
      haveQuantity : 0,
      quantity: 1, // 购买数量
      loading: false, // 加载状态
      error: null, // 错误信息
      defaultImage: logo // 图片加载失败时的默认图
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
    // 增加数量
    increaseQuantity() {
      if (this.quantity < 10) {
        this.quantity++;
      }
    },
    // 减少数量
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    // 添加到购物车
    addToCart() {
      if(this.quantity > this.haveQuantity)
      {
          alert('商品存货不足，请重新确定数量');
      } 
      else
      {
        alert(`商品【${this.productName}】已添加到购物车，数量：${this.quantity}`);
      }
    },
    // 价格格式化（保留2位小数）
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
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
        // 从路由获取商品ID，没有则使用默认ID=0
        const route = useRoute();
        const productId = route.params.id || 0;
        
        const response = await productService.getById(productId);
        
        const product = response || {};
        
        this.haveQuantity = product.stock;
        this.productName = product.name; // 商品名称
        this.productPrice = product.price; // 商品价格
        
        if (Array.isArray(product.images) && product.images.length > 0) {
          this.productImages = [...product.images];
          while (this.productImages.length < 5) {
            this.productImages.push(this.defaultImage);
          }
        } else if (product.image) {
          this.productImages = [
            product.image,
            product.image,
            product.image,
            product.image,
            product.image
          ];
        }
        
      } catch (err) {
        console.error('获取商品详情失败:', err);
        this.error = err.message || '加载商品详情失败，请稍后重试';
      } finally {
        this.loading = false;
      }
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

.product-images {
  width: 25%; /* 控制产品图片区域的宽度 */
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
  object-fit: cover; /* 裁剪多余部分，保持比例 */
  cursor: pointer;
  display: block;
}

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
}

.thumbnail-container {
  width: 15%; /* 控制每个缩略图的宽度占比 */
  aspect-ratio: 1/1; /* 1:1比例 */
  overflow: hidden;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 裁剪多余部分，保持比例 */
  cursor: pointer;
  border: 2px solid transparent;
  display: block;
}

.thumbnail.active {
  border-color: #409EFF;
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
}

.product-back{
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  width: 70%;
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
  width: 600px;/*控制显示图片的像素大小*/
  height: 600px;
  object-fit: contain;
  cursor: pointer;
}

/* 加载状态样式 */
.loading {
  text-align: center;
  padding: 100px;
  font-size: 18px;
  color: #666;
  width: 100%;
}

/* 错误状态样式 */
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
    width: 20%; /* 移动端缩略图宽度占比调整 */
    aspect-ratio: 1/1;
  }
}
</style>