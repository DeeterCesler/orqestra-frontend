import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home.vue';
import ConsentView from '../views/ConsentView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/authorize',
    name: 'consent',
    component: ConsentView
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
