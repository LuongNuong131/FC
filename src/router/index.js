// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import PlayersList from "../views/PlayersList.vue";
import PlayerDetail from "../views/PlayerDetail.vue";
import Attendance from "../views/Attendance.vue";
import PlayerForm from "@/components/PlayerForm.vue";
import FundManagement from "@/views/FundManagement.vue";
import TeamSplitting from "@/views/TeamSplitting.vue";

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
  {
    path: "/players/new",
    name: "PlayerNew",
    component: PlayerForm,
    props: { isEditing: false },
    meta: { requiresAuth: true, requiresAdmin: true },
  },
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
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/fund",
    name: "FundManagement",
    component: FundManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/teams",
    name: "TeamSplitting",
    component: TeamSplitting,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // === FIX: Thêm SCROLL BEHAVIOR để cuộn lên đầu trang khi chuyển route ===
  scrollBehavior(to, from, savedPosition) {
    // Nếu có vị trí cuộn đã lưu (ví dụ: khi nhấn nút Back/Forward), sử dụng nó
    if (savedPosition) {
      return savedPosition;
    }
    // Nếu không, cuộn về đầu trang (0, 0)
    return { top: 0, left: 0 };
  },
  // =====================================================================
});

router.beforeEach(async (to, from, next) => {
  // Check auth state on first load
  const authStore = useAuthStore();
  if (!authStore.user) {
    authStore.checkAuth();
  }

  // Auth Guard Logic
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // If not logged in and requires auth, redirect to login
    next("/login");
  } else if (
    to.meta.requiresAdmin &&
    authStore.isAuthenticated &&
    !authStore.isAdmin
  ) {
    // If logged in as guest but requires admin, redirect to dashboard
    next("/");
  } else if (to.name === "Login" && authStore.isAuthenticated) {
    // If logged in and trying to go to login, redirect to dashboard
    next("/");
  } else {
    // Continue to route
    next();
  }
});

export default router;
