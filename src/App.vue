<script setup>
import { RouterView, RouterLink, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);
const scrolled = ref(false);
const showUserMenu = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false;
  }
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
  router.push("/login");
};

// Navigation items based on role
const navItems = computed(() => {
  const items = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/players", label: "Cầu Thủ", icon: "👥" },
    { path: "/teams", label: "Chia Đội", icon: "🆚" }, // NEW
    { path: "/fund", label: "Quỹ Nhóm", icon: "💰" }, // NEW
  ];

  // Add Attendance for admin only
  if (authStore.isAdmin) {
    items.push({ path: "/attendance", label: "Điểm Danh", icon: "📋" });
  }

  return items;
});

// Handle scroll effect
onMounted(() => {
  window.addEventListener("scroll", () => {
    scrolled.value = window.scrollY > 20;
  });
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 font-sans"
  >
    <!-- Navigation Bar -->
    <nav
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-2xl'
          : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600',
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo Section -->
          <div class="flex-shrink-0 flex items-center group">
            <router-link
              to="/"
              class="flex items-center space-x-3 transition-transform duration-300 group-hover:scale-105"
            >
              <div class="relative">
                <div
                  :class="[
                    'w-12 h-12 rounded-xl flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:rotate-12',
                    scrolled
                      ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg'
                      : 'bg-white/20 backdrop-blur-md',
                  ]"
                >
                  ⚽
                </div>
                <div
                  class="absolute inset-0 rounded-xl bg-green-400 opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500"
                ></div>
              </div>

              <div>
                <span
                  :class="[
                    'text-2xl font-black tracking-tight transition-colors',
                    scrolled
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                      : 'text-white',
                  ]"
                >
                  FC Đá Bay Bóng
                </span>
                <div
                  :class="[
                    'text-xs font-semibold tracking-wider',
                    scrolled ? 'text-gray-500' : 'text-white/80',
                  ]"
                >
                  PREMIUM EDITION
                </div>
              </div>
            </router-link>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-2">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="[
                'group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2',
                scrolled
                  ? 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  : 'text-white/80 hover:text-white hover:bg-white/20',
              ]"
              active-class="active-nav-link"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <span>{{ item.label }}</span>

              <div
                class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-300 group-hover:w-full"
              ></div>
            </router-link>

            <!-- User Menu -->
            <div class="relative ml-4">
              <button
                @click="toggleUserMenu"
                :class="[
                  'flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all duration-300',
                  scrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white/20',
                ]"
              >
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm',
                    authStore.isAdmin
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white',
                  ]"
                >
                  {{ authStore.isAdmin ? "👑" : "👤" }}
                </div>
                <span class="hidden lg:inline">{{
                  authStore.user?.displayName
                }}</span>
                <svg
                  :class="[
                    'w-4 h-4 transition-transform',
                    showUserMenu && 'rotate-180',
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Dropdown -->
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-show="showUserMenu"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                >
                  <!-- User Info -->
                  <div
                    :class="[
                      'p-4 border-b border-gray-200',
                      authStore.isAdmin
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50'
                        : 'bg-gray-50',
                    ]"
                  >
                    <div class="flex items-center space-x-3">
                      <div
                        :class="[
                          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                          authStore.isAdmin
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-br from-gray-400 to-gray-600',
                        ]"
                      >
                        {{ authStore.isAdmin ? "👑" : "👤" }}
                      </div>
                      <div>
                        <p class="text-sm font-black text-gray-900">
                          {{ authStore.user?.displayName }}
                        </p>
                        <p
                          :class="[
                            'text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1',
                            authStore.isAdmin
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-200 text-gray-700',
                          ]"
                        >
                          {{ authStore.isAdmin ? "🔐 Admin" : "👁️ Khách" }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Permissions -->
                  <div class="p-3">
                    <p class="text-xs font-bold text-gray-500 mb-2 px-2">
                      Quyền truy cập:
                    </p>
                    <div class="space-y-1 text-xs">
                      <div class="flex items-center px-2 py-1">
                        <svg
                          class="w-4 h-4 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span class="text-gray-600">Dashboard</span>
                      </div>
                      <div class="flex items-center px-2 py-1">
                        <svg
                          class="w-4 h-4 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span class="text-gray-600">Danh sách cầu thủ</span>
                      </div>
                      <div class="flex items-center px-2 py-1">
                        <svg
                          class="w-4 h-4 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span class="text-gray-600">Quỹ Nhóm/Chia Đội</span>
                      </div>
                      <div class="flex items-center px-2 py-1">
                        <svg
                          :class="[
                            'w-4 h-4 mr-2',
                            authStore.isAdmin
                              ? 'text-green-500'
                              : 'text-red-400',
                          ]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            v-if="authStore.isAdmin"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                          <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span
                          :class="
                            authStore.isAdmin
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          "
                        >
                          Điểm danh/Thêm cầu thủ
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Logout -->
                  <button
                    @click="handleLogout"
                    class="w-full p-3 flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors border-t border-gray-200"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <div class="flex items-center md:hidden">
            <button
              @click="toggleMenu"
              :class="[
                'p-3 rounded-xl transition-all duration-300',
                scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/20',
              ]"
            >
              <div class="w-6 h-5 relative flex flex-col justify-between">
                <span
                  :class="[
                    'w-full h-0.5 rounded-full transition-all duration-300',
                    scrolled ? 'bg-gray-700' : 'bg-white',
                    isMenuOpen && 'rotate-45 translate-y-2',
                  ]"
                ></span>
                <span
                  :class="[
                    'w-full h-0.5 rounded-full transition-all duration-300',
                    scrolled ? 'bg-gray-700' : 'bg-white',
                    isMenuOpen && 'opacity-0',
                  ]"
                ></span>
                <span
                  :class="[
                    'w-full h-0.5 rounded-full transition-all duration-300',
                    scrolled ? 'bg-gray-700' : 'bg-white',
                    isMenuOpen && '-rotate-45 -translate-y-2',
                  ]"
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-show="isMenuOpen"
          class="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl"
        >
          <div class="px-4 py-6 space-y-2">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              @click="closeMenu"
              class="mobile-nav-link group flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300"
              active-class="mobile-nav-active"
            >
              <span
                class="text-2xl group-hover:scale-110 transition-transform"
                >{{ item.icon }}</span
              >
              <span class="font-bold">{{ item.label }}</span>
            </router-link>

            <!-- Mobile User Info -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="px-4 py-3 bg-gray-50 rounded-xl mb-2">
                <div class="flex items-center space-x-3">
                  <div
                    :class="[
                      'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                      authStore.isAdmin
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600',
                    ]"
                  >
                    {{ authStore.isAdmin ? "👑" : "👤" }}
                  </div>
                  <div>
                    <p class="text-sm font-black text-gray-900">
                      {{ authStore.user?.displayName }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ authStore.isAdmin ? "Admin" : "Khách" }}
                    </p>
                  </div>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <!-- Main Content with Padding for Fixed Nav -->
    <main class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <router-view v-slot="{ Component }">
        <transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <component :is="Component" :key="$route.fullPath" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer
      class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center text-2xl"
              >
                ⚽
              </div>
              <h3 class="text-xl font-black">FC Đá Bay Bóng</h3>
            </div>
            <p class="text-gray-400 text-sm">
              Hệ thống quản lý đội bóng chuyên nghiệp
            </p>
          </div>

          <div>
            <h4 class="text-lg font-bold mb-4">Liên Kết Nhanh</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <router-link
                  to="/"
                  class="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <span class="mr-2">→</span> Dashboard
                </router-link>
              </li>
              <li>
                <router-link
                  to="/players"
                  class="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <span class="mr-2">→</span> Danh Sách Cầu Thủ
                </router-link>
              </li>
              <li>
                <router-link
                  to="/teams"
                  class="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <span class="mr-2">→</span> Chia Đội
                </router-link>
              </li>
              <li>
                <router-link
                  to="/fund"
                  class="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <span class="mr-2">→</span> Quỹ Nhóm
                </router-link>
              </li>
              <li v-if="authStore.isAdmin">
                <router-link
                  to="/attendance"
                  class="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <span class="mr-2">→</span> Điểm Danh
                </router-link>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-bold mb-4">Thông Tin</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                tranquangluong06@gmail.com
              </li>
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Hồ Chí Minh, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        <div
          class="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400"
        >
          <p>© 2024 Quản Lý FC Đá Bay Bóng. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.active-nav-link {
  @apply bg-white/20 backdrop-blur-md;
}

.mobile-nav-active {
  @apply bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 font-black;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #10b981, #059669);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #059669, #047857);
}
</style>
