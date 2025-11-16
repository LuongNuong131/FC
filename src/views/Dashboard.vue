<script setup>
import { onMounted, computed } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { useAuthStore } from "@/stores/authStore";
import CardStat from "@/components/CardStat.vue";

const playerStore = usePlayerStore();
const attendanceStore = useAttendanceStore();
const authStore = useAuthStore();

// Computed Statistics
const advancedStats = computed(() => {
  const players = playerStore.players || [];
  const sessions = attendanceStore.sessions || [];

  const totalPlayers = players.length;
  const totalSessions = sessions.length;

  // Tổng lượt tham gia = tổng số người trong TẤT CẢ sessions
  const totalAttendances = sessions.reduce((sum, session) => {
    return sum + (session.attendees?.length || 0);
  }, 0);

  // TB tham gia/người = Trung bình mỗi người đi bao nhiêu buổi
  const avgAttendance =
    totalPlayers > 0
      ? (
          players.reduce((sum, p) => sum + (p.totalAttendance || 0), 0) /
          totalPlayers
        ).toFixed(1)
      : 0;

  // Active players (attended > 3 sessions)
  const activePlayers = players.filter(
    (p) => (p.totalAttendance || 0) > 3
  ).length;
  const activeRate =
    totalPlayers > 0 ? ((activePlayers / totalPlayers) * 100).toFixed(0) : 0;

  // Position distribution
  const positionStats = players.reduce((acc, p) => {
    const pos = p.position || "Unknown";
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {});

  // Top performers
  const topPerformers = [...players]
    .sort((a, b) => (b.totalAttendance || 0) - (a.totalAttendance || 0))
    .slice(0, 5);

  // Recent sessions
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Best month (month with most sessions)
  const monthStats = sessions.reduce((acc, s) => {
    const month = new Date(s.date).toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const bestMonth = Object.entries(monthStats).sort(
    (a, b) => b[1] - a[1]
  )[0] || ["N/A", 0];

  return {
    totalPlayers,
    totalSessions,
    totalAttendances,
    avgAttendance,
    activeRate,
    activePlayers,
    positionStats,
    topPerformers,
    recentSessions,
    bestMonth,
  };
});

// Get player name by ID
const getPlayerName = (id) => {
  const player = playerStore.players.find((p) => p.id === id);
  return player ? player.name : "Unknown";
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Get position color (Cho biểu đồ phân bố)
const getPositionColor = (position) => {
  const colors = {
    Forward: "red",
    Midfielder: "blue",
    Defender: "green",
    Goalkeeper: "yellow",
    Unknown: "gray",
  };
  return colors[position] || "gray";
};

// Actions
const handleExportPlayers = () => {
  playerStore.exportPlayersToCSV();
};

const handleExportSessions = () => {
  attendanceStore.exportSessionsToCSV();
};

onMounted(() => {
  playerStore.fetchPlayers();
  attendanceStore.fetchSessions();
});
</script>

<template>
  <div class="space-y-8">
    <div
      class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8"
    >
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
          style="animation-delay: 1s"
        ></div>
      </div>

      <div class="relative z-10">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-5xl font-black text-white mb-3 flex items-center">
              <span class="text-6xl mr-4 animate-bounce">⚽</span>
              Dashboard Tổng Quan
            </h1>
            <p class="text-white/90 text-xl">
              Chào mừng <strong>{{ authStore.user?.displayName }}</strong> đến
              với hệ thống quản lý
            </p>
          </div>
          <div
            class="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30"
          >
            <p class="text-white text-sm font-bold">
              📅
              {{
                new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="playerStore.loading || attendanceStore.loading"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-lg font-semibold text-gray-700">Đang tải dữ liệu...</p>
      </div>
    </div>

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardStat
          title="Tổng Số Cầu Thủ"
          :value="advancedStats.totalPlayers"
          icon="👨‍👨‍👦"
          color="indigo"
          description="Cầu thủ trong đội"
        />
        <CardStat
          title="Buổi Tập Đã Tổ Chức"
          :value="advancedStats.totalSessions"
          icon="📅"
          color="green"
          description="Sessions đã diễn ra"
        />
        <CardStat
          title="TB Tham Gia/Người"
          :value="advancedStats.avgAttendance"
          icon="📊"
          color="purple"
          description="Trung bình mỗi cầu thủ"
        />
        <CardStat
          title="Tỷ Lệ Hoạt Động"
          :value="`${advancedStats.activeRate}%`"
          icon="🔥"
          color="yellow"
          :description="`${advancedStats.activePlayers}/${advancedStats.totalPlayers} người tích cực`"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardStat
          title="Tổng Lượt Tham Gia"
          :value="advancedStats.totalAttendances"
          icon="✅"
          color="green"
          description="Tổng check-ins"
        />
        <CardStat
          title="Tháng Tích Cực Nhất"
          :value="advancedStats.bestMonth[1]"
          icon="📆"
          color="pink"
          :description="advancedStats.bestMonth[0]"
        />
        <CardStat
          title="Vị Trí Phổ Biến Nhất"
          :value="
            Object.entries(advancedStats.positionStats).sort(
              (a, b) => b[1] - a[1]
            )[0]?.[1] || 0
          "
          icon="⚽"
          color="blue"
          :description="
            Object.entries(advancedStats.positionStats).sort(
              (a, b) => b[1] - a[1]
            )[0]?.[0] || 'N/A'
          "
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <h2 class="text-2xl font-black text-white flex items-center">
              <span class="text-3xl mr-3">🏆</span>
              Top Cầu Thủ Chăm Chỉ
            </h2>
            <p class="text-green-100 mt-1">Những cầu thủ tham gia nhiều nhất</p>
          </div>

          <div class="p-6">
            <div
              v-if="advancedStats.topPerformers.length > 0"
              class="space-y-4"
            >
              <div
                v-for="(player, index) in advancedStats.topPerformers"
                :key="player.id"
                class="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-green-50 transition-all duration-300 group"
              >
                <div class="relative">
                  <div
                    :class="[
                      'w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg transition-transform group-hover:scale-110',
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                        : 'bg-gradient-to-br from-indigo-400 to-purple-600 text-white',
                    ]"
                  >
                    {{ index + 1 }}
                  </div>
                  <div v-if="index < 3" class="absolute -top-1 -right-1">
                    <span class="text-2xl">{{
                      index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"
                    }}</span>
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-900 truncate">
                    {{ player.name }}
                  </h3>
                  <div class="flex items-center space-x-2 mt-1">
                    <span
                      class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full"
                    >
                      #{{ player.jerseyNumber || "?" }}
                    </span>
                    <span class="text-sm text-gray-500">{{
                      player.position
                    }}</span>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-3xl font-black text-green-600">
                    {{ player.totalAttendance || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 font-semibold">
                    buổi tập
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-10 text-gray-400">
              <p class="text-4xl mb-2">🏃</p>
              <p>Chưa có dữ liệu tham gia</p>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <h2 class="text-2xl font-black text-white flex items-center">
              <span class="text-3xl mr-3">📊</span>
              Phân Bố Vị Trí
            </h2>
            <p class="text-blue-100 mt-1">Thống kê cầu thủ theo vị trí</p>
          </div>

          <div class="p-6">
            <div
              v-if="Object.keys(advancedStats.positionStats).length > 0"
              class="space-y-4"
            >
              <div
                v-for="(count, position) in advancedStats.positionStats"
                :key="position"
                class="group"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div
                      :class="`w-3 h-3 rounded-full bg-${getPositionColor(
                        position
                      )}-500`"
                    ></div>
                    <span class="font-bold text-gray-900">{{ position }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-semibold text-gray-600"
                      >{{ count }} cầu thủ</span
                    >
                    <span class="text-xs text-gray-500">
                      ({{
                        ((count / advancedStats.totalPlayers) * 100).toFixed(0)
                      }}%)
                    </span>
                  </div>
                </div>

                <div
                  class="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
                >
                  <div
                    :class="`h-full bg-gradient-to-r from-${getPositionColor(
                      position
                    )}-400 to-${getPositionColor(
                      position
                    )}-600 rounded-full transition-all duration-500 group-hover:scale-105`"
                    :style="{
                      width: `${(count / advancedStats.totalPlayers) * 100}%`,
                    }"
                  ></div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-10 text-gray-400">
              <p class="text-4xl mb-2">⚽</p>
              <p>Chưa có cầu thủ nào</p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div class="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
          <h2 class="text-2xl font-black text-white flex items-center">
            <span class="text-3xl mr-3">📋</span>
            Hoạt Động Gần Đây
          </h2>
          <p class="text-purple-100 mt-1">
            {{ advancedStats.recentSessions.length }} buổi tập gần nhất
          </p>
        </div>

        <div class="p-6">
          <div v-if="advancedStats.recentSessions.length > 0" class="space-y-3">
            <div
              v-for="(session, index) in advancedStats.recentSessions"
              :key="session.id"
              class="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-purple-50 transition-all duration-300 border-l-4 border-purple-500"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="flex-shrink-0">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg"
                >
                  <div class="text-xs font-bold">
                    Tháng {{ new Date(session.date).getMonth() + 1 }}
                  </div>
                  <div class="text-2xl font-black">
                    {{ new Date(session.date).getDate() }}
                  </div>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 mb-1">
                  {{ session.note || "Buổi tập thường" }}
                </h3>
                <div class="flex items-center space-x-3 text-sm text-gray-600">
                  <span class="flex items-center">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {{ formatDate(session.date) }}
                  </span>
                  <span class="flex items-center font-semibold text-green-600">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {{ session.attendees.length }} người
                  </span>
                </div>
              </div>

              <router-link
                v-if="authStore.isAdmin"
                to="/attendance"
                class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <span class="mr-1">Chi tiết</span>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </router-link>
            </div>
          </div>

          <div v-else class="text-center py-10 text-gray-400">
            <p class="text-4xl mb-2">🏃</p>
            <p>Chưa có dữ liệu tham gia</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <router-link
          to="/players"
          class="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">👥</div>
            <h3 class="text-2xl font-black mb-2">Quản Lý Cầu Thủ</h3>
            <p class="text-blue-100">
              Xem danh sách {{ advancedStats.totalPlayers }} cầu thủ
            </p>
          </div>
        </router-link>

        <router-link
          v-if="authStore.isAdmin"
          to="/attendance"
          class="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">📋</div>
            <h3 class="text-2xl font-black mb-2">Điểm Danh</h3>
            <p class="text-green-100">Tạo buổi tập mới ngay</p>
          </div>
        </router-link>

        <div
          v-if="authStore.isAdmin"
          @click="playerStore.exportPlayersToCSV"
          class="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
          title="Xuất players.csv và sessions.csv"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">💾</div>
            <h3 class="text-2xl font-black mb-2">Lưu Data (CSV)</h3>
            <p class="text-purple-100">
              Xuất players.csv để lưu trữ cầu thủ và attendance
            </p>
          </div>
        </div>
        <div
          v-else
          class="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">📊</div>
            <h3 class="text-2xl font-black mb-2">Thống Kê</h3>
            <p class="text-purple-100">
              {{ advancedStats.totalAttendances }} lượt check-in
            </p>
          </div>
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
  opacity: 0;
}

.space-y-4 > *:nth-child(1) {
  animation-delay: 0.1s;
}
.space-y-4 > *:nth-child(2) {
  animation-delay: 0.2s;
}
.space-y-4 > *:nth-child(3) {
  animation-delay: 0.3s;
}
.space-y-4 > *:nth-child(4) {
  animation-delay: 0.4s;
}
.space-y-4 > *:nth-child(5) {
  animation-delay: 0.5s;
}
</style>
