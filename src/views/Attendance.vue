<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-800">📋 Điểm Danh Buổi Tập</h1>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-xl font-semibold mb-4 border-b pb-2 text-blue-600">
        Tạo Buổi Điểm Danh Mới
      </h2>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label for="session-date" class="form-label">Ngày *</label>
            <input
              id="session-date"
              v-model="sessionForm.date"
              type="date"
              class="form-input"
              required
            />
          </div>
          <div class="md:col-span-2">
            <label for="session-note" class="form-label">Ghi Chú</label>
            <input
              id="session-note"
              v-model="sessionForm.note"
              type="text"
              class="form-input"
              placeholder="Ví dụ: Đá tập công viên Hoàng Văn Thụ"
            />
          </div>
        </div>

        <h3 class="text-lg font-medium mb-3">Danh Sách Cầu Thủ:</h3>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 border rounded-lg bg-gray-50"
        >
          <div
            v-for="player in playerStore.players"
            :key="player.id"
            class="flex items-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200"
          >
            <input
              type="checkbox"
              :id="player.id"
              :value="player.id"
              v-model="sessionForm.attendees"
              class="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              :for="player.id"
              class="ml-3 text-sm font-medium text-gray-700 select-none cursor-pointer truncate"
            >
              {{ player.name }}
            </label>
          </div>
        </div>

        <p
          v-if="playerStore.players.length === 0 && !playerStore.loading"
          class="text-center text-red-500 mt-4"
        >
          Vui lòng thêm cầu thủ vào file public/players.csv trước khi điểm danh.
        </p>

        <button
          type="submit"
          :disabled="!isFormValid || attendanceStore.loading"
          class="btn-primary mt-6 w-full"
        >
          {{ attendanceStore.loading ? "Đang lưu..." : "Lưu Buổi Điểm Danh" }}
        </button>
      </form>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">
        Lịch Sử Các Buổi Tập ({{ attendanceStore.sessions.length }})
      </h2>

      <div id="attendance-report-area">
        <ul
          v-if="attendanceStore.sessions.length > 0"
          class="divide-y divide-gray-200"
        >
          <li
            v-for="session in attendanceStore.sessions"
            :key="session.id"
            class="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div class="flex-1 mr-4 mb-2 sm:mb-0">
              <p class="text-lg font-medium text-gray-800">
                🗓️ Ngày: {{ formatDate(session.date) }}
                <span class="text-sm font-normal text-gray-500 ml-2"
                  >({{ session.attendees.length }} người tham gia)</span
                >
              </p>
              <p v-if="session.note" class="text-sm italic text-gray-600">
                Ghi chú: {{ session.note }}
              </p>

              <div class="mt-2 text-sm text-gray-700">
                <strong>Tham gia:</strong>
                <span class="block sm:inline">{{
                  getAttendeeNames(session.attendees).join(", ")
                }}</span>
              </div>
            </div>

            <div
              class="space-x-2 flex-shrink-0 w-full sm:w-auto flex justify-end"
            >
              <button
                @click="attendanceStore.exportSessionToExcel(session.id)"
                class="btn-secondary py-1 px-3 text-sm"
              >
                Xuất Excel
              </button>
            </div>
          </li>
        </ul>
        <div v-else class="text-center text-gray-500">
          Chưa có buổi điểm danh nào.
        </div>
      </div>

      <div class="mt-6 border-t pt-4">
        <button
          @click="handleExportImage"
          :disabled="attendanceStore.loading"
          class="btn-primary py-2 px-4 w-full"
        >
          {{
            attendanceStore.loading
              ? "Đang tạo ảnh..."
              : "📸 Xuất Ảnh TỔNG HỢP Lịch Sử Điểm Danh"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useAttendanceStore } from "@/stores/attendanceStore";

const playerStore = usePlayerStore();
const attendanceStore = useAttendanceStore();

const sessionForm = reactive({
  date: new Date().toISOString().split("T")[0],
  note: "",
  attendees: [],
});

const isFormValid = computed(() => {
  return sessionForm.date && sessionForm.attendees.length > 0;
});

onMounted(() => {
  playerStore.fetchPlayers();
  attendanceStore.fetchSessions();
});

const handleSubmit = async () => {
  await attendanceStore.addSession(sessionForm);

  if (!attendanceStore.error) {
    alert("Lưu buổi điểm danh thành công!");
    sessionForm.note = "";
    sessionForm.attendees = [];
  } else {
    alert(`Lỗi: ${attendanceStore.error}`);
  }
};

const getAttendeeNames = (attendeeIds) => {
  return attendeeIds.map((id) => {
    const player = playerStore.players.find((p) => p.id === id);
    return player ? player.name : `[ID:${id} - Không tồn tại]`;
  });
};

const handleExportImage = () => {
  attendanceStore.exportToImage(
    "attendance-report-area",
    "Lich_Su_Diem_Danh_Tong_Hop"
  );
};

const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date;
};
</script>
