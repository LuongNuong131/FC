<script setup>
import { ref, onMounted, computed } from "vue";
import { useFundStore } from "@/stores/fundStore";
import { useAuthStore } from "@/stores/authStore";
import Modal from "@/components/Modal.vue";

const fundStore = useFundStore();
const authStore = useAuthStore();

// --- State ---
const contributionForm = ref({
  date: new Date().toISOString().split("T")[0],
  contributor: authStore.user?.displayName || "",
  amount: 0,
  note: "",
  imageUrl: "",
});

const imageModal = ref({
  show: false,
  url: "",
  title: "",
});

const isFormValid = computed(() => {
  // Cho phép số âm (chi tiêu)
  return (
    contributionForm.value.date &&
    contributionForm.value.contributor &&
    parseFloat(contributionForm.value.amount) !== 0
  );
});

// --- Methods ---
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  fundStore.addContribution(contributionForm.value);

  // Reset form
  contributionForm.value = {
    date: new Date().toISOString().split("T")[0],
    contributor: authStore.user?.displayName || "",
    amount: 0,
    note: "",
    imageUrl: "",
  };
  alert("Đã thêm giao dịch vào bộ nhớ tạm. Vui lòng Xuất CSV để lưu trữ!");
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getBackgroundColor = (amount) => {
  if (amount > 0)
    return "bg-green-50/70 border-green-200 border-l-4 border-green-500";
  if (amount < 0)
    return "bg-red-50/70 border-red-200 border-l-4 border-red-500";
  return "bg-gray-50/70 border-gray-200 border-l-4 border-gray-500";
};

const handleExport = () => {
  fundStore.exportFundToCSV();
};

const showImageModal = (url, contributor) => {
  imageModal.value.url = url;
  imageModal.value.title = `Biên Lai/Ảnh Đóng Góp của ${contributor}`;
  imageModal.value.show = true;
};

// --- Lifecycle ---
onMounted(() => {
  fundStore.fetchContributions();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div
      class="relative overflow-hidden bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-3xl shadow-2xl p-8"
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

      <div
        class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-5xl font-black text-white mb-2 flex items-center">
            <span class="text-6xl mr-4">💰</span>
            Quản Lý Quỹ Nhóm
          </h1>
          <p class="text-white/90 text-xl">
            Theo dõi dòng tiền và lịch sử đóng góp của đội
          </p>
        </div>

        <div class="mt-4 sm:mt-0 flex flex-col items-end">
          <h2
            :class="[
              'text-4xl sm:text-5xl font-black drop-shadow-lg transition-colors duration-500',
              fundStore.totalFund >= 0 ? 'text-green-300' : 'text-red-300',
            ]"
          >
            {{ fundStore.formattedTotalFund }}
          </h2>
          <p class="text-white/90 font-semibold text-lg">Tổng Quỹ Hiện Tại</p>
        </div>
      </div>
    </div>

    <!-- Add Transaction Form (Admin Only) -->
    <div
      v-if="authStore.isAdmin"
      class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-teal-500 to-cyan-600 p-6">
        <h2 class="text-2xl font-black text-white flex items-center">
          <span class="text-3xl mr-3">✏️</span>
          Thêm Giao Dịch Mới
        </h2>
        <p class="text-teal-100 mt-1">
          Lưu ý: Số dương là Đóng góp, Số âm là Chi tiêu (ví dụ: -100000).
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >Ngày *</label
            >
            <input
              v-model="contributionForm.date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div class="md:col-span-1">
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >Người Đóng Góp *</label
            >
            <input
              v-model="contributionForm.contributor"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="VD: Trần Quang Lương"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >Số Tiền (VND) * (Dương: Thu, Âm: Chi)</label
            >
            <input
              v-model="contributionForm.amount"
              type="number"
              step="1000"
              class="w-full px-3 py-2 text-2xl font-black text-green-600 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="VD: 500000 hoặc -100000"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >Ghi Chú</label
            >
            <input
              v-model="contributionForm.note"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="VD: Quỹ tháng 11, tiền phạt..."
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >Link Ảnh/Biên Lai (Tùy chọn)</label
            >
            <input
              v-model="contributionForm.imageUrl"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://link.den.anh/bienlai.jpg"
            />
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            @click="handleExport"
            :disabled="fundStore.contributions.length === 0"
            class="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            💾 Xuất CSV Quỹ Nhóm
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="px-8 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50 transform hover:scale-105"
          >
            + Thêm Giao Dịch
          </button>
        </div>
      </form>
    </div>

    <!-- Transaction History -->
    <div
      class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <h2 class="text-3xl font-black text-white flex items-center">
          <span class="text-3xl mr-3">📜</span>
          Lịch Sử Giao Dịch ({{ fundStore.contributions.length }})
        </h2>
        <p class="text-purple-100 mt-1 text-sm">
          Hiển thị các giao dịch mới nhất (Đang ở trong bộ nhớ tạm).
        </p>
      </div>

      <div v-if="fundStore.loading" class="text-center py-10">
        <div
          class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"
        ></div>
        Đang tải dữ liệu quỹ nhóm...
      </div>

      <div
        v-else-if="fundStore.error"
        class="bg-red-50 border-l-4 border-red-500 p-4 text-red-700"
      >
        Lỗi: {{ fundStore.error }}
      </div>

      <div v-else class="p-6">
        <div
          v-if="fundStore.contributions.length === 0"
          class="text-center py-10 text-gray-400"
        >
          <p class="text-5xl mb-3">💸</p>
          <p class="text-xl font-semibold">
            Chưa có giao dịch nào được ghi nhận.
          </p>
          <p class="text-sm text-gray-500 mt-2">
            Hãy dùng form bên trên để bắt đầu thêm giao dịch (Admin).
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(item, index) in fundStore.contributions"
            :key="item.id"
            :class="[
              'flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]',
              getBackgroundColor(item.amount),
            ]"
          >
            <div class="flex items-center space-x-4 flex-1 min-w-0">
              <div
                v-if="item.imageUrl"
                class="flex-shrink-0 cursor-pointer"
                @click="showImageModal(item.imageUrl, item.contributor)"
              >
                <img
                  :src="item.imageUrl"
                  :alt="item.contributor"
                  class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md transition-shadow duration-300 hover:shadow-xl"
                  onerror="this.onerror=null; this.src='https://placehold.co/150x150/e2e8f0/94a3b8?text=Receipt';"
                />
              </div>
              <div class="min-w-0">
                <p class="text-sm text-gray-500 font-semibold truncate">
                  {{ formatDate(item.date) }}
                </p>
                <h3 class="text-lg font-black text-gray-800 truncate">
                  {{ item.contributor }}
                </h3>
                <p class="text-sm text-gray-600 italic truncate">
                  {{ item.note || "Không ghi chú" }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  Tạo lúc: {{ formatDateTime(item.createdAt) }}
                </p>
              </div>
            </div>

            <div class="text-right mt-2 sm:mt-0">
              <p
                :class="[
                  'text-2xl font-black',
                  item.amount > 0
                    ? 'text-green-600'
                    : item.amount < 0
                    ? 'text-red-600'
                    : 'text-gray-600',
                ]"
              >
                {{ formatCurrency(Math.abs(item.amount)) }}
              </p>
              <p class="text-xs text-gray-500 font-semibold">
                {{
                  item.amount > 0
                    ? "Đóng góp"
                    : item.amount < 0
                    ? "Chi tiêu"
                    : "Giao dịch 0"
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Modal -->
  <Modal
    :show="imageModal.show"
    @close="imageModal.show = false"
    :title="imageModal.title"
    maxWidth="4xl"
  >
    <div class="flex justify-center p-4">
      <img
        :src="imageModal.url"
        :alt="imageModal.title"
        class="max-w-full h-auto rounded-xl shadow-2xl"
        onerror="this.onerror=null; this.src='https://placehold.co/800x800/e2e8f0/94a3b8?text=No+Image';"
      />
    </div>
  </Modal>
</template>
