<script setup>
import { computed } from "vue";
import Modal from "@/components/Modal.vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter } from "vue-router";

const props = defineProps({
  show: Boolean,
  session: Object,
});

const emit = defineEmits(["close"]);
const playerStore = usePlayerStore();
const router = useRouter();

const formattedDate = computed(() => {
  if (!props.session?.date) return "N/A";
  const date = new Date(props.session.date);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const attendees = computed(() => {
  if (!props.session?.attendees) return [];
  return props.session.attendees
    .map((id) => {
      const player = playerStore.players.find((p) => p.id === id);
      return player || { id, name: "Unknown Player", jerseyNumber: "N/A" };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
});

const handleViewPlayer = (playerId) => {
  emit("close");
  router.push(`/players/${playerId}`);
};

const getPositionColorClass = (position) => {
  const colors = {
    Forward: "bg-red-100 text-red-700 border-red-300",
    Midfielder: "bg-blue-100 text-blue-700 border-blue-300",
    Defender: "bg-green-100 text-green-700 border-green-300",
    Goalkeeper: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };
  return colors[position] || "bg-gray-100 text-gray-700 border-gray-300";
};
</script>

<template>
  <Modal
    :show="show"
    @close="emit('close')"
    title="Chi Tiết Buổi Tập"
    maxWidth="4xl"
  >
    <div v-if="session" class="space-y-6">
      <!-- Session Info -->
      <div
        class="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 shadow-lg"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <p
              class="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2"
            >
              📅 Ngày tập
            </p>
            <p class="text-2xl font-black text-indigo-900 mb-3">
              {{ formattedDate }}
            </p>

            <p
              class="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2"
            >
              📝 Ghi chú
            </p>
            <p class="text-lg text-gray-700 italic">
              {{ session.note || "Không có ghi chú" }}
            </p>
          </div>

          <div
            class="flex-shrink-0 text-center bg-white rounded-2xl p-4 shadow-lg border-2 border-indigo-200"
          >
            <div class="text-5xl font-black text-indigo-600">
              {{ attendees.length }}
            </div>
            <p class="text-sm font-bold text-gray-600 mt-1">Người tham gia</p>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-3 mt-4">
          <div class="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-center">
            <p class="text-2xl font-black text-green-600">
              {{
                attendees.filter((p) => p.position === "Forward").length || 0
              }}
            </p>
            <p class="text-xs font-semibold text-gray-600">Tiền đạo</p>
          </div>
          <div class="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-center">
            <p class="text-2xl font-black text-blue-600">
              {{
                attendees.filter((p) => p.position === "Midfielder").length || 0
              }}
            </p>
            <p class="text-xs font-semibold text-gray-600">Tiền vệ</p>
          </div>
          <div class="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-center">
            <p class="text-2xl font-black text-purple-600">
              {{
                attendees.filter((p) => p.position === "Defender").length || 0
              }}
            </p>
            <p class="text-xs font-semibold text-gray-600">Hậu vệ</p>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div
        class="flex items-center justify-between pb-3 border-b-2 border-gray-200"
      >
        <h4 class="text-2xl font-black text-gray-800 flex items-center">
          <span class="text-4xl mr-3">✅</span>
          Danh Sách Tham Gia
        </h4>
        <span
          class="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-black rounded-full text-lg shadow-lg"
        >
          {{ attendees.length }} cầu thủ
        </span>
      </div>

      <!-- Player Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2"
      >
        <div
          v-for="player in attendees"
          :key="player.id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-2xl border-l-4 border-green-500 p-4 transition-all duration-300 cursor-pointer group transform hover:scale-105"
          @click="handleViewPlayer(player.id)"
        >
          <!-- Player Header -->
          <div class="flex items-center space-x-3 mb-3">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform"
            >
              #{{ player.jerseyNumber || "?" }}
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="font-black text-gray-800 truncate text-lg group-hover:text-green-600 transition-colors"
              >
                {{ player.name }}
              </p>
              <p
                :class="[
                  'text-xs font-semibold px-2 py-1 rounded-full inline-block border',
                  getPositionColorClass(player.position),
                ]"
              >
                {{ player.position || "Vị trí N/A" }}
              </p>
            </div>
          </div>

          <!-- Player Stats -->
          <div
            class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100"
          >
            <div class="text-center bg-gray-50 rounded-lg p-2">
              <p class="text-xs text-gray-500 font-semibold">Tổng buổi</p>
              <p class="text-lg font-black text-indigo-600">
                {{ player.totalAttendance || 0 }}
              </p>
            </div>
            <div class="text-center bg-gray-50 rounded-lg p-2">
              <p class="text-xs text-gray-500 font-semibold">SĐT</p>
              <p class="text-xs font-bold text-gray-700 truncate">
                {{ player.phone || "N/A" }}
              </p>
            </div>
          </div>

          <!-- View Detail Arrow -->
          <div class="mt-3 flex items-center justify-center">
            <span
              class="text-xs font-bold text-gray-400 group-hover:text-green-600 transition-colors flex items-center"
            >
              Xem chi tiết
              <svg
                class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="attendees.length === 0"
        class="text-center py-16 bg-gray-50 rounded-2xl"
      >
        <p class="text-6xl mb-4">🤷</p>
        <p class="text-xl font-bold text-gray-600">
          Không có cầu thủ nào tham gia buổi này
        </p>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
/* Custom scrollbar for player list */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #10b981, #059669);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #059669, #047857);
}
</style>
