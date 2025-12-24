<template>
  <div
    class="cart-container"
    :class="{
      'cart-page': !isSidebar,
      'cart-sidebar': isSidebar,
      'show': isSidebar && cartState.isVisible
    }"
  >
    <!-- 页面模式：显示完整的头部导航 -->
    <AppHeader v-if="!isSidebar" />

    <!-- 侧边栏模式：显示购物车头部和关闭按钮 -->
    <div v-if="isSidebar" class="cart-header">
      <h3>购物车</h3>
      <button class="close-btn" @click="$emit('close')">&times;</button>
    </div>

    <!-- 购物车内容区域 -->
    <main class="cart-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">加载购物车中...</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadCartItems" class="retry-btn">重新加载</button>
      </div>

      <!-- 购物车为空时的显示 -->
      <div v-else-if="!hasItems" class="empty-cart">
        <img src="@/assets/logo.png" alt="空购物车" class="empty-cart-image" />
        <p>您的购物车还是空的</p>
        <button class="continue-shopping-btn" @click="closeCartAndGoHome">
          继续购物
        </button>
      </div>

      <!-- 购物车有商品时的显示 -->
      <div v-else class="cart-items">
        <div v-for="item in (localCartItems.length > 0 ? localCartItems : cartState.items)" :key="item.id" class="cart-item">
          <div class="item-image" @click="goToProduct(item.product)">
            <img :src="item.image || '@/assets/logo.png'" :alt="item.name" />
          </div>
          <div class="item-info">
            <h4 class="item-name" @click="goToProduct(item.product)">{{ item.name }}</h4>
            <p class="item-price">¥{{ item.price }}</p>
            <div class="item-quantity">
              <button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="quantity-btn" @click="increaseQuantity(item)">+</button>
            </div>
          </div>
          <div class="item-total">
            <p>¥{{ item.total_price || (item.price * item.quantity).toFixed(2) }}</p>
            <button class="remove-btn" @click="removeItem(item.id)">删除</button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>总计：</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <button class="checkout-btn" @click="checkout">结算</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { inject, ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { cartService, productService } from '@/services/api'

export default {
  name: 'ShoppingCart',
  components: {
    AppHeader
  },
  props: {
    isSidebar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'item-added', 'item-removed', 'quantity-changed'],
  setup(props, { emit }) {
    const router = useRouter()

    // 注入购物车状态
    const cartState = inject('cartState', { items: [] })

    // 本地购物车数据，用于实时响应
    const localCartItems = ref([])

    // 添加加载状态
    const loading = ref(true)
    const error = ref(null)

    // 计算属性
    const hasItems = computed(() => {
      return (localCartItems.value && localCartItems.value.length > 0) ||
             (cartState.items && Array.isArray(cartState.items) && cartState.items.length > 0)
    })

    const totalPrice = computed(() => {
      const items = localCartItems.value.length > 0 ? localCartItems.value : cartState.items
      return (items || []).reduce((total, item) => {
        // 优先使用后端返回的total_price，否则使用本地计算
        const itemTotal = item.total_price ? parseFloat(item.total_price) : (item.price * item.quantity)
        return total + itemTotal
      }, 0)
    })

    // 加载购物车数据
    const loadCartItems = async () => {
      // 首先检查是否有全局状态数据
      if (cartState.items && cartState.items.length > 0) {
        localCartItems.value = [...cartState.items]
        loading.value = false
        error.value = null
        console.log('直接使用全局状态数据，数量:', localCartItems.value.length)
        return
      }

      // 如果没有全局状态数据，尝试从API加载
      loading.value = true
      error.value = null

      try {
        console.log('从API加载购物车数据...')
        const response = await cartService.getAll()
        console.log('API响应:', response)

        // 根据API返回的数据结构调整
        let cartItems = []

        if (Array.isArray(response)) {
          cartItems = response
          console.log('检测到数组格式，数量:', response.length)
        } else if (response.data && Array.isArray(response.data)) {
          cartItems = response.data
          console.log('检测到data格式，数量:', response.data.length)
        } else if (response.results && Array.isArray(response.results)) {
          cartItems = response.results
          console.log('检测到results格式，数量:', response.results.length)
        } else {
          console.warn('未知的响应格式:', response)
        }

        if (cartItems.length > 0) {
          // 对于每个购物车项，获取产品详细信息
          localCartItems.value = await Promise.all(
            cartItems.map(async (item) => {
              try {
                // 获取产品详情
                const productDetails = await productService.getById(item.product)
                return {
                  id: item.id,
                  name: productDetails.name || '未知商品',
                  price: parseFloat(productDetails.price || 0),
                  image: productDetails.image || '@/assets/logo.png',
                  quantity: item.quantity || 1,
                  product: item.product,
                  total_price: item.total_price || (parseFloat(productDetails.price || 0) * item.quantity).toFixed(2)
                }
              } catch (productError) {
                console.warn(`获取产品ID ${item.product} 详情失败:`, productError)
                // 如果获取产品详情失败，返回基本信息
                return {
                  id: item.id,
                  name: '商品详情获取失败',
                  price: 0,
                  image: '@/assets/logo.png',
                  quantity: item.quantity || 1,
                  product: item.product,
                  total_price: item.total_price || '0.00'
                }
              }
            })
          )
          console.log('标准化后的购物车数据:', localCartItems.value)

          // 更新全局状态，保持数据同步
          cartState.items = [...localCartItems.value]
        } else {
          console.log('API返回空数据，显示空购物车')
        }

      } catch (err) {
        console.error('加载购物车失败:', err)
        error.value = '加载购物车失败，请稍后重试'
        localCartItems.value = []
      } finally {
        loading.value = false
      }
    }

    // 添加商品到购物车
    const addToCart = async (product) => {
      try {
        const cartItem = {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        }

        await cartService.create(cartItem)
        await loadCartItems() // 重新加载购物车
        emit('item-added', cartItem)
      } catch (error) {
        console.error('添加到购物车失败:', error)
      }
    }

    // 增加商品数量
    const increaseQuantity = async (item) => {
      if (item.quantity >= 10) {
        alert('最多只能购买10件商品')
        return
      }

      try {
        await cartService.partialUpdate(item.id, { quantity: item.quantity + 1 })

        // 更新本地状态
        item.quantity += 1

        // 重新计算总价
        const newTotalPrice = (parseFloat(item.price) * item.quantity).toFixed(2)
        item.total_price = newTotalPrice

        // 同时更新localCartItems和cartState中的数据
        const localIndex = localCartItems.value.findIndex(i => i.id === item.id)
        const globalIndex = cartState.items.findIndex(i => i.id === item.id)

        if (localIndex !== -1) {
          localCartItems.value[localIndex].quantity = item.quantity
          localCartItems.value[localIndex].total_price = newTotalPrice
        }
        if (globalIndex !== -1) {
          cartState.items[globalIndex].quantity = item.quantity
          cartState.items[globalIndex].total_price = newTotalPrice
        }

        emit('quantity-changed', item)
      } catch (error) {
        console.error('更新数量失败:', error)
        alert('更新数量失败，请重试')
      }
    }

    // 减少商品数量
    const decreaseQuantity = async (item) => {
      if (item.quantity <= 1) {
        alert('最少需要购买1件商品')
        return
      }

      try {
        await cartService.partialUpdate(item.id, { quantity: item.quantity - 1 })

        // 更新本地状态
        item.quantity -= 1

        // 重新计算总价
        const newTotalPrice = (parseFloat(item.price) * item.quantity).toFixed(2)
        item.total_price = newTotalPrice

        // 同时更新localCartItems和cartState中的数据
        const localIndex = localCartItems.value.findIndex(i => i.id === item.id)
        const globalIndex = cartState.items.findIndex(i => i.id === item.id)

        if (localIndex !== -1) {
          localCartItems.value[localIndex].quantity = item.quantity
          localCartItems.value[localIndex].total_price = newTotalPrice
        }
        if (globalIndex !== -1) {
          cartState.items[globalIndex].quantity = item.quantity
          cartState.items[globalIndex].total_price = newTotalPrice
        }

        emit('quantity-changed', item)
      } catch (error) {
        console.error('更新数量失败:', error)
        alert('更新数量失败，请重试')
      }
    }

    // 删除购物车项
    const removeItem = async (itemId) => {
      if (!confirm('确定要删除这个商品吗？')) {
        return
      }

      try {
        await cartService.delete(itemId)

        // 更新本地状态
        localCartItems.value = localCartItems.value.filter(item => item.id !== itemId)
        cartState.items = cartState.items.filter(item => item.id !== itemId)

        emit('item-removed', itemId)
        alert('商品已从购物车中删除')
      } catch (error) {
        console.error('删除购物车项失败:', error)
        alert('删除失败，请重试')
      }
    }

    // 跳转到商品详情页
    const goToProduct = (productId) => {
      if (props.isSidebar) {
        emit('close')
      }
      router.push(`/product/${productId}`)
    }

    // 结算
    const checkout = () => {
      if (props.isSidebar) {
        emit('close')
      }
      router.push('/checkout')
    }

    // 关闭购物车并跳转到首页
    const closeCartAndGoHome = () => {
      if (props.isSidebar) {
        emit('close')
      } else {
        router.push('/')
      }
    }

    // 监听购物车状态变化，确保本地数据与全局状态同步
    watch(() => cartState.items, (newItems) => {
      if (newItems && newItems.length !== localCartItems.value.length) {
        // 如果全局状态的长度与本地状态不同，重新加载数据
        loadCartItems()
      }
    }, { deep: true })

    // 组件挂载时加载购物车数据
    onMounted(() => {
      // 如果已有全局状态数据，直接使用
      if (cartState.items && cartState.items.length > 0) {
        localCartItems.value = [...cartState.items]
        loading.value = false
        console.log('组件挂载，使用现有全局状态数据，数量:', localCartItems.value.length)
      } else {
        // 否则尝试从API加载
        loadCartItems()

        // 设置一个安全超时，确保不会一直显示加载状态
        setTimeout(() => {
          if (loading.value) {
            console.log('安全超时：停止加载状态，显示空购物车')
            loading.value = false
            error.value = null
          }
        }, 8000) // 8秒超时
      }
    })

    return {
      cartState,
      localCartItems,
      hasItems,
      totalPrice,
      loading,
      error,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      goToProduct,
      checkout,
      closeCartAndGoHome,
      loadCartItems
    }
  }
}
</script>

<style scoped>
.cart-container {
  background-color: #fff;
}

/* 页面模式样式 */
.cart-page {
  min-height: 100vh;
  padding: 20px;
}

/* 侧边栏模式样式 */
.cart-sidebar {
  position: fixed;
  top: 60px; /* AppHeader高度 */
  right: 0;
  width: 50%;
  height: calc(100vh - 60px);
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  opacity: 0;
}

.cart-sidebar.show {
  transform: translateX(0);
  opacity: 1;
}

/* 购物车头部（侧边栏模式） */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.cart-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 5px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #333;
}

/* 购物车内容区域 */
.cart-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 加载和错误状态样式 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 200px;
  text-align: center;
}

.loading-spinner {
  font-size: 16px;
  color: #666;
  padding: 20px;
}

.error-state p {
  font-size: 16px;
  color: #f56c6c;
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
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #66b1ff;
}

/* 空购物车状态 */
.empty-cart {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.empty-cart-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-cart p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
}

.continue-shopping-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.continue-shopping-btn:hover {
  background-color: #0056b3;
}

/* 购物车商品列表 */
.cart-items {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  cursor: pointer;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  margin: 0 0 5px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}

.item-name:hover {
  color: #007bff;
}

.item-price {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.quantity-btn:hover {
  background-color: #f0f0f0;
}

.quantity {
  font-size: 1rem;
  min-width: 30px;
  text-align: center;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  text-align: right;
}

.item-total p {
  margin: 0;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #c82333;
}

/* 购物车总结 */
.cart-summary {
  margin-top: 20px;
  padding: 20px;
  border-top: 2px solid #eee;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
}

.total-price {
  color: #007bff;
  font-size: 1.3rem;
}

.checkout-btn {
  width: 100%;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background-color: #218838;
}

/* 页面模式下的内容区域 */
.cart-page .cart-content {
  margin-top: 60px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-sidebar {
    width: 80%;
  }

  .cart-header {
    padding: 15px;
  }

  .cart-header h3 {
    font-size: 1.1rem;
  }

  .empty-cart-image {
    width: 80px;
    height: 80px;
  }

  .empty-cart p {
    font-size: 1rem;
  }

  .continue-shopping-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-image {
    margin-right: 0;
    margin-bottom: 10px;
    align-self: center;
  }

  .item-total {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .cart-sidebar {
    width: 90%;
  }

  .cart-header {
    padding: 10px;
  }

  .empty-cart {
    padding: 20px 10px;
  }

  .cart-item {
    padding: 10px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }
}
</style>