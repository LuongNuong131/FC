<template>
  <div class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
      {{ isEditing ? "Cập nhật Cầu thủ" : "Thêm Cầu thủ mới" }}
    </h1>

    <div v-if="loadingOnMount" class="text-center">Đang tải dữ liệu...</div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label for="name" class="form-label">Tên Cầu Thủ</label>
          <input
            id="name"
            v-model="playerData.name"
            type="text"
            class="form-input"
            required
          />
        </div>

        <div>
          <label for="phone" class="form-label">Số điện thoại</label>
          <input
            id="phone"
            v-model="playerData.phone"
            type="tel"
            class="form-input"
          />
        </div>

        <div>
          <label for="dob" class="form-label">Ngày sinh</label>
          <input
            id="dob"
            v-model="playerData.dob"
            type="date"
            class="form-input"
          />
        </div>

        <div>
          <label for="height" class="form-label">Chiều cao (cm)</label>
          <input
            id="height"
            v-model.number="playerData.height_cm"
            type="number"
            class="form-input"
            placeholder="Vd: 175"
          />
        </div>

        <div>
          <label for="weight" class="form-label">Cân nặng (kg)</label>
          <input
            id="weight"
            v-model.number="playerData.weight_kg"
            type="number"
            class="form-input"
            placeholder="Vd: 70"
          />
        </div>

        <div class="md:col-span-2">
          <label for="imageUrl" class="form-label">URL Ảnh đại diện</label>
          <input
            id="imageUrl"
            v-model="playerData.imageUrl"
            type="text"
            class="form-input"
            placeholder="Dán link ảnh tại đây (vd: placehold.co/150)"
          />

          <div v-if="playerData.imageUrl" class="mt-4">
            <p class="text-sm text-gray-500 mb-1">Ảnh xem trước:</p>
            <img
              :src="playerData.imageUrl"
              class="h-32 w-32 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end space-x-4">
        <button type="button" @click="router.back()" class="btn-secondary">
          Hủy
        </button>
        <button
          type="submit"
          :disabled="playerStore.loading"
          class="btn-primary"
        >
          {{
            playerStore.loading
              ? "Đang lưu..."
              : isEditing
              ? "Cập nhật"
              : "Thêm mới"
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter, useRoute } from "vue-router";

const playerStore = usePlayerStore();
const router = useRouter();
const route = useRoute();

const isEditing = ref(false);
const playerId = ref(null);
const loadingOnMount = ref(false);

const playerData = reactive({
  name: "",
  phone: "",
  dob: "",
  height_cm: null,
  weight_kg: null,
  imageUrl: "",
});

onMounted(async () => {
  if (route.params.id) {
    loadingOnMount.value = true;
    isEditing.value = true;
    playerId.value = route.params.id;

    playerStore.fetchPlayer(playerId.value);

    if (playerStore.player) {
      Object.assign(playerData, playerStore.player);
      // Chuyển đổi Date Object sang định dạng yyyy-mm-dd cho input type="date"
      if (playerData.dob instanceof Date) {
        playerData.dob = playerData.dob.toISOString().split("T")[0];
      }
    }
    loadingOnMount.value = false;
  } else {
    Object.assign(playerData, {
      name: "",
      phone: "",
      dob: "",
      height_cm: null,
      weight_kg: null,
      imageUrl: "",
    });
  }
});

const handleSubmit = async () => {
  const dataToSubmit = { ...playerData };

  if (dataToSubmit.dob) {
    dataToSubmit.dob = new Date(dataToSubmit.dob);
  }

  if (isEditing.value) {
    await playerStore.updatePlayer(playerId.value, dataToSubmit);
  } else {
    await playerStore.addPlayer(dataToSubmit);
  }
  router.push("/players");
};
</script>
