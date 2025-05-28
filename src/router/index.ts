// router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';
import ResetPasswordForm from '@/components/ResetPasswordForm.vue';
import InstructorView from '@/views/InstructorView.vue';
import CourseView from '@/views/CourseView.vue';
import LessonView from '@/views/LessonView.vue';
import LessonItem from '@/components/LessonItem.vue';
import TaskView from '@/views/TaskView.vue';

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
    path: '/courses',
    name: 'Courses',
    component: InstructorView,
    meta: { requiresAuth: true }
  },
  {
    path: '/course/:id',
    name: 'CourseDetails',
    component: CourseView,
    meta: { requiresAuth: true }
  },
  {
    path: '/course/:courseId/lesson/:lessonId',
    name: 'LessonDetails',
    component: LessonView,
    meta: { requiresAuth: true }
  },
  {
    path: '/course/:courseId/lesson/:lessonId/task/:taskId',
    name: 'TaskView',
    component: TaskView,
    meta: { requiresAuth: true }
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('@/views/StudentView.vue'),
    meta: { requiresAuth: true, role: 'STUDENT' }
  },
  {
    path: '/lesson',
    name: 'lesson',
    component: LessonItem,
    meta: { requiresAuth: true }
  },
  // File Manager Routes
  {
    path: '/files',
    name: 'FileManager',
    component: () => import('@/views/FileManagerView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/files',
    name: 'AdminFiles',
    component: () => import('@/views/FileManagerView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/instructor/files',
    name: 'InstructorFiles',
    component: () => import('@/views/FileManagerView.vue'),
    meta: { requiresAuth: true, role: 'INSTRUCTOR' }
  },
  {
    path: '/student/files',
    name: 'StudentFiles',
    component: () => import('@/views/FileManagerView.vue'),
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