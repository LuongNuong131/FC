<template>
  <div
    class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 border border-gray-100 hover:border-indigo-300 hover:scale-105"
  >
    <!-- Background Gradient Overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <!-- Image Section with Overlay -->
    <div
      class="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden"
    >
      <img
        :src="
          player.imageUrl ||
          'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'
        "
        :alt="player.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        @error="
          ($event) =>
            ($event.target.src =
              'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image')
        "
      />

      <!-- Dark Overlay on Hover -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <!-- Jersey Number Badge -->
      <div
        class="absolute top-4 right-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
      >
        <div class="relative">
          <div
            class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl"
          >
            <span class="text-2xl font-black text-white">{{
              player.jerseyNumber || "?"
            }}</span>
          </div>
          <!-- Glow Effect -->
          <div
            class="absolute inset-0 bg-indigo-400 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"
          ></div>
        </div>
      </div>

      <!-- Stats Badges -->
      <div
        class="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
      >
        <!-- BMI Badge -->
        <div v-if="playerWithBMI.bmi" class="flex items-center space-x-2">
          <div
            :class="`px-3 py-1.5 bg-${bmiColor}-500 backdrop-blur-md rounded-lg shadow-lg`"
          >
            <span class="text-white text-xs font-bold"
              >BMI: {{ playerWithBMI.bmi }}</span
            >
          </div>
        </div>

        <!-- Position Badge -->
        <div
          :class="`px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg shadow-lg`"
        >
          <span class="text-gray-800 text-xs font-bold flex items-center">
            {{ positionIcon }} {{ player.position || "N/A" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="relative p-5">
      <!-- Name -->
      <h3
        class="text-xl font-black text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors"
      >
        {{ player.name }}
      </h3>

      <!-- Phone -->
      <p class="text-sm text-gray-500 mb-3 flex items-center">
        <svg
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        {{ player.phone || "Chưa có SĐT" }}
      </p>

      <!-- BMI Status (Desktop) -->
      <div
        v-if="playerWithBMI.bmi"
        class="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-gray-700">Chỉ số BMI</span>
          <span class="text-lg font-black text-indigo-600">{{
            playerWithBMI.bmi
          }}</span>
        </div>
        <div class="mt-2">
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              :class="`h-full bg-gradient-to-r from-${bmiColor}-400 to-${bmiColor}-600 rounded-full transition-all duration-500`"
              :style="{ width: `${bmiProgress}%` }"
            ></div>
          </div>
          <span
            :class="bmiColorClass"
            class="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
          >
            {{ playerWithBMI.bmiStatus }}
          </span>
        </div>
      </div>

      <div v-else class="mb-4 p-3 bg-gray-50 rounded-xl">
        <p class="text-sm text-gray-400 text-center">Chưa đủ thông tin BMI</p>
      </div>

      <!-- Attendance -->
      <div
        class="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-gray-700 flex items-center">
            <svg
              class="w-4 h-4 mr-1 text-green-600"
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
            Tham gia
          </span>
          <span class="text-2xl font-black text-green-600">
            {{ player.totalAttendance || 0 }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-1">buổi tập</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-2">
        <router-link
          :to="`/players/${player.id}`"
          class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center group/btn"
        >
          <svg
            class="w-4 h-4 mr-1 group-hover/btn:rotate-12 transition-transform"
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
          Chi tiết
        </router-link>

        <router-link
          :to="`/players/${player.id}/edit`"
          class="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center group/btn"
        >
          <svg
            class="w-4 h-4 group-hover/btn:rotate-12 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Hover Decoration -->
    <div
      class="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500"
    ></div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { RouterLink } from "vue-router";

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
});

const playerStore = usePlayerStore();

// Player with BMI calculation
const playerWithBMI = computed(() => {
  return playerStore.getPlayerWithBMI(props.player);
});

// BMI color based on status
const bmiColor = computed(() => {
  const status = playerWithBMI.value.bmiStatus;
  if (status === "Bình thường") return "green";
  if (status === "Thiếu cân") return "blue";
  if (status === "Thừa cân") return "yellow";
  if (status === "Béo phì") return "red";
  return "gray";
});

// BMI color class for badge
const bmiColorClass = computed(() => {
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

// BMI progress percentage (max 30 BMI = 100%)
const bmiProgress = computed(() => {
  if (!playerWithBMI.value.bmi) return 0;
  const bmi = parseFloat(playerWithBMI.value.bmi);
  return Math.min((bmi / 30) * 100, 100);
});

// Position icon
const positionIcon = computed(() => {
  const icons = {
    Forward: "🎯",
    Midfielder: "⚡",
    Defender: "🛡️",
    Goalkeeper: "🧤",
  };
  return icons[props.player.position] || "⚽";
});
</script>

<style scoped>
/* Ensure all dynamic color classes are available */
.bg-green-400 {
  background-color: rgb(74 222 128);
}
.bg-green-500 {
  background-color: rgb(34 197 94);
}
.bg-green-600 {
  background-color: rgb(22 163 74);
}
.from-green-400 {
  --tw-gradient-from: rgb(74 222 128);
}
.to-green-600 {
  --tw-gradient-to: rgb(22 163 74);
}

.bg-blue-400 {
  background-color: rgb(96 165 250);
}
.bg-blue-500 {
  background-color: rgb(59 130 246);
}
.bg-blue-600 {
  background-color: rgb(37 99 235);
}
.from-blue-400 {
  --tw-gradient-from: rgb(96 165 250);
}
.to-blue-600 {
  --tw-gradient-to: rgb(37 99 235);
}

.bg-yellow-400 {
  background-color: rgb(250 204 21);
}
.bg-yellow-500 {
  background-color: rgb(234 179 8);
}
.bg-yellow-600 {
  background-color: rgb(202 138 4);
}
.from-yellow-400 {
  --tw-gradient-from: rgb(250 204 21);
}
.to-yellow-600 {
  --tw-gradient-to: rgb(202 138 4);
}

.bg-red-400 {
  background-color: rgb(248 113 113);
}
.bg-red-500 {
  background-color: rgb(239 68 68);
}
.bg-red-600 {
  background-color: rgb(220 38 38);
}
.from-red-400 {
  --tw-gradient-from: rgb(248 113 113);
}
.to-red-600 {
  --tw-gradient-to: rgb(220 38 38);
}

.bg-indigo-400 {
  background-color: rgb(129 140 248);
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
