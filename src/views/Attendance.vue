<script setup>
import { ref, computed, onMounted } from "vue";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { usePlayerStore } from "@/stores/playerStore";

// Stores
const attendanceStore = useAttendanceStore();
const playerStore = usePlayerStore();

// Session Form
const sessionForm = ref({
  date: new Date().toISOString().split("T")[0],
  note: "",
  attendees: [],
});

// Computed
const isFormValid = computed(() => {
  return sessionForm.value.date && sessionForm.value.attendees.length > 0;
});

// Hàm tạo độ trễ (delay)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getAttendeeNames = (attendeeIds) => {
  return attendeeIds
    .map((id) => {
      const player = playerStore.players.find((p) => p.id === id);
      return player ? player.name : null;
    })
    .filter(Boolean);
};

const selectAll = () => {
  sessionForm.value.attendees = playerStore.players.map((p) => p.id);
};

const deselectAll = () => {
  sessionForm.value.attendees = [];
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  attendanceStore.addSession({
    date: sessionForm.value.date,
    note: sessionForm.value.note,
    attendees: sessionForm.value.attendees,
  });

  // Reset form
  sessionForm.value = {
    date: new Date().toISOString().split("T")[0],
    note: "",
    attendees: [],
  };
};

const confirmDelete = (sessionId) => {
  if (
    confirm(
      "Bạn có chắc chắn muốn xóa buổi tập này khỏi BỘ NHỚ TẠM? Hành động này không xóa khỏi CSV gốc."
    )
  ) {
    attendanceStore.removeSession(sessionId);
  }
};

const handleExportPlayers = () => {
  playerStore.exportPlayersToCSV();
};

const handleExportSessions = () => {
  attendanceStore.exportSessionsToCSV();
};

// Cập nhật logic: Tự động mở details trước khi chụp ảnh, có thêm delay
const handleExportImage = async (sessionId) => {
  const elementId = `session-report-${sessionId}`;
  const sessionToExport = attendanceStore.sessions.find(
    (s) => s.id === sessionId
  );
  if (!sessionToExport) return;

  const element = document.getElementById(elementId);
  if (!element) {
    alert(`Lỗi: Không tìm thấy nội dung báo cáo!`);
    return;
  }

  // 1. Tìm thẻ <details> bên trong session item và mở nó
  const detailsElement = element.querySelector("details");
  const wasOpen = detailsElement ? detailsElement.open : false;
  if (detailsElement) {
    detailsElement.open = true;
  }

  try {
    // 2. THÊM ĐỘ TRỄ NHỎ để trình duyệt kịp render nội dung vừa mở
    await delay(150); // Chờ 150ms

    // 3. Xuất ảnh
    await attendanceStore.exportToImage(
      elementId,
      `buoi-tap-${sessionToExport.date}`
    );
  } catch (e) {
    console.error(e);
  } finally {
    // 4. Đóng lại thẻ <details> (hoặc reset về trạng thái ban đầu)
    if (detailsElement && !wasOpen) {
      detailsElement.open = false;
    }
  }
};

// Lifecycle
onMounted(async () => {
  await playerStore.fetchPlayers();
  await attendanceStore.fetchSessions();
});
</script>

<template>
  <div class="space-y-8">
    <div
      class="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-8"
    >
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"
        ></div>
      </div>

      <div class="relative z-10">
        <h1 class="text-5xl font-black text-white mb-2 flex items-center">
          <span class="text-6xl mr-4 animate-bounce">📋</span>
          Điểm Danh Buổi Tập
        </h1>
        <p class="text-green-100 text-lg">
          Quản lý attendance hiệu quả và chuyên nghiệp
        </p>
      </div>
    </div>

    <transition name="slide-down">
      <div
        v-if="attendanceStore.lastConfirmedSession"
        class="relative overflow-hidden bg-white rounded-2xl shadow-2xl border-l-8 border-green-500"
      >
        <div
          class="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50"
        ></div>

        <div class="relative p-6">
          <button
            @click="
              attendanceStore.lastConfirmedSession = null;
              localStorage.removeItem('lastConfirmedSession');
            "
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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

          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div
                class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-scale-in"
              >
                <svg
                  class="w-9 h-9 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div class="flex-1 pt-1">
              <h3 class="text-2xl font-black text-gray-900 mb-2">
                Đã Điểm Danh! 💾 Chỉ lưu vào bộ nhớ!
              </h3>
              <p class="text-gray-700 mb-1">
                Ngày:
                <strong class="text-green-600">{{
                  formatDate(attendanceStore.lastConfirmedSession.date)
                }}</strong>
              </p>
              <p class="text-sm text-gray-600 mb-4">
                🎉 Đã cập nhật
                <strong class="text-green-600">tổng tham gia</strong> của cầu
                thủ trong bộ nhớ tạm (memory).
              </p>

              <div
                class="bg-yellow-50 rounded-xl p-3 shadow-inner border border-yellow-200"
              >
                <p class="text-sm font-bold text-yellow-800 flex items-center">
                  <span class="text-xl mr-2">⚠️</span>
                  QUAN TRỌNG: Dữ liệu này **CHƯA** được lưu vĩnh viễn vào CSV.
                  Vui lòng bấm
                  <strong class="mx-1 text-red-600">"Xuất CSV Lịch Sử"</strong>
                  sau đó copy vào `public/` để lưu!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div
      class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <h2 class="text-3xl font-black text-white flex items-center">
          <svg
            class="w-8 h-8 mr-3"
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
          Tạo Buổi Điểm Danh Mới
        </h2>
        <p class="text-indigo-100 mt-1">Chọn ngày và cầu thủ tham gia</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="group">
            <label
              for="session-date"
              class="block text-sm font-bold text-gray-700 mb-2 flex items-center"
            >
              <svg
                class="w-4 h-4 mr-2 text-indigo-600"
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
              Ngày Tập *
            </label>
            <input
              id="session-date"
              v-model="sessionForm.date"
              type="date"
              class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all group-hover:border-indigo-400"
              required
            />
          </div>

          <div class="md:col-span-2 group">
            <label
              for="session-note"
              class="block text-sm font-bold text-gray-700 mb-2 flex items-center"
            >
              <svg
                class="w-4 h-4 mr-2 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Ghi Chú (không bắt buộc)
            </label>
            <input
              id="session-note"
              v-model="sessionForm.note"
              type="text"
              class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all group-hover:border-indigo-400"
              placeholder="VD: Đá tập công viên Hoàng Văn Thụ, luyện tập phòng ngự..."
            />
          </div>
        </div>

        <div class="mb-8">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b-2 border-gray-100"
          >
            <div>
              <h3 class="text-xl font-bold text-gray-900 flex items-center">
                <svg
                  class="w-6 h-6 mr-2 text-indigo-600"
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
                Chọn Cầu Thủ
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                Đã chọn:
                <strong class="text-indigo-600 text-lg">{{
                  sessionForm.attendees.length
                }}</strong>
                / {{ playerStore.players.length }}
              </p>
            </div>

            <div class="flex space-x-2 mt-3 sm:mt-0">
              <button
                type="button"
                @click="selectAll"
                class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
              >
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Chọn Tất Cả
              </button>
              <button
                type="button"
                @click="deselectAll"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors duration-300 flex items-center"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Bỏ Chọn
              </button>
            </div>
          </div>

          <div
            v-if="playerStore.players.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
          >
            <label
              v-for="player in playerStore.players"
              :key="player.id"
              class="group relative flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 border-2 transform hover:scale-105"
              :class="
                sessionForm.attendees.includes(player.id)
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50'
                  : 'border-transparent hover:border-indigo-200'
              "
            >
              <input
                type="checkbox"
                :id="player.id"
                :value="player.id"
                v-model="sessionForm.attendees"
                class="h-5 w-5 text-indigo-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              />

              <div class="ml-3 flex-1 min-w-0">
                <p
                  class="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors"
                >
                  {{ player.name }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <span
                    v-if="player.jerseyNumber"
                    class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full"
                    >#{{ player.jerseyNumber }}</span
                  >
                  <span
                    v-if="player.position"
                    class="text-xs text-gray-500 truncate"
                    >{{ player.position }}</span
                  >
                </div>
              </div>

              <div
                v-if="sessionForm.attendees.includes(player.id)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-scale-in"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </label>
          </div>

          <div
            v-else
            class="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
          >
            <div class="text-6xl mb-4">👥</div>
            <p class="text-xl font-semibold text-gray-600 mb-2">
              Chưa có cầu thủ
            </p>
            <p class="text-gray-500 mb-4">
              Vui lòng thêm cầu thủ vào file players.csv
            </p>
            <a
              href="/players.csv"
              download
              class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Tải File Mẫu
            </a>
          </div>
        </div>

        <button
          type="submit"
          :disabled="!isFormValid || attendanceStore.loading"
          class="relative w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-black rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 overflow-hidden group"
        >
          <div
            class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          ></div>
          <span class="relative flex items-center justify-center">
            <svg
              v-if="!attendanceStore.loading"
              class="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div
              v-else
              class="w-6 h-6 mr-2 border-3 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            {{
              attendanceStore.loading ? "Đang Lưu..." : "💾 Lưu Buổi Điểm Danh"
            }}
          </span>
        </button>
      </form>
    </div>

    <div
      class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="text-3xl font-black text-white flex items-center">
              <svg
                class="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Lịch Sử Điểm Danh
            </h2>
            <p class="text-purple-100 mt-1">
              Tổng cộng
              <strong>{{ attendanceStore.sessions.length }}</strong> buổi tập.
              **LƯU Ý: Đây là data trong bộ nhớ tạm**
            </p>
          </div>

          <div class="flex space-x-2 mt-3 sm:mt-0">
            <button
              @click="handleExportPlayers"
              :disabled="playerStore.players.length === 0"
              class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center border border-yellow-300 shadow-lg"
              :class="{
                'opacity-50 cursor-not-allowed':
                  playerStore.players.length === 0,
              }"
            >
              <svg
                class="w-4 h-4 mr-2"
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
              Xuất CSV Cầu Thủ
            </button>

            <button
              @click="handleExportSessions"
              :disabled="attendanceStore.sessions.length === 0"
              class="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-xl transition-all duration-300 flex items-center border border-white/30 shadow-lg"
              :class="{
                'opacity-50 cursor-not-allowed':
                  attendanceStore.sessions.length === 0,
              }"
            >
              <svg
                class="w-4 h-4 mr-2"
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
              Xuất CSV Lịch Sử
            </button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="attendanceStore.sessions.length > 0" class="space-y-4">
          <div
            v-for="(session, index) in attendanceStore.sessions"
            :key="session.id"
            :id="`session-report-${session.id}`"
            class="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <div
              class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600"
            ></div>

            <div class="p-6 pl-8">
              <div
                class="flex flex-col lg:flex-row lg:items-center lg:justify-between"
              >
                <div class="flex-1 mb-4 lg:mb-0">
                  <div class="flex items-center space-x-3 mb-2">
                    <div
                      class="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold"
                    >
                      <svg
                        class="w-4 h-4 mr-2"
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
                    </div>

                    <div
                      class="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold"
                    >
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
                    </div>
                  </div>

                  <p
                    v-if="session.note"
                    class="text-gray-700 italic mb-3 flex items-start"
                  >
                    <svg
                      class="w-4 h-4 mr-2 mt-1 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <span>{{ session.note }}</span>
                  </p>

                  <details class="group/details">
                    <summary
                      class="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
                    >
                      <svg
                        class="w-4 h-4 mr-1 transform group-open/details:rotate-90 transition-transform"
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
                      Xem danh sách
                    </summary>
                    <div class="mt-3 flex flex-wrap gap-2 forced-render-list">
                      <span
                        v-for="name in getAttendeeNames(session.attendees)"
                        :key="name"
                        class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                      >
                        <span
                          class="w-2 h-2 bg-green-500 rounded-full mr-2"
                        ></span>
                        {{ name }}
                      </span>
                    </div>
                  </details>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    @click="handleExportImage(session.id)"
                    class="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                    title="Xuất ảnh báo cáo"
                  >
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    Xuất Ảnh
                  </button>

                  <button
                    @click="attendanceStore.exportSessionToExcel(session.id)"
                    class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                    title="Xuất CSV báo cáo chi tiết"
                  >
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    CSV Report
                  </button>

                  <button
                    @click="confirmDelete(session.id)"
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
                    title="Xóa khỏi bộ nhớ tạm"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-20">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p class="text-xl font-semibold text-gray-600 mb-2">
            Chưa có buổi điểm danh nào
          </p>
          <p class="text-gray-500">
            Tạo buổi điểm danh đầu tiên bằng form bên trên
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animations */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes scale-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* THÊM CSS NÀY để buộc render đúng, tránh lỗi font và layout */
.forced-render-list {
  transform: translateZ(0);
  /* Webkit hack to fix blurry text/missing elements issue in html2canvas */
  -webkit-font-smoothing: antialiased;
}
</style>
