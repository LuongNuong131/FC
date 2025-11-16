<template>
  <div v-if="playerStore.loading" class="text-center">Đang tải...</div>
  <div v-if="playerStore.error" class="text-red-500">
    {{ playerStore.error }}
  </div>

  <div
    v-if="player && playerWithBMI"
    class="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg"
  >
    <div class="flex flex-col md:flex-row md:space-x-6">
      <div class="flex-shrink-0 md:w-1/3 text-center">
        <img
          :src="
            player.imageUrl ||
            'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'
          "
          :alt="player.name"
          class="w-48 h-48 rounded-full object-cover mx-auto border-4 border-gray-200 shadow-md"
          @error="
            ($event) =>
              ($event.target.src =
                'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image')
          "
        />
      </div>

      <div class="flex-1 mt-6 md:mt-0">
        <h1 class="text-4xl font-bold text-gray-900">{{ player.name }}</h1>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div><strong>SĐT:</strong> {{ player.phone || "N/A" }}</div>
          <div>
            <strong>Ngày sinh:</strong>
            {{
              player.dob && player.dob.toDate
                ? player.dob.toDate().toLocaleDateString("vi-VN")
                : "N/A"
            }}
          </div>
          <div>
            <strong>Chiều cao:</strong>
            {{ player.height_cm ? `${player.height_cm} cm` : "N/A" }}
          </div>
          <div>
            <strong>Cân nặng:</strong>
            {{ player.weight_kg ? `${player.weight_kg} kg` : "N/A" }}
          </div>
          <div>
            <strong>Tổng tham gia:</strong>
            <span class="font-bold text-indigo-600">{{
              player.totalAttendance || 0
            }}</span>
            buổi
          </div>
          <div>
            <strong>Số dư quỹ cá nhân:</strong>
            {{ formatCurrency(player.fundBalance || 0) }}
          </div>
        </div>

        <div v-if="playerWithBMI.bmi" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold">Chỉ số BMI</h3>
          <p class="text-3xl font-bold">{{ playerWithBMI.bmi }}</p>
          <span
            :class="bmiColorClass"
            class="mt-1 text-sm font-medium px-3 py-1 rounded-full inline-block"
          >
            {{ playerWithBMI.bmiStatus }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-8 pt-4 border-t flex justify-end space-x-4">
      <button @click="handleDelete" class="btn-danger">Xóa Cầu thủ</button>
      <router-link :to="`/players/${player.id}/edit`" class="btn-primary">
        Chỉnh sửa
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const props = defineProps({
  id: String,
});

const playerStore = usePlayerStore();
const router = useRouter();

const { player } = storeToRefs(playerStore);

onMounted(() => {
  playerStore.fetchPlayer(props.id);
});

const playerWithBMI = computed(() => {
  return player.value ? playerStore.getPlayerWithBMI(player.value) : null;
});

const bmiColorClass = computed(() => {
  if (!playerWithBMI.value) return "";
  const status = playerWithBMI.value.bmiStatus;
  if (status === "Bình thường") return "bg-green-100 text-green-800";
  if (status === "Thiếu cân") return "bg-blue-100 text-blue-800";
  if (status === "Thừa cân") return "bg-yellow-100 text-yellow-800";
  if (status === "Béo phì") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
});

const handleDelete = async () => {
  if (confirm(`Bạn có chắc muốn xóa cầu thủ ${player.value.name}?`)) {
    await playerStore.deletePlayer(props.id);
    router.push("/players");
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) value = 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};
</script>
