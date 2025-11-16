<script setup>
import { onMounted, ref, computed } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useAuthStore } from "@/stores/authStore";
import PlayerCard from "@/components/PlayerCard.vue";

const playerStore = usePlayerStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const positionFilter = ref("all");
const sortBy = ref("name");
const sortOrder = ref("asc");
const viewMode = ref("grid");

const positions = [
  { value: "all", label: "Tất cả vị trí", icon: "⚽" },
  { value: "Forward", label: "Tiền đạo", icon: "🎯" },
  { value: "Midfielder", label: "Tiền vệ", icon: "⚡" },
  { value: "Defender", label: "Hậu vệ", icon: "🛡️" },
  { value: "Goalkeeper", label: "Thủ môn", icon: "🧤" },
];

const sortOptions = [
  { value: "name", label: "Tên" },
  { value: "jerseyNumber", label: "Số áo" },
  { value: "totalAttendance", label: "Tham gia" },
  { value: "position", label: "Vị trí" },
];

const filteredPlayers = computed(() => {
  let result = [...playerStore.players];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.phone && p.phone.includes(query)) ||
        (p.jerseyNumber && p.jerseyNumber.toString().includes(query))
    );
  }

  if (positionFilter.value !== "all") {
    result = result.filter((p) => p.position === positionFilter.value);
  }

  result.sort((a, b) => {
    let comparison = 0;
    switch (sortBy.value) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "jerseyNumber":
        comparison = (a.jerseyNumber || 999) - (b.jerseyNumber || 999);
        break;
      case "totalAttendance":
        comparison = (a.totalAttendance || 0) - (b.totalAttendance || 0);
        break;
      case "position":
        comparison = (a.position || "").localeCompare(b.position || "");
        break;
    }
    return sortOrder.value === "asc" ? comparison : -comparison;
  });

  return result;
});

const stats = computed(() => ({
  total: playerStore.players.length,
  filtered: filteredPlayers.value.length,
}));

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const clearFilters = () => {
  searchQuery.value = "";
  positionFilter.value = "all";
  sortBy.value = "name";
  sortOrder.value = "asc";
};

const handleExportPlayers = () => {
  playerStore.exportPlayersToCSV();
};

onMounted(() => {
  playerStore.fetchPlayers();
});
</script>

<template>
  <div class="space-y-6">
    <div
      class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8"
    >
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
        ></div>
      </div>

      <div
        class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-5xl font-black text-white mb-2 flex items-center">
            <span class="text-6xl mr-4">👥</span>
            Danh Sách Cầu Thủ
          </h1>
          <p class="text-white/90 text-xl">
            Quản lý {{ stats.total }} cầu thủ trong đội
          </p>
        </div>

        <div class="mt-4 sm:mt-0 flex space-x-3">
          <button
            v-if="authStore.isAdmin"
            @click="handleExportPlayers"
            :disabled="playerStore.players.length === 0"
            class="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
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
            <span>Xuất CSV</span>
          </button>
          <router-link
            v-if="authStore.isAdmin"
            to="/players/new"
            class="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/30 text-white font-bold rounded-xl flex items-center space-x-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Thêm Cầu Thủ</span>
          </router-link>
        </div>
      </div>
    </div>

    <div
      v-if="playerStore.loading"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-lg font-semibold text-gray-700">
          Đang tải danh sách cầu thủ...
        </p>
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
          <h3 class="text-lg font-bold text-red-800">Lỗi tải dữ liệu</h3>
          <p class="text-red-600 mt-1">{{ playerStore.error }}</p>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div class="md:col-span-4 relative">
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >🔍 Tìm kiếm</label
            >
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tên, SĐT, số áo..."
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div class="md:col-span-3">
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >⚽ Vị trí</label
            >
            <select
              v-model="positionFilter"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option
                v-for="pos in positions"
                :key="pos.value"
                :value="pos.value"
              >
                {{ pos.icon }} {{ pos.label }}
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >📊 Sắp xếp</label
            >
            <select
              v-model="sortBy"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option
                v-for="opt in sortOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="md:col-span-3 flex items-end space-x-2">
            <button
              @click="toggleSortOrder"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
              title="Đảo chiều sắp xếp"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="sortOrder === 'asc'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <button
              @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all flex items-center justify-center"
              title="Chế độ xem"
            >
              <svg
                v-if="viewMode === 'grid'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>

            <button
              v-if="searchQuery || positionFilter !== 'all'"
              @click="clearFilters"
              class="px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center"
              title="Xóa bộ lọc"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          v-if="searchQuery || positionFilter !== 'all'"
          class="mt-4 pt-4 border-t border-gray-200"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-semibold text-gray-600">Đang lọc:</span>
            <span
              v-if="searchQuery"
              class="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full"
            >
              Tìm: "{{ searchQuery }}"
              <button
                @click="searchQuery = ''"
                class="ml-2 hover:text-indigo-900"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
            <span
              v-if="positionFilter !== 'all'"
              class="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full"
            >
              Vị trí:
              {{ positions.find((p) => p.value === positionFilter)?.label }}
              <button
                @click="positionFilter = 'all'"
                class="ml-2 hover:text-purple-900"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between px-4">
        <p class="text-lg font-bold text-gray-700">
          Hiển thị <span class="text-indigo-600">{{ stats.filtered }}</span> /
          {{ stats.total }} cầu thủ
        </p>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Chế độ xem:</span>
          <span class="font-semibold text-gray-700">{{
            viewMode === "grid" ? "🔲 Lưới" : "📋 Danh sách"
          }}</span>
        </div>
      </div>

      <div
        v-if="stats.total === 0"
        class="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center"
      >
        <div
          class="inline-block p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mb-6"
        >
          <svg
            class="w-24 h-24 text-gray-300 mx-auto"
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
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-2">
          Chưa có cầu thủ nào
        </h3>
        <p class="text-gray-600 mb-6">
          Thêm cầu thủ vào file
          <code class="px-2 py-1 bg-gray-200 rounded">public/players.csv</code>
        </p>
      </div>

      <div
        v-else-if="filteredPlayers.length === 0"
        class="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center"
      >
        <h3 class="text-2xl font-black text-gray-900 mb-2">
          Không tìm thấy kết quả
        </h3>
        <button
          @click="clearFilters"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
        >
          Xóa Bộ Lọc
        </button>
      </div>

      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <PlayerCard
          v-for="player in filteredPlayers"
          :key="player.id"
          :player="player"
        />
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="player in filteredPlayers"
          :key="player.id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex items-center space-x-6 group cursor-pointer"
          @click="$router.push(`/players/${player.id}`)"
        >
          <img
            :src="player.imageUrl || 'https://placehold.co/150'"
            :alt="player.name"
            class="w-20 h-20 rounded-full object-cover border-4 border-indigo-500"
          />
          <div class="flex-1">
            <h3 class="text-xl font-black text-gray-900">{{ player.name }}</h3>
            <p class="text-sm text-gray-500">
              {{ player.position }} • {{ player.phone }}
            </p>
          </div>
          <div class="text-center">
            <div class="text-2xl font-black text-green-600">
              {{ player.totalAttendance || 0 }}
            </div>
            <div class="text-xs text-gray-500">Buổi tập</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
