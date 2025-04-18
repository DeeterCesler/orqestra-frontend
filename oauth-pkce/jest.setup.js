import { config } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './src/router'

// Create a fresh router for each test
const router = createRouter({
  history: createWebHistory(),
  routes: routes || []
})

// Global config for Vue Test Utils
config.global.plugins = [router]

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    search: '',
  },
  writable: true
}) 