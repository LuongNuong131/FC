// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import PlayersList from "../views/PlayersList.vue";
import PlayerDetail from "../views/PlayerDetail.vue";
import Attendance from "../views/Attendance.vue";
import PlayerForm from "@/components/PlayerForm.vue"; // ĐÃ SỬA: Sử dụng alias @

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/players",
    name: "PlayersList",
    component: PlayersList,
    meta: { requiresAuth: true },
  },
  {
    path: "/players/:id",
    name: "PlayerDetail",
    component: PlayerDetail,
    props: true,
    meta: { requiresAuth: true },
  },
  // Route cho việc thêm cầu thủ
  {
    path: "/players/new",
    name: "PlayerNew",
    component: PlayerForm,
    props: { isEditing: false },
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  // Route cho việc sửa cầu thủ
  {
    path: "/players/:id/edit",
    name: "PlayerEdit",
    component: PlayerForm,
    props: (route) => ({ id: route.params.id, isEditing: true }),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/attendance",
    name: "Attendance",
    component: Attendance,
    meta: { requiresAuth: true, requiresAdmin: true }, // Only admin can access
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Check if user is authenticated from localStorage
  if (!authStore.isAuthenticated) {
    authStore.checkAuth();
  }

  // If route requires auth
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Not logged in, redirect to login
      next("/login");
    } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // Requires admin but user is guest, redirect to dashboard
      next("/");
    } else {
      // Authenticated and authorized
      next();
    }
  } else {
    // Route doesn't require auth
    if (to.path === "/login" && authStore.isAuthenticated) {
      // Already logged in, redirect to dashboard
      next("/");
    } else {
      next();
    }
  }
});

export default router;
