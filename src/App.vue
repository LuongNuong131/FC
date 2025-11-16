<script setup>
import { RouterView, RouterLink } from "vue-router";
import { ref } from "vue";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Hàm đóng menu sau khi click (chỉ áp dụng cho mobile)
const closeMenu = () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <nav
      class="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-2xl font-bold"
              >⚽ Quản Lý Đội Bóng</router-link
            >
          </div>

          <div class="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
            <router-link to="/" class="nav-link" active-class="nav-active"
              >Dashboard</router-link
            >
            <router-link
              to="/players"
              class="nav-link"
              active-class="nav-active"
              >Cầu Thủ</router-link
            >
            <router-link
              to="/attendance"
              class="nav-link"
              active-class="nav-active"
              >Điểm Danh</router-link
            >
          </div>

          <div class="flex items-center sm:hidden">
            <button
              @click="toggleMenu"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg
                class="h-6 w-6"
                :class="{ hidden: isMenuOpen, block: !isMenuOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                class="h-6 w-6"
                :class="{ block: isMenuOpen, hidden: !isMenuOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-show="isMenuOpen" class="sm:hidden bg-green-700 pb-2">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link to="/" @click="closeMenu" class="mobile-nav-link"
            >Dashboard</router-link
          >
          <router-link to="/players" @click="closeMenu" class="mobile-nav-link"
            >Cầu Thủ</router-link
          >
          <router-link
            to="/attendance"
            @click="closeMenu"
            class="mobile-nav-link"
            >Điểm Danh</router-link
          >
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<style>
/* Style cho Navigation */
.nav-link {
  @apply inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-200 hover:text-white hover:border-white transition-colors duration-200;
}
.nav-active,
.router-link-exact-active {
  @apply border-white text-white;
}
.mobile-nav-link {
  @apply block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600;
}
.mobile-nav-link.router-link-exact-active {
  @apply bg-green-600 font-bold;
}

/* Định nghĩa style chung cho các nút và form (Giữ nguyên) */
.btn-primary {
  @apply bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 disabled:bg-gray-400;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300;
}
.btn-danger {
  @apply bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300;
}
.btn-edit {
  @apply bg-blue-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-blue-600 transition duration-300;
}
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}
</style>
