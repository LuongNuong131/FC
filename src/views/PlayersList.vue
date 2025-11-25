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

// --- FIX LOGIC TÌM KIẾM ---
const filteredPlayers = computed(() => {
  // Copy mảng để tránh mutate state gốc
  let result = [...playerStore.players];

  // 1. Lọc theo từ khóa (An toàn: Chuyển về string và check null)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter((p) => {
      const name = p.name ? String(p.name).toLowerCase() : "";
      const phone = p.phone ? String(p.phone).toLowerCase() : "";
      const jersey = p.jerseyNumber ? String(p.jerseyNumber) : "";

      return (
        name.includes(query) || phone.includes(query) || jersey.includes(query)
      );
    });
  }

  // 2. Lọc theo vị trí
  if (positionFilter.value !== "all") {
    result = result.filter((p) => p.position === positionFilter.value);
  }

  // 3. Sắp xếp
  result.sort((a, b) => {
    let comparison = 0;
    switch (sortBy.value) {
      case "name":
        const nameA = a.name ? a.name.toLowerCase() : "";
        const nameB = b.name ? b.name.toLowerCase() : "";
        comparison = nameA.localeCompare(nameB);
        break;
      case "jerseyNumber":
        comparison = (a.jerseyNumber || 999) - (b.jerseyNumber || 999);
        break;
      case "totalAttendance":
        comparison = (a.totalAttendance || 0) - (b.totalAttendance || 0);
        break;
      case "position":
        const posA = a.position || "";
        const posB = b.position || "";
        comparison = posA.localeCompare(posB);
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

// Nút Reset cứng dành cho Admin để fix lỗi cache
const handleHardReset = () => {
  playerStore.resetDatabase();
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

        <div class="mt-4 sm:mt-0 flex flex-wrap gap-3">
          <button
            v-if="authStore.isAdmin"
            @click="handleHardReset"
            class="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            title="Tải lại dữ liệu gốc từ file CSV (Xóa bộ nhớ tạm)"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Reset Data</span>
          </button>

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
          <button
            @click="handleHardReset"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700"
          >
            Thử tải lại từ gốc
          </button>
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
              <span class="text-xl">{{
                viewMode === "grid" ? "📋" : "🔲"
              }}</span>
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
      </div>

      <div class="flex items-center justify-between px-4">
        <p class="text-lg font-bold text-gray-700">
          Hiển thị <span class="text-indigo-600">{{ stats.filtered }}</span> /
          {{ stats.total }} cầu thủ
        </p>
      </div>

      <div
        v-if="stats.total === 0"
        class="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center"
      >
        <div
          class="inline-block p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mb-6"
        >
          <span class="text-6xl text-gray-300">📂</span>
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-2">
          Chưa có dữ liệu cầu thủ
        </h3>
        <p class="text-gray-600 mb-6">
          Hãy đảm bảo file
          <code class="px-2 py-1 bg-gray-200 rounded">public/players.csv</code>
          đã có dữ liệu.
        </p>
        <button
          @click="handleHardReset"
          class="text-indigo-600 font-bold hover:underline"
        >
          Thử tải lại dữ liệu
        </button>
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
            onerror="this.onerror=null; this.src='https://placehold.co/150';"
          />
          <div class="flex-1">
            <h3 class="text-xl font-black text-gray-900">{{ player.name }}</h3>
            <p class="text-sm text-gray-500">
              {{ player.position }} • {{ player.phone || "Chưa có SĐT" }}
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
