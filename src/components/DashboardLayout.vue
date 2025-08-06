<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import dashboardIcon from '../assets/dashboard.svg';
import customersIcon from '../assets/customers.svg';
import ordersIcon from '../assets/orders.svg';
import productsIcon from '../assets/products.svg';

const isSidebarOpen = ref(true)
const route = useRoute()

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
        <h2><img src="../assets/logo2.png" alt="logo" class="logo">VUE CRM</h2>
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
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #1E2D40;
  color: #ffffff;
  transition: all 0.3s ease;
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
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-header .logo {
  width: 60px;
  height: 60px;
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
  padding: 20px 0;
  font-size: 1.2rem;
}

.nav-item-container {
  position: relative;
}

.nav-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 20px;
  color: #ffffff;
  text-decoration: none;
  transition: background-color 0.3s;
}

.menu-icon {
  width: 30px;
  height: 30px;
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
  background-color: #f5f5f5;
  transition: all 0.3s ease;
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
  padding: 20px;
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