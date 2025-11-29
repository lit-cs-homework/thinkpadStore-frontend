<template>
  <div class="product-page">
    <header>
      <AppHeader/>
    </header>
    <main class="detail-content">
      <div class="product-detail">
        <div class="product-images">
          <img :src="productImages[currentIndex]" class="image" alt="Product Image" @click="toggleImageZoom">
          <div class="thumbnails">
            <img 
              v-for="(image, index) in productImages" 
              :key="index" 
              :src="image" 
              class="thumbnail" 
              :class="{ active: currentIndex === index }" 
              @click="switchImage(index)"
            />
          </div>
        </div>
        <div class="product-info">
          <div class="product-title">
            <h2>{{ productName }}</h2>
            <span class="product-count">数量: {{ quantity }}</span>
          </div>
          <div class = "product-back">
              <div class="product-price">价格: ¥5699</div>
          </div>
          <div class="quantity-control">
            <button @click="decreaseQuantity">-</button>
            <span>{{ quantity }}</span>
            <button @click="increaseQuantity">+</button>
          </div>
          <el-button type="primary" class="buy-button" @click="addToCart">立即购买</el-button>
        </div>
      </div>
      <div v-if="isZoomed" class="zoom-overlay" @click="toggleImageZoom">
        <img :src="productImages[currentIndex]" class="zoomed-image" alt="Zoomed Product Image">
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue'
import logo from '@/assets/logo.png'
import logo1 from '@/assets/ouc.png'

export default {
  name: 'ProductDetail',
  components: { AppHeader },
  data() {
    return {
      productName: 'ThinkPad T14p 2023',
      productImages: [
        logo,
        logo1,
        logo,
        logo,
        logo,
      ],
      currentIndex: 0,
      isZoomed: false,
      quantity: 1 // 添加购买数量的初始值
    }
  },
  methods: {
    switchImage(index) {
      this.currentIndex = index;
      this.isZoomed = false; // Ensure zoom is off when switching images
    },
    toggleImageZoom() {
      this.isZoomed = !this.isZoomed;
    },
    increaseQuantity() {
      if (this.quantity < 10) { // 限制最大购买数量为10
        this.quantity++;
      }
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    addToCart() {
      alert(`商品已添加到购物车，数量：${this.quantity}`);
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

/*产品图片*/
.product-images {
  width: 25%; /* 控制产品图片的大小 */
  padding-right: 2%; 
  position: relative;
  margin-left: 150px;
}
.image {
  width: 100%;
  height: auto;
  object-fit: cover;
  cursor: pointer;
  box-shadow: 0 0 10px #d6d5d5;
  border: 2px solid #ababab; /* 添加边框 */
  border-radius: 4px; /* 可选：添加圆角 */
}

/*缩略图容器*/
.thumbnails {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  margin-top: 10px;
  box-shadow: 0 0 10px #d6d5d5;
  border: 2px solid #ababab; /* 可选：添加顶部边框 */
  border-radius: 4px;
}

.thumbnail {
  width: 15%; /* 可以根据需要调整 */
  margin-right: 5px; /* 添加右边距 */
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px; /* 可选：添加圆角 */
  background-color: #f8f8f8f8; /* 可选：添加背景色 */
}
.thumbnail:last-child {
  margin-right: 0; 
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
  }
  .thumbnails {
    justify-content: center;
  }
}
</style>