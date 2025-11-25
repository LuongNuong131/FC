<script setup>
import { ref, onMounted, computed } from "vue";
import { useTeamStore } from "@/stores/teamStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter } from "vue-router";

const teamStore = useTeamStore();
const playerStore = usePlayerStore();
const router = useRouter();

// Methods
const getPlayerDetail = (id) => {
  return playerStore.players.find((p) => p.id === id);
};

const getPlayerNameWithNumber = (id) => {
  const player = getPlayerDetail(id);
  if (!player) return "Cầu thủ N/A";
  return `${player.name} (#${player.jerseyNumber || "?"})`;
};

const handleViewPlayer = (playerId) => {
  router.push(`/players/${playerId}`);
};

// Lifecycle
onMounted(() => {
  teamStore.fetchTeams();
  playerStore.fetchPlayers();
});
</script>

<template>
  <div class="space-y-8">
    <div
      class="relative overflow-hidden bg-gradient-to-br from-blue-700 via-cyan-700 to-teal-700 rounded-3xl shadow-2xl p-8"
    >
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
        ></div>
      </div>

      <div
        class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-5xl font-black text-white mb-2 flex items-center">
            <span class="text-6xl mr-4">🆚</span>
            Hệ Thống Chia Đội
          </h1>
          <p class="text-white/90 text-xl">
            Quản lý và hiển thị danh sách 4 đội bóng cố định
          </p>
        </div>

        <div class="mt-4 sm:mt-0">
          <a
            href="/teams.csv"
            download
            class="relative px-6 py-3 glass-card text-white font-bold rounded-xl flex items-center space-x-2 transition-all duration-300"
            title="Tải file teams.csv để cấu hình đội"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 8l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Tải CSV Cấu Hình Đội</span>
          </a>
        </div>
      </div>
    </div>

    <div
      v-if="teamStore.loading || playerStore.loading"
      class="text-center py-20"
    >
      <div
        class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"
      ></div>
      <p class="text-lg font-semibold text-gray-700">
        Đang tải cấu hình đội...
      </p>
    </div>

    <div
      v-else-if="teamStore.error || teamStore.teams.length === 0"
      class="bg-red-50 border-l-4 border-red-500 rounded-xl p-6"
    >
      <h3 class="text-lg font-bold text-red-800">Lỗi cấu hình Teams</h3>
      <p class="text-red-600 mt-1">
        {{
          teamStore.error ||
          "Chưa có cấu hình đội nào trong teams.csv. Vui lòng tạo file và tải lại."
        }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-4">
      <div
        v-for="team in teamStore.teams"
        :key="team.id"
        class="bg-white rounded-2xl shadow-xl border-l-8 transition-all duration-500 transform hover:scale-[1.02] overflow-hidden"
        :class="[`border-${team.colorClass}`]"
      >
        <div :class="[`bg-${team.colorClass}-50/70 p-6`]">
          <h3
            :class="[
              'text-2xl font-black mb-1 flex items-center',
              `text-${team.colorClass}`,
            ]"
          >
            <span class="text-3xl mr-2">
              {{
                team.id === "t1"
                  ? "🟢"
                  : team.id === "t2"
                  ? "🔴"
                  : team.id === "t3"
                  ? "🟡"
                  : "🟣"
              }}
            </span>
            {{ team.teamName }}
          </h3>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <span>Tổng: {{ team.playerIds.length }} người</span>
            <span :class="['font-bold', `text-${team.colorClass}`]">•</span>
            <span
              >Đội trưởng: {{ getPlayerNameWithNumber(team.captainId) }}</span
            >
          </div>
        </div>

        <div
          :class="[`p-4 bg-${team.colorClass}-100 border-b border-gray-100`]"
        >
          <div
            class="flex items-center justify-between space-x-3 cursor-pointer group p-3 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            @click="handleViewPlayer(team.captainId)"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-xl flex-shrink-0',
                  `bg-gradient-to-br from-${team.colorClass}-400 to-${team.colorClass}-600 text-white`,
                ]"
              >
                👑
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-500">ĐỘI TRƯỞNG</p>
                <h4
                  :class="[
                    'text-lg font-black truncate group-hover:text-gray-900 transition-colors',
                  ]"
                >
                  {{ getPlayerNameWithNumber(team.captainId) }}
                </h4>
              </div>
            </div>
            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-gray-700 transition-colors group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        <div class="p-4 max-h-[400px] overflow-y-auto space-y-2">
          <p
            class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-1"
          >
            Thành viên ({{ team.playerIds.length - 1 }}):
          </p>
          <div
            v-for="playerId in team.playerIds.filter(
              (id) => id !== team.captainId
            )"
            :key="playerId"
            class="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-gray-100 hover:border-gray-200 transform hover:shadow-sm"
            @click="handleViewPlayer(playerId)"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md',
                  `bg-gradient-to-br from-${team.colorClass}-400 to-${team.colorClass}-600`,
                ]"
              >
                {{ getPlayerDetail(playerId)?.jerseyNumber || "?" }}
              </div>
              <p
                class="text-gray-700 font-medium group-hover:text-gray-900 truncate"
              >
                {{ getPlayerDetail(playerId)?.name }}
              </p>
            </div>
            <span class="text-xs text-gray-500 font-semibold flex-shrink-0">{{
              getPlayerDetail(playerId)?.position || "N/A"
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles */
</style>
