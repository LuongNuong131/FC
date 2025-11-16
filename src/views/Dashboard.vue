<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-extrabold text-gray-900">
      👋 Dashboard Tổng Quan
    </h1>

    <div
      v-if="!playerStore.loading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <CardStat
        title="Tổng Số Cầu Thủ"
        :value="playerStore.players.length"
        icon="👨‍👨‍👦"
        color="indigo"
      />
      <CardStat
        title="Buổi Tập Đã Điểm Danh"
        :value="attendanceStore.sessions.length"
        icon="📅"
        color="yellow"
      />
    </div>

    <div
      v-if="playerStore.loading || attendanceStore.loading"
      class="text-center text-indigo-600"
    >
      Đang tải dữ liệu tổng hợp...
    </div>

    <section class="mt-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
      <div class="bg-white p-6 rounded-xl shadow-lg text-gray-500 italic">
        (Hiện đang sử dụng dữ liệu mẫu cục bộ.)
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useAttendanceStore } from "@/stores/attendanceStore";
import CardStat from "@/components/CardStat.vue";

const playerStore = usePlayerStore();
const attendanceStore = useAttendanceStore();

onMounted(() => {
  playerStore.fetchPlayers();
  attendanceStore.fetchSessions();
});
</script>
