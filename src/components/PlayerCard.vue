<script setup>
import { computed } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
});

const playerStore = usePlayerStore();
const authStore = useAuthStore();
const router = useRouter();

const playerWithBMI = computed(() => {
  return playerStore.getPlayerWithBMI(props.player);
});

const getPositionColorClass = (position) => {
  const colors = {
    Forward: "bg-red-500",
    Midfielder: "bg-blue-500",
    Defender: "bg-green-500",
    Goalkeeper: "bg-yellow-500",
    "N/A": "bg-gray-500",
  };
  return colors[position] || "bg-gray-500";
};

const getAttendanceColor = (attendance) => {
  if (attendance > 10) return "text-green-600";
  if (attendance > 5) return "text-orange-600";
  return "text-gray-600";
};
</script>

<template>
  <div
    class="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 group hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
  >
    <div
      class="relative h-40 overflow-hidden"
      @click="router.push(`/players/${player.id}`)"
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
      <div
        :class="[
          'absolute top-0 right-0 px-4 py-2 text-white font-black rounded-bl-xl shadow-lg',
          getPositionColorClass(player.position),
        ]"
      >
        #{{ player.jerseyNumber || "?" }}
      </div>
    </div>

    <div class="p-5" @click="router.push(`/players/${player.id}`)">
      <h3 class="text-xl font-black text-gray-900 truncate mb-1">
        {{ player.name }}
      </h3>

      <div class="flex items-center space-x-2 text-sm mb-3">
        <span
          class="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded-full"
        >
          {{ player.position || "N/A" }}
        </span>
        <span class="text-gray-500">
          {{ player.phone || "Chưa có SĐT" }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div
          class="text-center p-2 rounded-lg bg-gray-50 group-hover:bg-green-50 transition-colors"
        >
          <div
            :class="[
              'text-2xl font-black',
              getAttendanceColor(player.totalAttendance),
            ]"
          >
            {{ player.totalAttendance || 0 }}
          </div>
          <div class="text-xs text-gray-500 font-semibold">Tham Gia</div>
        </div>

        <div
          class="text-center p-2 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors"
        >
          <div class="text-2xl font-black text-purple-600">
            {{ playerWithBMI.bmi || "N/A" }}
          </div>
          <div class="text-xs text-gray-500 font-semibold">
            BMI
            <span
              v-if="playerWithBMI.bmi"
              class="text-[10px] block font-normal text-gray-400"
              >({{ playerWithBMI.bmiStatus }})</span
            >
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="authStore.isAdmin"
      class="absolute top-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <router-link
        :to="`/players/${player.id}/edit`"
        class="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors"
        title="Sửa thông tin"
      >
        <svg
          class="w-4 h-4"
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
      </router-link>
    </div>
  </div>
</template>
