import { createRouter, createWebHistory } from 'vue-router'
import Landing from './views/Landing.vue'

// Single-page marketing site. The dashboard + domain-detail + DNS-setup
// views moved to my.lisaos.dev/domains — search "Add" buttons deep
// into that flow. Any path that isn't `/` redirects home so bookmarked
// /dashboard links from the pre-split era land gracefully.
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Landing },
    { path: '/:catchAll(.*)', redirect: '/' },
  ],
})
