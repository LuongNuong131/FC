// src/stores/playerStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Papa from "papaparse";

const PLAYERS_CSV_PATH = "/players.csv";

export const usePlayerStore = defineStore("player", () => {
  const players = ref([]);
  const player = ref(null); // Cho PlayerDetail
  const loading = ref(false);
  const error = ref(null);

  const generateUniqueId = (prefix = "p") => {
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 5)
    );
  };

  // --- CSV Logic (Fetching) ---
  const fetchPlayers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(PLAYERS_CSV_PATH);
      const csvText = await response.text();

      const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (errors.length > 0) {
        console.error("CSV Parsing Errors:", errors);
        throw new Error("Lỗi định dạng file players.csv");
      }

      // Format data: date object, numbers
      const formattedPlayers = data.map((p) => ({
        ...p,
        dob: p.dob ? new Date(p.dob) : null,
        height_cm: p.height_cm ? Number(p.height_cm) : null,
        weight_kg: p.weight_kg ? Number(p.weight_kg) : null,
        jerseyNumber: p.jerseyNumber ? Number(p.jerseyNumber) : null,
        totalAttendance: p.totalAttendance ? Number(p.totalAttendance) : 0,
      }));

      players.value = formattedPlayers;
    } catch (err) {
      error.value =
        "Không thể tải file players.csv. Hãy đảm bảo file đã tồn tại trong public/. Chi tiết: " +
        err.message;
      players.value = [];
    } finally {
      loading.value = false;
    }
  };

  // --- Utility Functions ---

  const calculateBMI = (height_cm, weight_kg) => {
    if (!height_cm || !weight_kg) return null;
    const height_m = height_cm / 100;
    const bmi = weight_kg / (height_m * height_m);
    return parseFloat(bmi.toFixed(1));
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return "N/A";
    if (bmi < 18.5) return "Thiếu cân";
    if (bmi >= 18.5 && bmi <= 24.9) return "Bình thường";
    if (bmi >= 25.0 && bmi <= 29.9) return "Thừa cân";
    return "Béo phì";
  };

  const getPlayerWithBMI = (player) => {
    const bmi = calculateBMI(player.height_cm, player.weight_kg);
    return {
      ...player,
      bmi: bmi,
      bmiStatus: getBMIStatus(bmi),
    };
  };

  // --- CRUD (Chỉ trên Memory) ---

  const fetchPlayer = (id) => {
    loading.value = true;
    player.value = players.value.find((p) => p.id === id) || null;
    loading.value = false;
    if (!player.value) {
      error.value = "Không tìm thấy cầu thủ.";
    }
  };

  const addPlayer = async (newPlayerData) => {
    loading.value = true;
    const newPlayer = {
      ...newPlayerData,
      id: generateUniqueId(),
      totalAttendance: 0,
      // Đảm bảo các trường số/ngày tháng được format đúng
      dob: newPlayerData.dob ? new Date(newPlayerData.dob) : null,
      height_cm: newPlayerData.height_cm
        ? Number(newPlayerData.height_cm)
        : null,
      weight_kg: newPlayerData.weight_kg
        ? Number(newPlayerData.weight_kg)
        : null,
      jerseyNumber: newPlayerData.jerseyNumber
        ? Number(newPlayerData.jerseyNumber)
        : null,
    };
    players.value.push(newPlayer);
    loading.value = false;
  };

  const updatePlayer = async (id, updatedData) => {
    loading.value = true;
    const index = players.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      // Cập nhật và đảm bảo format lại date/number
      players.value[index] = {
        ...players.value[index],
        ...updatedData,
        dob: updatedData.dob ? new Date(updatedData.dob) : null,
        height_cm: updatedData.height_cm ? Number(updatedData.height_cm) : null,
        weight_kg: updatedData.weight_kg ? Number(updatedData.weight_kg) : null,
        jerseyNumber: updatedData.jerseyNumber
          ? Number(updatedData.jerseyNumber)
          : null,
      };
    }
    loading.value = false;
  };

  // Tăng attendance khi điểm danh
  const incrementAttendance = (playerId) => {
    const playerToUpdate = players.value.find((p) => p.id === playerId);
    if (playerToUpdate) {
      playerToUpdate.totalAttendance =
        (playerToUpdate.totalAttendance || 0) + 1;
      // Dữ liệu chỉ trong memory, cần export thủ công
    }
  };

  // Export file players.csv (NGƯỜI DÙNG PHẢI COPY VÀO PUBLIC/ THỦ CÔNG)
  const exportPlayersToCSV = () => {
    const dataToExport = players.value.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone || "",
      dob: p.dob ? p.dob.toISOString().split("T")[0] : "", // Chuyển Date về YYYY-MM-DD
      height_cm: p.height_cm || "",
      weight_kg: p.weight_kg || "",
      position: p.position || "",
      jerseyNumber: p.jerseyNumber || "",
      imageUrl: p.imageUrl || "",
      totalAttendance: p.totalAttendance || 0,
    }));

    const csv = Papa.unparse(dataToExport, {
      delimiter: ",",
      header: true,
      encoding: "utf-8",
      bom: true, // Thêm BOM để Excel đọc đúng tiếng Việt
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `players.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(
      "Đã xuất file players.csv. Vui lòng copy file này vào thư mục public/ để lưu trữ vĩnh viễn dữ liệu cầu thủ và attendance!"
    );
  };

  return {
    players,
    player,
    loading,
    error,
    fetchPlayers,
    fetchPlayer,
    addPlayer,
    updatePlayer,
    getPlayerWithBMI,
    incrementAttendance,
    exportPlayersToCSV,
  };
});
