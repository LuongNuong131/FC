<script setup>
import { computed, onMounted, ref } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authStore";
import Modal from "@/components/Modal.vue";

const props = defineProps({
  id: String,
});

const playerStore = usePlayerStore();
const authStore = useAuthStore();
const router = useRouter();

const { player } = storeToRefs(playerStore);

// State cho Modal ảnh
const showImageModal = ref(false);

onMounted(() => {
  playerStore.fetchPlayer(props.id);
});

const playerWithBMI = computed(() => {
  return player.value ? playerStore.getPlayerWithBMI(player.value) : null;
});

const bmiColorClass = computed(() => {
  if (!playerWithBMI.value) return "";
  const status = playerWithBMI.value.bmiStatus;
  if (status === "Bình thường")
    return "bg-green-100 text-green-800 border-2 border-green-300";
  if (status === "Thiếu cân")
    return "bg-blue-100 text-blue-800 border-2 border-blue-300";
  if (status === "Thừa cân")
    return "bg-yellow-100 text-yellow-800 border-2 border-yellow-300";
  if (status === "Béo phì")
    return "bg-red-100 text-red-800 border-2 border-red-300";
  return "bg-gray-100 text-gray-800 border-2 border-gray-300";
});

const formatDate = (date) => {
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleDateString("vi-VN");
  }
  return "N/A";
};

const calculateAge = (dob) => {
  if (!dob || !(dob instanceof Date) || isNaN(dob)) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const goBack = () => {
  router.push("/players");
};
</script>

<template>
  <div class="space-y-6">
    <button
      @click="goBack"
      class="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
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
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>Quay lại danh sách</span>
    </button>

    <div
      v-if="playerStore.loading"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-lg font-semibold text-gray-700">Đang tải thông tin...</p>
      </div>
    </div>

    <div
      v-else-if="playerStore.error"
      class="bg-red-50 border-l-4 border-red-500 rounded-xl p-6"
    >
      <div class="flex items-center">
        <svg
          class="w-8 h-8 text-red-500 mr-4"
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
        <div>
          <h3 class="text-lg font-bold text-red-800">Lỗi</h3>
          <p class="text-red-600 mt-1">{{ playerStore.error }}</p>
        </div>
      </div>
    </div>

    <div
      v-else-if="player && playerWithBMI"
      class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      <!-- MOBILE-FRIENDLY HEADER -->
      <div
        class="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden"
      >
        <!-- Background decorations -->
        <div class="absolute inset-0 opacity-20">
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
          ></div>
        </div>

        <!-- MOBILE: Stacked Layout -->
        <div class="relative z-10 p-6">
          <!-- Ảnh đại diện - Centered trên mobile -->
          <div class="flex justify-center mb-6">
            <div
              class="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-white shadow-3xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              @click="showImageModal = true"
            >
              <img
                :src="
                  player.imageUrl ||
                  'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'
                "
                :alt="player.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                @error="
                  ($event) =>
                    ($event.target.src =
                      'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image')
                "
              />
              <!-- Icon phóng to -->
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              >
                <svg
                  class="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                  />
                </svg>
              </div>
              <!-- Badge Click to Zoom -->
              <div
                class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              >
                Click để phóng to
              </div>
            </div>
          </div>

          <!-- Thông tin cầu thủ - Centered trên mobile -->
          <div class="text-center">
            <h1
              class="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg leading-tight mb-3"
            >
              {{ player.name }}
            </h1>
            <p class="text-white/90 text-lg font-semibold mb-4">
              ID: {{ player.id }}
            </p>

            <!-- Badges - Wrap trên mobile -->
            <div class="flex flex-wrap justify-center items-center gap-2">
              <span
                class="px-4 py-2 bg-white/30 backdrop-blur-md text-white font-bold rounded-full border border-white/50 text-base sm:text-lg"
              >
                #{{ player.jerseyNumber || "?" }}
              </span>
              <span
                class="px-4 py-2 bg-white/30 backdrop-blur-md text-white font-bold rounded-full border border-white/50 text-base sm:text-lg"
              >
                {{ player.position || "N/A" }}
              </span>
              <span
                v-if="calculateAge(player.dob)"
                class="px-4 py-2 bg-white/30 backdrop-blur-md text-white font-bold rounded-full border border-white/50 text-base sm:text-lg"
              >
                {{ calculateAge(player.dob) }} tuổi
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nội dung chi tiết - MOBILE RESPONSIVE -->
      <div class="p-4 sm:p-6 md:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Thông tin cơ bản -->
          <div class="lg:col-span-1 space-y-4">
            <h3
              class="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center border-b pb-2 border-gray-200"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-600"
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
              <span class="text-base sm:text-xl">Thông Tin Cơ Bản</span>
            </h3>

            <div class="space-y-3">
              <div
                class="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <p class="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                  📞 Số điện thoại
                </p>
                <p
                  class="text-base sm:text-lg font-bold text-gray-900 break-all"
                >
                  {{ player.phone || "N/A" }}
                </p>
              </div>

              <div
                class="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <p class="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                  🎂 Ngày sinh
                </p>
                <p class="text-base sm:text-lg font-bold text-gray-900">
                  {{ formatDate(player.dob) }}
                </p>
                <p
                  v-if="calculateAge(player.dob)"
                  class="text-xs sm:text-sm text-gray-500 mt-1"
                >
                  ({{ calculateAge(player.dob) }} tuổi)
                </p>
              </div>
            </div>
          </div>

          <!-- Thể chất & Thống kê -->
          <div class="lg:col-span-2 space-y-4">
            <h3
              class="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center border-b pb-2 border-gray-200"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span class="text-base sm:text-xl">Thể Chất & Thống Kê</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                class="p-3 sm:p-4 bg-green-50 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <p
                  class="text-xs sm:text-sm font-bold text-green-700 mb-1 flex items-center"
                >
                  <span class="text-lg sm:text-xl mr-2">✅</span>
                  <span class="text-xs sm:text-sm">Tổng Tham Gia</span>
                </p>
                <p class="text-2xl sm:text-3xl font-black text-green-600">
                  {{ player.totalAttendance || 0 }}
                </p>
                <p class="text-xs text-gray-600">buổi tập</p>
              </div>

              <div
                class="p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <p
                  class="text-xs sm:text-sm font-bold text-purple-700 mb-1 flex items-center"
                >
                  <span class="text-lg sm:text-xl mr-2">📏</span>
                  <span class="text-xs sm:text-sm">Chiều cao</span>
                </p>
                <p class="text-2xl sm:text-3xl font-black text-purple-600">
                  {{ player.height_cm ? `${player.height_cm}` : "N/A" }}
                </p>
                <p class="text-xs text-gray-600">cm</p>
              </div>

              <div
                class="p-3 sm:p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <p
                  class="text-xs sm:text-sm font-bold text-yellow-700 mb-1 flex items-center"
                >
                  <span class="text-lg sm:text-xl mr-2">⚖️</span>
                  <span class="text-xs sm:text-sm">Cân nặng</span>
                </p>
                <p class="text-2xl sm:text-3xl font-black text-yellow-600">
                  {{ player.weight_kg ? `${player.weight_kg}` : "N/A" }}
                </p>
                <p class="text-xs text-gray-600">kg</p>
              </div>
            </div>

            <!-- BMI Section - MOBILE FRIENDLY -->
            <div
              v-if="playerWithBMI.bmi"
              class="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 shadow-lg mt-4"
            >
              <div
                class="flex flex-col sm:flex-row items-center sm:justify-between mb-4 gap-3"
              >
                <p class="text-base sm:text-xl font-bold text-gray-700">
                  Chỉ Số BMI
                </p>
                <p class="text-4xl sm:text-5xl font-black text-indigo-600">
                  {{ playerWithBMI.bmi }}
                </p>
              </div>

              <div
                class="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4"
              >
                <div
                  class="h-full bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full transition-all duration-500"
                  :style="{
                    width: `${Math.min(
                      (parseFloat(playerWithBMI.bmi) / 30) * 100,
                      100
                    )}%`,
                  }"
                ></div>
              </div>

              <span
                :class="bmiColorClass"
                class="inline-block text-sm sm:text-base font-black px-4 py-2 rounded-full shadow-md"
              >
                {{ playerWithBMI.bmiStatus }}
              </span>
            </div>

            <div
              v-else
              class="p-4 sm:p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 shadow-md mt-4"
            >
              <p
                class="text-sm sm:text-base font-semibold text-gray-500 text-center"
              >
                Chưa đủ thông tin để tính BMI (Cần có Chiều cao & Cân nặng)
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons - MOBILE FRIENDLY -->
        <div
          class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4"
        >
          <router-link
            v-if="authStore.isAdmin"
            :to="`/players/${player.id}/edit`"
            class="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              ></path>
            </svg>
            <span>Sửa thông tin cầu thủ</span>
          </router-link>
          <button
            v-else
            @click="goBack"
            class="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5"
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
            <span>Quay lại danh sách</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal xem ảnh to với hiệu ứng cao cấp - MOBILE FRIENDLY -->
    <Modal
      :show="showImageModal"
      @close="showImageModal = false"
      title="Ảnh Đại Diện"
      maxWidth="5xl"
    >
      <div class="flex justify-center p-2 sm:p-4 bg-gray-50 rounded-2xl">
        <img
          :src="
            player?.imageUrl ||
            'https://placehold.co/800x800/e2e8f0/94a3b8?text=No+Image'
          "
          :alt="player?.name"
          class="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white transform transition-transform duration-300 hover:scale-105"
          onerror="this.onerror=null; this.src='https://placehold.co/800x800/e2e8f0/94a3b8?text=No+Image';"
        />
      </div>
      <p class="text-center text-xs sm:text-sm text-gray-500 mt-4">
        Click bên ngoài hoặc nhấn ESC để đóng
      </p>
    </Modal>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-4 > * {
  animation: fadeInUp 0.5s ease-out forwards;
}

.shadow-3xl {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

/* Đảm bảo text không bị overflow trên mobile */
@media (max-width: 640px) {
  h1 {
    word-break: break-word;
  }
}
</style>
