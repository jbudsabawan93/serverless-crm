import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../auth'
import CustomerForm from '../components/form/CustomerForm.vue'
import OrderForm from '../components/form/OrderForm.vue'
import ProductForm from '../components/form/ProductForm.vue'
import Customers from '../views/Customers.vue'
import EditCustomer from '../views/EditCustomer.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Order from '../views/Orders.vue'
import Products from '../views/Products.vue'
import EditProduct from '../views/EditProduct.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guest: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/customers',
      name: 'customers',
      component: Customers
    },
    {
      path: '/customers/add',
      name: 'add-customer',
      component: CustomerForm
    },
    {
      path: '/customers/edit/:id',
      name: 'edit-customer',
      component: EditCustomer
    },
    {
      path: '/orders',
      name: 'orders',
      component: Order
    },
    {
      path: '/orders/add',
      name: 'add-order',
      component: OrderForm
    },
    {
      path: '/orders/edit/:id',
      name: 'edit-order',
      component: () => import('../views/EditOrder.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: Products
    },
    {
      path: '/products/add',
      name: 'add-prodcut',
      component: ProductForm
    },
    {
      path: '/products/edit/:id',
      name: 'edit-product',
      component: EditProduct
    }
  ]
})

router.beforeEach((to) => {
  const loggedIn = isAuthenticated()
  if (to.meta.guest) {
    return loggedIn ? { name: 'dashboard' } : true
  }
  return loggedIn ? true : { name: 'login' }
})

export default router 