import { createRouter, createWebHistory } from 'vue-router'
import StoreApp from '@/components/StoreApp.vue'
import ProductDetail from '@/components/ProductDetail.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'
import Login from '@/components/Login.vue'

const routes = [
  { path: '/', name: 'Home', component: StoreApp },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail, props: true },
  { path: '/cart', name: 'ShoppingCart', component: ShoppingCart, props: true },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router