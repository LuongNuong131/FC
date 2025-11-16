<script setup>
import { computed, onMounted } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  id: String,
});

const playerStore = usePlayerStore();
const authStore = useAuthStore();
const router = useRouter();

const { player } = storeToRefs(playerStore);

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
    return "bg-green-100 text-green-800 border border-green-300";
  if (status === "Thiếu cân")
    return "bg-blue-100 text-blue-800 border border-blue-300";
  if (status === "Thừa cân")
    return "bg-yellow-100 text-yellow-800 border border-yellow-300";
  if (status === "Béo phì")
    return "bg-red-100 text-red-800 border border-red-300";
  return "bg-gray-100 text-gray-800 border border-gray-300";
});

const formatDate = (date) => {
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleDateString("vi-VN");
  }
  return "N/A";
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
      <div
        class="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden"
      >
        <div class="absolute inset-0 opacity-20">
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"
          ></div>
        </div>
        <div class="absolute bottom-6 left-6 flex items-end space-x-4">
          <div
            class="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transform translate-y-16"
          >
            <img
              :src="
                player.imageUrl ||
                'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'
              "
              :alt="player.name"
              class="w-full h-full object-cover"
              @error="
                ($event) =>
                  ($event.target.src =
                    'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image')
              "
            />
          </div>
          <div class="pb-4">
            <h1 class="text-4xl font-black text-white drop-shadow-lg">
              {{ player.name }}
            </h1>
            <div class="flex items-center space-x-2 mt-2">
              <span
                class="px-3 py-1 bg-white/20 backdrop-blur-md text-white font-bold rounded-full border border-white/30"
              >
                #{{ player.jerseyNumber || "?" }}
              </span>
              <span
                class="px-3 py-1 bg-white/20 backdrop-blur-md text-white font-bold rounded-full border border-white/30"
              >
                {{ player.position || "N/A" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8 pt-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h3 class="text-xl font-black text-gray-900 mb-4 flex items-center">
              <svg
                class="w-6 h-6 mr-2 text-indigo-600"
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
              Thông Tin Cơ Bản
            </h3>

            <div class="space-y-3">
              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-sm font-semibold text-gray-500 mb-1">
                  📞 Số điện thoại
                </p>
                <p class="text-lg font-bold text-gray-900">
                  {{ player.phone || "N/A" }}
                </p>
              </div>

              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-sm font-semibold text-gray-500 mb-1">
                  🎂 Ngày sinh
                </p>
                <p class="text-lg font-bold text-gray-900">
                  {{ formatDate(player.dob) }}
                </p>
              </div>

              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-sm font-semibold text-gray-500 mb-1">
                  📏 Chiều cao
                </p>
                <p class="text-lg font-bold text-gray-900">
                  {{ player.height_cm ? `${player.height_cm} cm` : "N/A" }}
                </p>
              </div>

              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-sm font-semibold text-gray-500 mb-1">
                  ⚖️ Cân nặng
                </p>
                <p class="text-lg font-bold text-gray-900">
                  {{ player.weight_kg ? `${player.weight_kg} kg` : "N/A" }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-black text-gray-900 mb-4 flex items-center">
              <svg
                class="w-6 h-6 mr-2 text-indigo-600"
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
              Thống Kê
            </h3>

            <div
              class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-bold text-gray-700 flex items-center">
                  <svg
                    class="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Tổng Tham Gia
                </p>
                <p class="text-4xl font-black text-green-600">
                  {{ player.totalAttendance || 0 }}
                </p>
              </div>
              <p class="text-xs text-gray-600">buổi tập</p>
            </div>

            <div
              v-if="playerWithBMI.bmi"
              class="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200"
            >
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-bold text-gray-700">Chỉ Số BMI</p>
                <p class="text-4xl font-black text-indigo-600">
                  {{ playerWithBMI.bmi }}
                </p>
              </div>

              <div
                class="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3"
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
                class="inline-block text-sm font-bold px-4 py-2 rounded-full"
              >
                {{ playerWithBMI.bmiStatus }}
              </span>
            </div>

            <div
              v-else
              class="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200"
            >
              <p class="text-sm text-gray-400 text-center">
                Chưa đủ thông tin để tính BMI (Cần có Chiều cao & Cân nặng)
              </p>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200 flex justify-center">
          <router-link
            v-if="authStore.isAdmin"
            :to="`/players/${player.id}/edit`"
            class="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              ></path>
            </svg>
            <span>Sửa thông tin cầu thủ</span>
          </router-link>
          <button
            v-else
            @click="goBack"
            class="px-8 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 font-bold rounded-xl transition-all transform hover:scale-105 flex items-center space-x-2"
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
        </div>
      </div>
    </div>
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
</style>
