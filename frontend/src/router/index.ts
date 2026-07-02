// frontend/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

// 1. IMPORT TOÀN BỘ CÁC TRANG (VIEWS) ĐÃ CHUYỂN ĐỔI SANG VUE
import HomeView from '../views/HomeView.vue';
import AuthView from '../views/AuthView.vue';
import AboutView from '../views/AboutView.vue';
import NewsView from '../views/NewsView.vue';
import RulesView from '../views/RulesView.vue';
import ContactView from '../views/ContactView.vue';
import BookingView from '../views/BookingView.vue';

// IMPORT CÁC TRANG QUẢN TRỊ & PORTAL
import AdminPortal from '../views/AdminPortal.vue';
import StaffPortal from '../views/StaffPortal.vue';
import StudentPortal from '../views/StudentPortal.vue';

const router = createRouter({
  history: createWebHistory(),
  // Cuộn trang lên trên cùng mỗi khi chuyển route
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    // --- NHÓM TRANG CÔNG KHAI (PUBLIC) ---
    { 
      path: '/', 
      name: 'Home',
      component: HomeView 
    },
    { 
      path: '/auth', 
      name: 'Auth',
      component: AuthView 
    },
    { 
      path: '/about', 
      name: 'About',
      component: AboutView 
    },
    { 
      path: '/news', 
      name: 'News',
      component: NewsView 
    },
    { 
      path: '/rules', 
      name: 'Rules',
      component: RulesView 
    },
    { 
      path: '/contact', 
      name: 'Contact',
      component: ContactView 
    },
    { 
      path: '/booking', 
      name: 'Booking',
      component: BookingView
    },

    // --- NHÓM TRANG NỘI BỘ (PRIVATE PORTALS) ---
    { 
      path: '/admin', 
      name: 'AdminPortal',
      component: AdminPortal 
    },
    { 
      path: '/staff', 
      name: 'StaffPortal',
      component: StaffPortal 
    },
    { 
      path: '/student', 
      name: 'StudentPortal',
      component: StudentPortal 
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const cachedUser = localStorage.getItem('current_user');
    if (!cachedUser) {
      alert('Vui lòng đăng nhập để đăng ký phòng!');
      next('/auth');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;