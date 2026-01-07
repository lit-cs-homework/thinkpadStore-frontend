<template>
  <div class="page">
    <AppHeader />

    <main class="container">
      <h1 class="title">个人信息</h1>

      <section class="card">
        <div class="card-title">账号信息</div>
        <div class="info-row">
          <span class="label">用户名称</span>
          <span class="value">{{ userNameDisplay }}</span>
        </div>
        <div class="info-row">
          <span class="label">用户邮箱</span>
          <span class="value">{{ userEmailDisplay }}</span>
        </div>

        <div v-if="!isLoggedIn" class="hint">
          当前未登录，部分信息不可用。
          <button class="link-btn" @click="goLogin">去登录</button>
        </div>
      </section>

      <section class="card">
        <div class="card-title">购物车状态</div>

        <div v-if="cartLoading" class="state">加载购物车中...</div>
        <div v-else-if="cartError" class="state error">
          {{ cartError }}
          <button class="btn" @click="loadCart">重试</button>
        </div>
        <div v-else>
          <div v-if="cartItems.length === 0" class="empty-cart">
            <img :src="emptyCartIcon" alt="空购物车" class="empty-icon" />
            <div class="empty-text">您的购物车还是空的</div>
            <button class="btn" @click="goHome">去逛逛</button>
          </div>

          <div v-else class="cart-summary">
            <div class="summary-line">
              <span>商品数量：</span><b>{{ cartItems.length }}</b>
            </div>
            <div class="summary-line">
              <span>合计：</span><b class="price">¥ {{ cartTotalPrice.toFixed(2) }}</b>
            </div>

            <div class="thumbs" aria-label="购物车商品图片">
              <img
                v-for="item in cartItemsPreview"
                :key="item.id"
                class="thumb"
                :src="item.image || fallbackProductImage"
                :alt="item.name"
              />
              <div v-if="cartItems.length > cartPreviewLimit" class="more">+{{ cartItems.length - cartPreviewLimit }}</div>
            </div>

            <div class="actions">
              <button class="btn" @click="goCart">查看购物车</button>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-title">历史订单</div>

        <div v-if="orders.length === 0" class="state">暂无历史订单</div>
        <div v-else class="orders">
          <div v-for="order in orders" :key="order.id" class="order">
            <div class="order-header">
              <div class="order-id">订单号：{{ order.id }}</div>
              <div class="order-status">{{ order.status || '已提交' }}</div>
            </div>

            <div class="order-meta">
              <span v-if="order.createdAt">时间：{{ formatDate(order.createdAt) }}</span>
              <span v-if="order.total != null">合计：<b class="price">¥ {{ Number(order.total).toFixed(2) }}</b></span>
            </div>

            <div v-if="order.items && order.items.length" class="thumbs" aria-label="订单商品图片">
              <img
                v-for="(it, idx) in order.items.slice(0, cartPreviewLimit)"
                :key="it.id || idx"
                class="thumb"
                :src="it.image || fallbackProductImage"
                :alt="it.name || '商品'"
              />
              <div v-if="order.items.length > cartPreviewLimit" class="more">+{{ order.items.length - cartPreviewLimit }}</div>
            </div>
          </div>
        </div>

        <div class="hint">
         
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import { cartService, productService, userService } from '@/services/api'
import fallbackProductImage from '@/assets/logo.png'
import emptyCartIcon from '@/assets/shopping-cart.svg'

export default {
  name: 'ProfilePage',
  components: { AppHeader },
  setup() {
    const router = useRouter()

    // ===== 用户信息 =====
    const userInfo = ref(null)

    const loadUserInfo = () => {
      try {
        const raw = localStorage.getItem('user_info')
        userInfo.value = raw ? JSON.parse(raw) : null
      } catch {
        userInfo.value = null
      }
    }

    const isLoggedIn = computed(() => {
      return Boolean(localStorage.getItem('auth_token')) && Boolean(userInfo.value?.username)
    })

    const userNameDisplay = computed(() => {
      return userInfo.value?.username || '未登录'
    })

    const userEmailDisplay = computed(() => {
      return userInfo.value?.email || '未绑定/未知'
    })

    const loadRemoteUserInfo = async () => {
      // 未登录或缺少用户名时不请求
      const token = localStorage.getItem('auth_token')
      const username = userInfo.value?.username
      if (!token || !username) return

      // 已经有 email 和 id 的情况就不重复请求
      if (userInfo.value?.email && userInfo.value?.id) return

      try {
        const list = await userService.getAll()
        const users = Array.isArray(list) ? list : (Array.isArray(list?.results) ? list.results : [])
        const matched = users.find(u => u?.username === username)
        if (!matched) return

        userInfo.value = {
          ...(userInfo.value || {}),
          id: matched.id,
          email: matched.email
        }
        localStorage.setItem('user_info', JSON.stringify(userInfo.value))
      } catch {
        // 静默失败：不影响页面其它信息展示
      }
    }

    // ===== 购物车 =====
    const cartState = inject('cartState', { items: [] })
    const cartItems = ref([])
    const cartLoading = ref(false)
    const cartError = ref('')

    const cartTotalPrice = computed(() => {
      return (cartItems.value || []).reduce((sum, item) => {
        const itemTotal = item.total_price ? Number(item.total_price) : Number(item.price || 0) * Number(item.quantity || 1)
        return sum + (Number.isFinite(itemTotal) ? itemTotal : 0)
      }, 0)
    })

    const cartPreviewLimit = 6
    const cartItemsPreview = computed(() => (cartItems.value || []).slice(0, cartPreviewLimit))

    const normalizeCartItemsFromApi = async (response) => {
      let cartItemsRaw = []
      if (Array.isArray(response)) cartItemsRaw = response
      else if (response?.data && Array.isArray(response.data)) cartItemsRaw = response.data
      else if (response?.results && Array.isArray(response.results)) cartItemsRaw = response.results

      if (!cartItemsRaw.length) return []

      // 如果后端只返回 product id，则补齐商品信息
      return Promise.all(
        cartItemsRaw.map(async (item) => {
          const productId = item.product || item.product_id
          if (!productId) {
            return {
              id: item.id,
              name: item.product_name || '未知商品',
              image: item.image,
              price: Number(item.price || 0),
              quantity: Number(item.quantity || 1),
              total_price: item.total_price
            }
          }

          try {
            const productDetails = await productService.getById(productId)
            return {
              id: item.id,
              name: productDetails?.name || item.product_name || '未知商品',
              image: productDetails?.image || item.image,
              price: Number(productDetails?.price || item.price || 0),
              quantity: Number(item.quantity || 1),
              product: productId,
              total_price: item.total_price
            }
          } catch {
            return {
              id: item.id,
              name: item.product_name || '商品详情获取失败',
              image: item.image,
              price: Number(item.price || 0),
              quantity: Number(item.quantity || 1),
              product: productId,
              total_price: item.total_price
            }
          }
        })
      )
    }

    const loadCart = async () => {
      cartError.value = ''

      // 优先使用全局状态
      if (cartState?.items && Array.isArray(cartState.items) && cartState.items.length > 0) {
        cartItems.value = [...cartState.items]
        return
      }

      // 没登录则不强拉接口
      if (!localStorage.getItem('auth_token')) {
        cartItems.value = []
        return
      }

      cartLoading.value = true
      try {
        const response = await cartService.getAll()
        const normalized = await normalizeCartItemsFromApi(response)
        cartItems.value = normalized
        // 同步到全局状态，方便 header 徽标等使用
        if (cartState) cartState.items = [...normalized]
      } catch (e) {
        cartError.value = '加载购物车失败，请稍后重试'
        cartItems.value = []
      } finally {
        cartLoading.value = false
      }
    }

    // ===== 订单（当前项目未接入订单接口，先从 localStorage 读） =====
    const orders = ref([])

    const loadOrders = () => {
      const keys = ['order_history', 'orders', 'orderHistory']
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key)
          if (!raw) continue
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            orders.value = parsed
            return
          }
        } catch {
          // ignore
        }
      }
      orders.value = []
    }

    const formatDate = (value) => {
      try {
        const d = new Date(value)
        if (Number.isNaN(d.getTime())) return String(value)
        return d.toLocaleString()
      } catch {
        return String(value)
      }
    }

    const goHome = () => router.push('/')
    const goCart = () => router.push('/cart')
    const goLogin = () => router.push('/login')

    onMounted(async () => {
      loadUserInfo()
      loadOrders()
      await loadRemoteUserInfo()
      await loadCart()
    })

    return {
      // assets
      fallbackProductImage,
      emptyCartIcon,

      // user
      isLoggedIn,
      userNameDisplay,
      userEmailDisplay,
      loadRemoteUserInfo,
      goLogin,

      // cart
      cartItems,
      cartItemsPreview,
      cartPreviewLimit,
      cartTotalPrice,
      cartLoading,
      cartError,
      loadCart,
      goCart,
      goHome,

      // orders
      orders,
      formatDate
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

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
  text-align: left;
}

.title {
  margin: 12px 0 16px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 14px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
}

.value {
  color: #111;
  font-weight: 600;
}

.hint {
  margin-top: 12px;
  color: #777;
  font-size: 13px;
  line-height: 1.6;
}

.state {
  padding: 18px 0;
  color: #666;
}

.error {
  color: #f56c6c;
}

.btn {
  margin-top: 10px;
  padding: 8px 14px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  background: #66b1ff;
}

.link-btn {
  margin-left: 8px;
  border: none;
  background: transparent;
  color: #409eff;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
}

.empty-icon {
  width: 90px;
  height: 90px;
  object-fit: contain;
}

.empty-text {
  color: #666;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  color: #333;
}

.price {
  color: #c81f1f;
}

.thumbs {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.thumb {
  width: 54px;
  height: 54px;
  border: 1px solid #eee;
  border-radius: 8px;
  object-fit: contain;
  background: #fff;
}

.more {
  min-width: 54px;
  height: 54px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 13px;
}

.actions {
  margin-top: 6px;
}

.orders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.order-id {
  font-weight: 700;
  color: #222;
}

.order-status {
  color: #666;
}

.order-meta {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #666;
  font-size: 13px;
}

@media (max-width: 640px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .order-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
