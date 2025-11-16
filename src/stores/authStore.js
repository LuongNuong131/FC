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

  const logout = () => {
    user.value = null;
    localStorage.removeItem("user");
    // Force reload on logout to clear all Pinia state (optional but safer for CSV-based system)
    router.push("/login");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

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
