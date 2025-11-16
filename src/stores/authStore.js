// src/stores/authStore.js - COMPLETE AUTH SYSTEM
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null,
    userRole: null, // 'admin' or 'guest'
  }),

  getters: {
    isAdmin: (state) => state.userRole === "admin",
    isGuest: (state) => state.userRole === "guest",

    // Quyền truy cập
    canAccessAttendance: (state) => state.userRole === "admin",
    canEditPlayers: (state) => false, // Không ai được edit
    canViewDashboard: (state) => state.isAuthenticated, // Cả 2 đều xem được
    canViewPlayers: (state) => state.isAuthenticated, // Cả 2 đều xem được
  },

  actions: {
    // 🔐 Đăng nhập Admin
    loginAsAdmin(username, password) {
      // Check credentials - KHÔNG public ra ngoài UI
      if (username === "LuNu" && password === "123456789") {
        this.isAuthenticated = true;
        this.userRole = "admin";
        this.user = {
          username: "LuNu",
          displayName: "Admin",
          role: "admin",
        };

        // Save to localStorage
        localStorage.setItem("auth_user", JSON.stringify(this.user));
        localStorage.setItem("auth_role", "admin");

        return { success: true };
      }

      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng!",
      };
    },

    // 👁️ Đăng nhập Khách (không cần mật khẩu)
    loginAsGuest() {
      this.isAuthenticated = true;
      this.userRole = "guest";
      this.user = {
        username: "guest",
        displayName: "Khách",
        role: "guest",
      };

      // Save to localStorage
      localStorage.setItem("auth_user", JSON.stringify(this.user));
      localStorage.setItem("auth_role", "guest");

      return { success: true };
    },

    // 🚪 Đăng xuất
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.userRole = null;

      // Clear localStorage
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_role");
    },

    // ✅ Kiểm tra auth từ localStorage
    checkAuth() {
      const savedUser = localStorage.getItem("auth_user");
      const savedRole = localStorage.getItem("auth_role");

      if (savedUser && savedRole) {
        this.isAuthenticated = true;
        this.user = JSON.parse(savedUser);
        this.userRole = savedRole;
        return true;
      }

      return false;
    },
  },
});
