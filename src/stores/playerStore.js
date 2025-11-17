// src/stores/playerStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Papa from "papaparse";

const PLAYERS_CSV_PATH = "/players.csv";
const LOCAL_STORAGE_KEY = "playerData_temp"; // Khóa mới cho Local Storage

export const usePlayerStore = defineStore("player", () => {
  const players = ref([]);
  const player = ref(null); // Cho PlayerDetail
  const loading = ref(false);
  const error = ref(null);

  // --- Helper: Lưu vào Local Storage ---
  const savePlayersToLocal = (data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // --- Helper: Xử lý định dạng dữ liệu (Chuyển đổi date/number) ---
  const formatData = (data) => {
    return data.map((p) => ({
      ...p,
      // Đảm bảo date là Date object (hoặc null)
      dob: p.dob ? (p.dob instanceof Date ? p.dob : new Date(p.dob)) : null,
      // Đảm bảo các trường số
      height_cm: p.height_cm ? Number(p.height_cm) : null,
      weight_kg: p.weight_kg ? Number(p.weight_kg) : null,
      jerseyNumber: p.jerseyNumber ? Number(p.jerseyNumber) : null,
      totalAttendance: p.totalAttendance ? Number(p.totalAttendance) : 0,
    }));
  };

  // --- CSV Logic (Fetching) ---
  const fetchPlayers = async () => {
    loading.value = true;
    error.value = null;

    // 1. THỬ TẢI DỮ LIỆU TỪ LOCAL STORAGE (Dữ liệu tạm thời mới nhất)
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        players.value = formatData(parsedData);
        loading.value = false;
        console.log("Loaded players from Local Storage.");
        return; // Ưu tiên Local Storage nếu có
      } catch (e) {
        console.error("Error parsing Local Storage data:", e);
        // Tiếp tục load từ CSV nếu Local Storage bị lỗi
      }
    }

    // 2. TẢI DỮ LIỆU TỪ CSV GỐC (Nếu Local Storage trống hoặc lỗi)
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

      const formattedPlayers = formatData(data);
      players.value = formattedPlayers;
      // Lưu vào Local Storage để sử dụng tạm thời cho lần sau
      savePlayersToLocal(formattedPlayers);
    } catch (err) {
      error.value =
        "Không thể tải file players.csv. Hãy đảm bảo file đã tồn tại trong public/. Chi tiết: " +
        err.message;
      players.value = [];
    } finally {
      loading.value = false;
    }
  };

  // ... (Các hàm utility khác)

  const generateUniqueId = (prefix = "p") => {
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 5)
    );
  };

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

  // --- CRUD (Cập nhật cả Store và Local Storage) ---

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
    savePlayersToLocal(players.value); // <--- LƯU VÀO LOCAL STORAGE
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
      savePlayersToLocal(players.value); // <--- LƯU VÀO LOCAL STORAGE
    }
    loading.value = false;
  };

  // Tăng attendance khi điểm danh
  const incrementAttendance = (playerId) => {
    const playerToUpdate = players.value.find((p) => p.id === playerId);
    if (playerToUpdate) {
      playerToUpdate.totalAttendance =
        (playerToUpdate.totalAttendance || 0) + 1;
      savePlayersToLocal(players.value); // <--- LƯU VÀO LOCAL STORAGE
      // Dữ liệu chỉ trong memory/local storage, cần export thủ công
    }
  };

  // Export file players.csv (NGƯỜI DÙNG PHẢI COPY VÀO PUBLIC/ THỦ CÔNG)
  const exportPlayersToCSV = () => {
    // Luôn lấy dữ liệu từ Store (đã được đồng bộ với Local Storage)
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

    // Xóa Local Storage sau khi export thành công (để lần sau load từ CSV thật)
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    alert(
      "Đã xuất file players.csv. Vui lòng copy file này vào thư mục public/ để lưu trữ vĩnh viễn dữ liệu cầu thủ và attendance! Sau đó, khởi động lại server để đảm bảo."
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
