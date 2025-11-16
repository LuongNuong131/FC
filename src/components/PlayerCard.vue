<template>
  <div
    class="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
  >
    <div class="relative h-48 bg-gray-200">
      <img
        :src="
          player.imageUrl ||
          'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image'
        "
        :alt="player.name"
        class="w-full h-full object-cover"
        @error="
          ($event) =>
            ($event.target.src =
              'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image')
        "
      />
    </div>
    <div class="p-4">
      <h3 class="text-xl font-bold text-gray-800 truncate">
        {{ player.name }}
      </h3>
      <p class="text-gray-500 text-sm">{{ player.phone || "Chưa có SĐT" }}</p>

      <div v-if="playerWithBMI.bmi" class="mt-2">
        <span class="text-sm font-semibold">BMI: {{ playerWithBMI.bmi }}</span>
        <span
          :class="bmiColorClass"
          class="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full"
        >
          {{ playerWithBMI.bmiStatus }}
        </span>
      </div>
      <div v-else class="mt-2">
        <span class="text-sm text-gray-400">Chưa đủ thông tin BMI</span>
      </div>

      <p class="mt-2 text-sm text-gray-600">
        Tham gia:
        <span class="font-bold text-indigo-600">{{
          player.totalAttendance || 0
        }}</span>
        buổi
      </p>
    </div>
    <div class="p-4 bg-gray-50 border-t flex justify-end space-x-2">
      <router-link
        :to="`/players/${player.id}`"
        class="btn-secondary py-1 px-3"
      >
        Chi tiết
      </router-link>
      <router-link :to="`/players/${player.id}/edit`" class="btn-edit">
        Sửa
      </router-link>
    </div>
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

const playerWithBMI = computed(() => {
  return playerStore.getPlayerWithBMI(props.player);
});

const bmiColorClass = computed(() => {
  const status = playerWithBMI.value.bmiStatus;
  if (status === "Bình thường") return "bg-green-100 text-green-800";
  if (status === "Thiếu cân") return "bg-blue-100 text-blue-800";
  if (status === "Thừa cân") return "bg-yellow-100 text-yellow-800";
  if (status === "Béo phì") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
});
</script>

<style scoped>
.btn-secondary {
  @apply bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-lg text-sm hover:bg-gray-300 transition duration-300;
}
</style>
