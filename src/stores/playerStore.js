// src/stores/playerStore.js
import { defineStore } from "pinia";
import Papa from "papaparse";

// Hàm chuyển đổi string thành kiểu dữ liệu phù hợp
const transformPlayer = (data) => {
  data.height_cm = data.height_cm ? Number(data.height_cm) : null;
  data.weight_kg = data.weight_kg ? Number(data.weight_kg) : null;
  data.jerseyNumber = data.jerseyNumber ? Number(data.jerseyNumber) : null;

  data.dob =
    data.dob &&
    typeof data.dob === "string" &&
    data.dob.match(/^\d{4}-\d{2}-\d{2}$/)
      ? new Date(data.dob)
      : null;

  data.totalAttendance = data.totalAttendance || 0;

  return data;
};

export const usePlayerStore = defineStore("players", {
  state: () => ({
    players: [],
    player: null,
    loading: false,
    error: null,
  }),

  getters: {
    // Getter tính BMI
    getPlayerWithBMI: (state) => (player) => {
      if (!player || !player.height_cm || !player.weight_kg) {
        return { ...player, bmi: null, bmiStatus: "N/A" };
      }
      const heightInMeters = player.height_cm / 100;
      const bmi = player.weight_kg / (heightInMeters * heightInMeters);

      let bmiStatus = "N/A";
      if (bmi < 18.5) bmiStatus = "Thiếu cân";
      else if (bmi < 25) bmiStatus = "Bình thường";
      else if (bmi < 30) bmiStatus = "Thừa cân";
      else bmiStatus = "Béo phì";

      return { ...player, bmi: bmi.toFixed(2), bmiStatus };
    },
    activePlayers: (state) => state.players,
  },

  actions: {
    async loadPlayersFromCSV() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch("/players.csv");
        if (!response.ok) {
          this.players = [];
          console.warn(
            "File public/players.csv không tồn tại. Vui lòng tạo file."
          );
          return;
        }
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.players = results.data.map(transformPlayer);
            this.players = this.players.map((p) => ({
              ...p,
              totalAttendance: p.totalAttendance || 0,
            }));
          },
        });
      } catch (err) {
        this.error = "Lỗi khi tải dữ liệu cầu thủ: " + err.message;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    fetchPlayers() {
      this.loadPlayersFromCSV();
    },

    fetchPlayer(id) {
      this.player = this.players.find((p) => p.id === id) || null;
    },

    incrementAttendance(playerId) {
      const player = this.players.find((p) => p.id === playerId);
      if (player) {
        player.totalAttendance = (player.totalAttendance || 0) + 1;
      }
    },

    // HÀM TẠO FILE CSV GHI ĐÈ
    exportStateToCSV(fileName = "players.csv") {
      const dataToExport = this.players.map((player) => ({
        id: player.id,
        name: player.name,
        phone: player.phone,
        dob:
          player.dob instanceof Date
            ? player.dob.toISOString().split("T")[0]
            : "",
        height_cm: player.height_cm,
        weight_kg: player.weight_kg,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        imageUrl: player.imageUrl,
        totalAttendance: player.totalAttendance,
      }));

      const csv = Papa.unparse(dataToExport);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },

    // Hàm CRUD bị vô hiệu hóa
    addPlayer(playerData) {
      alert(
        "Chức năng thêm cầu thủ đã bị vô hiệu hóa. Vui lòng thêm cầu thủ vào file public/players.csv."
      );
    },
    updatePlayer(id, newData) {
      alert(
        "Chức năng cập nhật cầu thủ đã bị vô hiệu hóa. Vui lòng cập nhật cầu thủ trong file public/players.csv."
      );
    },
    deletePlayer(id) {
      alert(
        "Chức năng xóa cầu thủ đã bị vô hiệu hóa. Vui lòng xóa cầu thủ trong file public/players.csv."
      );
    },
  },
});
