import { createRouter, createWebHistory } from 'vue-router'
import StoreApp from '@/components/StoreApp.vue'
import ProductDetail from '@/components/ProductDetail.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'
import RegisterUser from '@/components/RegisterUser.vue'
import Login from '@/components/Login.vue'
import Profile from '@/components/Profile.vue'

const routes = [
  { path: '/', name: 'Home', component: StoreApp },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail, props: true },
  { path: '/cart', name: 'ShoppingCart', component: ShoppingCart, props: true },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: RegisterUser },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router