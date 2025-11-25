<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const showAdminForm = ref(false);
const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleSelectAdmin = () => {
  showAdminForm.value = true;
  error.value = "";
};

const handleSelectGuest = () => {
  authStore.loginAsGuest();
  router.push("/");
};

const handleAdminLogin = async () => {
  error.value = "";
  loading.value = true;

  try {
    const result = authStore.loginAsAdmin(username.value, password.value);

    if (result.success) {
      router.push("/");
    } else {
      error.value = result.message;
      // Reset form
      username.value = "";
      password.value = "";
    }
  } catch (err) {
    error.value = "Đã xảy ra lỗi. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  showAdminForm.value = false;
  error.value = "";
  username.value = "";
  password.value = "";
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4"
  >
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden opacity-20">
      <div
        class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"
      ></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="inline-block p-4 bg-white/20 backdrop-blur-md rounded-3xl mb-4 animate-bounce"
        >
          <span class="text-7xl">⚽</span>
        </div>
        <h1 class="text-5xl font-black text-white mb-2 drop-shadow-lg">
          Quản Lý Đội Bóng
        </h1>
        <p class="text-white/90 text-lg font-semibold">
          {{ showAdminForm ? "Đăng Nhập Admin" : "Chọn Phương Thức Truy Cập" }}
        </p>
      </div>

      <!-- Main Card -->
      <div
        class="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
      >
        <!-- ROLE SELECTION (Default View) -->
        <div v-if="!showAdminForm" class="space-y-4">
          <!-- Admin Button -->
          <button
            @click="handleSelectAdmin"
            class="group w-full p-6 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
            ></div>
            <div class="relative flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div class="text-left">
                  <h3 class="text-2xl font-black text-white mb-1">Admin</h3>
                  <p class="text-white/80 text-sm font-semibold">
                    Toàn quyền quản lý & điểm danh
                  </p>
                </div>
              </div>
              <svg
                class="w-6 h-6 text-white group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          <!-- Guest Button -->
          <button
            @click="handleSelectGuest"
            class="group w-full p-6 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden border-2 border-gray-300"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <div class="relative flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-inner"
                >
                  <svg
                    class="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div class="text-left">
                  <h3 class="text-2xl font-black text-gray-800 mb-1">Khách</h3>
                  <p class="text-gray-600 text-sm font-semibold">
                    Chỉ xem dashboard & danh sách
                  </p>
                </div>
              </div>
              <svg
                class="w-6 h-6 text-gray-600 group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          <!-- Info Box -->
          <div
            class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
          >
            <div class="flex items-start space-x-3">
              <svg
                class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="text-sm">
                <p class="text-gray-700 font-semibold mb-1">💡 Lưu ý:</p>
                <ul class="text-gray-600 space-y-1">
                  <li>
                    • <strong>Admin:</strong> Cần mật khẩu, quản lý toàn bộ
                  </li>
                  <li>
                    • <strong>Khách:</strong> Không cần đăng nhập, chỉ xem
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- ADMIN LOGIN FORM -->
        <div v-else>
          <!-- Error Message -->
          <div
            v-if="error"
            class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-red-700 font-semibold text-sm">{{ error }}</p>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleAdminLogin" class="space-y-6">
            <div>
              <label
                for="username"
                class="block text-sm font-bold text-gray-700 mb-2"
              >
                <span class="flex items-center">
                  <svg
                    class="w-4 h-4 mr-2 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Tên đăng nhập
                </span>
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                autocomplete="username"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-bold text-gray-700 mb-2"
              >
                <span class="flex items-center">
                  <svg
                    class="w-4 h-4 mr-2 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Mật khẩu
                </span>
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="handleBack"
                class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Quay lại
              </button>

              <button
                type="submit"
                :disabled="loading"
                class="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <span v-if="!loading" class="flex items-center justify-center">
                  <svg
                    class="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Đăng nhập
                </span>
                <span v-else class="flex items-center justify-center">
                  <div
                    class="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"
                  ></div>
                  Đang xử lý...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-white/70 text-sm font-semibold drop-shadow">
          © 2024 Quản Lý Đội Bóng. Made with ❤️
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0%,
  100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.5s;
}
</style>
