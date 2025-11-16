<template>
  <div
    class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
  >
    <h1 class="text-3xl font-bold text-gray-800 mb-3 sm:mb-0">
      Danh Sách Cầu Thủ
    </h1>
    <button
      disabled
      class="btn-primary opacity-50 cursor-not-allowed w-full sm:w-auto"
    >
      *Thêm cầu thủ (Sửa file CSV)
    </button>
  </div>

  <div v-if="playerStore.loading" class="text-center">
    <p>Đang tải dữ liệu...</p>
  </div>

  <div v-if="playerStore.error" class="text-red-500">
    Lỗi: {{ playerStore.error }}
  </div>

  <div
    v-if="!playerStore.loading && playerStore.players.length === 0"
    class="text-center text-gray-500 py-10"
  >
    <p class="text-lg">Chưa có cầu thủ nào.</p>
    <p class="mt-2">Hãy thêm cầu thủ vào file public/players.csv để bắt đầu.</p>
  </div>

  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  >
    <PlayerCard
      v-for="player in playerStore.players"
      :key="player.id"
      :player="player"
    />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import PlayerCard from "@/components/PlayerCard.vue";

const playerStore = usePlayerStore();

onMounted(() => {
  playerStore.fetchPlayers();
});
</script>
