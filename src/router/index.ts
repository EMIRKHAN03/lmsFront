import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';
import ResetPasswordForm from '@/components/ResetPasswordForm.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/reset-password/:uuid',
    name: 'ResetPassword',
    component: ResetPasswordForm
  },
  // Add your protected routes here with navigation guards
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/instructor',
    name: 'Instructor',
    component: () => import('@/views/InstructorView.vue'),
    meta: { requiresAuth: true, role: 'INSTRUCTOR' }
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('@/views/StudentView.vue'),
    meta: { requiresAuth: true, role: 'STUDENT' }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation guard for auth routes
router.beforeEach((to, _, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const userRole = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).role : null;
  
  if (requiresAuth && !localStorage.getItem('token')) {
    next('/login');
  } else if (requiresAuth && to.meta.role && to.meta.role !== userRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'ADMIN') next('/admin');
    else if (userRole === 'INSTRUCTOR') next('/instructor');
    else if (userRole === 'STUDENT') next('/student');
    else next('/login');
  } else {
    next();
  }
});

export default router;