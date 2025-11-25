<template>
  <div class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
      {{ isEditing ? "Cập nhật Cầu thủ" : "Thêm Cầu thủ mới" }}
    </h1>

    <div v-if="loadingOnMount" class="text-center">
      <div
        class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"
      ></div>
      Đang tải dữ liệu...
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label for="name" class="form-label">Tên Cầu Thủ *</label>
          <input
            id="name"
            v-model="playerData.name"
            type="text"
            class="form-input"
            required
          />
        </div>

        <div>
          <label for="position" class="form-label">Vị trí *</label>
          <select
            id="position"
            v-model="playerData.position"
            class="form-input"
            required
          >
            <option disabled value="">Chọn vị trí</option>
            <option value="Forward">Forward (Tiền đạo)</option>
            <option value="Midfielder">Midfielder (Tiền vệ)</option>
            <option value="Defender">Defender (Hậu vệ)</option>
            <option value="Goalkeeper">Goalkeeper (Thủ môn)</option>
          </select>
        </div>

        <div>
          <label for="jerseyNumber" class="form-label">Số áo</label>
          <input
            id="jerseyNumber"
            v-model.number="playerData.jerseyNumber"
            type="number"
            class="form-input"
            placeholder="Vd: 10"
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
          <label for="dob" class="form-label">Ngày sinh (YYYY-MM-DD)</label>
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
              @error="
                ($event) =>
                  ($event.target.src =
                    'https://placehold.co/150x150/e2e8f0/94a3b8?text=No+Image')
              "
            />
          </div>
        </div>
      </div>

      <div
        class="mt-6 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500 text-sm text-yellow-800 font-semibold"
      >
        ⚠️ Sau khi thêm/cập nhật, bạn cần bấm nút
        <strong class="text-red-600">"Xuất CSV Cầu Thủ"</strong> ở trang Danh
        sách để lưu trữ vĩnh viễn dữ liệu mới này.
      </div>

      <div class="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          @click="router.push('/players')"
          class="btn-secondary"
        >
          Hủy
        </button>
        <button
          type="submit"
          :disabled="
            playerStore.loading || !playerData.name || !playerData.position
          "
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
import { ref, reactive, onMounted, computed } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter, useRoute } from "vue-router";

const props = defineProps({
  id: String,
  isEditing: Boolean,
});

const playerStore = usePlayerStore();
const router = useRouter();
const route = useRoute();

const isEditing = ref(props.isEditing);
const playerId = computed(() => props.id);
const loadingOnMount = ref(false);

const playerData = reactive({
  name: "",
  phone: "",
  dob: "",
  height_cm: null,
  weight_kg: null,
  position: "",
  jerseyNumber: null,
  imageUrl: "",
});

const loadPlayerData = async () => {
  // Luôn fetch lại players để đảm bảo data mới nhất
  await playerStore.fetchPlayers();

  if (playerId.value && props.isEditing) {
    loadingOnMount.value = true;
    isEditing.value = true;

    // Lấy player từ store sau khi fetch
    const existingPlayer = playerStore.players.find(
      (p) => p.id === playerId.value
    );

    if (existingPlayer) {
      // Cập nhật reactive object
      Object.assign(playerData, {
        ...existingPlayer,
        // Chuyển Date Object sang định dạng yyyy-mm-dd cho input type="date"
        dob:
          existingPlayer.dob instanceof Date && !isNaN(existingPlayer.dob)
            ? existingPlayer.dob.toISOString().split("T")[0]
            : "",
        // Ensure numbers are null if zero/empty to avoid error
        height_cm: existingPlayer.height_cm || null,
        weight_kg: existingPlayer.weight_kg || null,
        jerseyNumber: existingPlayer.jerseyNumber || null,
      });
    } else {
      // Trường hợp không tìm thấy player khi edit
      alert("Không tìm thấy cầu thủ để sửa!");
      router.push("/players");
    }
    loadingOnMount.value = false;
  } else {
    isEditing.value = false;
    // Reset form cho chế độ thêm mới
    Object.assign(playerData, {
      name: "",
      phone: "",
      dob: "",
      height_cm: null,
      weight_kg: null,
      position: "",
      jerseyNumber: null,
      imageUrl: "",
    });
  }
};

onMounted(loadPlayerData);

const handleSubmit = async () => {
  const dataToSubmit = {
    ...playerData,
    // Chuyển string date về format Date object hoặc null cho store
    dob: playerData.dob ? new Date(playerData.dob) : null,
  };

  if (isEditing.value) {
    await playerStore.updatePlayer(playerId.value, dataToSubmit);
    // THÊM CẢNH BÁO
    alert(
      "Đã CẬP NHẬT vào bộ nhớ tạm! QUAN TRỌNG: Bạn cần nhấn nút 'Xuất CSV' ở trang Danh Sách để lưu vĩnh viễn!"
    );
  } else {
    await playerStore.addPlayer(dataToSubmit);
    // THÊM CẢNH BÁO
    alert(
      "Đã THÊM MỚI vào bộ nhớ tạm! QUAN TRỌNG: Bạn cần nhấn nút 'Xuất CSV' ở trang Danh Sách để lưu vĩnh viễn!"
    );
  }
  router.push("/players");
};
</script>

<style scoped>
.form-label {
  @apply block text-sm font-bold text-gray-700 mb-2;
}

.form-input {
  @apply w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all;
}

.btn-secondary {
  @apply px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors;
}

.btn-primary {
  @apply px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50;
}
</style>
