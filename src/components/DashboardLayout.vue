<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { logout } from '../auth'

import dashboardIcon from '../assets/dashboard.svg';
import customersIcon from '../assets/customers.svg';
import ordersIcon from '../assets/orders.svg';
import productsIcon from '../assets/products.svg';

const isSidebarOpen = ref(true)
const route = useRoute()
const router = useRouter()

const handleLogout = () => {
  logout()
  router.push({ name: 'login' })
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: dashboardIcon,
    path: '/'
  },
  {
    title: 'Products',
    icon: productsIcon,
    path: '/products'
  },
  {
    title: 'Customers',
    icon: customersIcon,
    path: '/customers'
  },
  {
    title: 'Orders',
    icon: ordersIcon,
    path: '/orders'
  }
];
</script>

<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-closed': !isSidebarOpen }">
      <div class="sidebar-header">
        <h2>
          <img src="../assets/logo.png" alt="CRM managment" class="logo">
          <span class="brand-text">CRM managment</span>
        </h2>
      </div>
      
      <nav class="sidebar-nav">
        <div v-for="item in menuItems" :key="item.path" class="nav-item-container">
          <RouterLink 
            :to="item.path"
            class="nav-item"
            :class="{ 'active': route.path === item.path }"
          >
            <img :src="item.icon" :alt="item.title" class="menu-icon" />
            <span class="nav-title">{{ item.title }}</span>
          </RouterLink>
          
        </div>
      </nav>

      <div class="sidebar-footer">
        <button type="button" class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span class="nav-title">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'content-expanded': !isSidebarOpen }">
      
      <div class="content">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #1E2D40;
  color: #ffffff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-closed {
  width: 60px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.25;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-header .logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-text {
  white-space: normal;
}

.sidebar-closed .brand-text {
  display: none;
}

.toggle-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  font-size: 1rem;
}

.sidebar-nav {
  padding: 12px 0;
  font-size: 0.95rem;
  flex: 1;
}

.sidebar-footer {
  padding: 16px 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  text-align: left;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: transparent;
}

.nav-item-container {
  position: relative;
}

.nav-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.86);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.menu-icon {
  width: 22px;
  height: 22px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: #fff;
  background-color: #4382D0;
}

.nav-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.nav-title {
  white-space: nowrap;
}

.sidebar-closed .nav-title {
  display: none;
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  background-color: #f3f5f8;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.content-expanded {
  margin-left: -190px;
}

.main-header {
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.content {
  flex: 1;
  min-height: 0;
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
}

.submenu {
  display: block;
  background-color: #2A3B52;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.nav-item-container:hover .submenu {
  max-height: 200px;
  transition: max-height 0.3s ease-in;
}

.submenu-item {
  display: block;
  padding: 20px 20px 20px 60px;
  font-size: 18px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(-10px);
}

.nav-item-container:hover .submenu-item {
  opacity: 1;
  transform: translateY(0);
}

.submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.submenu-item.active {
  background-color: #4382D0;
}

.sidebar-closed .submenu {
  display: none;
}
</style> 