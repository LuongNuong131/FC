// src/stores/authStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123";

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const user = ref(null);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  // Load auth state from localStorage
  const checkAuth = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
  };

  const loginAsAdmin = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      user.value = {
        displayName: "Admin",
        role: "admin",
      };
      localStorage.setItem("user", JSON.stringify(user.value));
      return { success: true };
    } else {
      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng.",
      };
    }
  };

  const loginAsGuest = () => {
    user.value = {
      displayName: "Khách",
      role: "guest",
    };
    localStorage.setItem("user", JSON.stringify(user.value));
  };

  // --- PHẦN ĐÃ SỬA ĐỔI ---
  const logout = () => {
    // 1. Xóa state user trong Pinia
    user.value = null;

    // 2. Xóa dữ liệu trong LocalStorage
    localStorage.removeItem("user");

    // 3. Chuyển hướng về trang login bằng Router (Không reload trang)
    router.push("/login");
  };
  // -----------------------

  // Tự động kiểm tra khi store được tạo
  checkAuth();

  return {
    user,
    isAuthenticated,
    isAdmin,
    loginAsAdmin,
    loginAsGuest,
    logout,
    checkAuth,
  };
});
