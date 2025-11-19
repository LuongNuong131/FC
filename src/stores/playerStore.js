// src/stores/playerStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Papa from "papaparse";

const PLAYERS_CSV_PATH = "/players.csv";
const LOCAL_STORAGE_KEY = "playerData_v3"; // Đổi key để tránh conflict cache cũ

export const usePlayerStore = defineStore("player", () => {
  const players = ref([]);
  const player = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // --- Helper: Lưu vào Local Storage ---
  const savePlayersToLocal = (data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // --- Helper: Format dữ liệu an toàn (Chống null/undefined) ---
  const formatData = (data) => {
    return data.map((p) => ({
      id: p.id || `p_${Math.random().toString(36).substr(2, 9)}`, // Fallback ID nếu thiếu
      name: p.name ? String(p.name).trim() : "Chưa đặt tên",
      phone: p.phone ? String(p.phone) : "",
      // Xử lý ngày tháng an toàn
      dob: p.dob ? new Date(p.dob) : null,
      height_cm: p.height_cm ? Number(p.height_cm) : null,
      weight_kg: p.weight_kg ? Number(p.weight_kg) : null,
      position: p.position ? String(p.position) : "N/A",
      jerseyNumber: p.jerseyNumber ? Number(p.jerseyNumber) : null,
      imageUrl: p.imageUrl ? String(p.imageUrl) : "",
      totalAttendance: p.totalAttendance ? Number(p.totalAttendance) : 0,
    }));
  };

  // --- Action: Load dữ liệu (Core Logic) ---
  const fetchPlayers = async (forceCSV = false) => {
    loading.value = true;
    error.value = null;

    // 1. Nếu KHÔNG bắt buộc đọc CSV, thử đọc LocalStorage trước
    if (!forceCSV) {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Chỉ dùng LocalStorage nếu có dữ liệu (>0)
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            players.value = formatData(parsedData);
            loading.value = false;
            console.log("Loaded from Local Storage ✅");
            return;
          }
        } catch (e) {
          console.warn("Local Storage corrupted, falling back to CSV...");
        }
      }
    }

    // 2. Đọc từ file CSV (Nếu LocalStorage trống hoặc forceCSV=true)
    try {
      console.log("Fetching CSV from:", PLAYERS_CSV_PATH);
      const response = await fetch(PLAYERS_CSV_PATH, { cache: "no-store" }); // Thêm no-store để tránh browser cache file cũ

      if (!response.ok) throw new Error("Không tìm thấy file players.csv");

      const csvText = await response.text();

      const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (errors.length > 0 && data.length === 0) {
        console.error("CSV Parsing Errors:", errors);
        throw new Error("Lỗi đọc nội dung file CSV");
      }

      const formattedPlayers = formatData(data);
      players.value = formattedPlayers;

      // Lưu lại vào LocalStorage để dùng cho các lần sau (edit, add...)
      savePlayersToLocal(formattedPlayers);
      console.log("Loaded from CSV & Saved to Local ✅");
    } catch (err) {
      error.value = `Lỗi tải dữ liệu: ${err.message}. Hãy kiểm tra file public/players.csv`;
      console.error(err);
      players.value = [];
    } finally {
      loading.value = false;
    }
  };

  // --- Action: Reset Database (Xóa Cache, đọc lại gốc) ---
  const resetDatabase = () => {
    if (
      confirm("Bạn có chắc muốn xóa mọi thay đổi và tải lại từ file CSV gốc?")
    ) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      fetchPlayers(true); // Force CSV load
      alert("Đã reset dữ liệu về gốc!");
    }
  };

  // ... Các hàm CRUD khác giữ nguyên (addPlayer, updatePlayer...)
  const generateUniqueId = (prefix = "p") => {
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 5)
    );
  };

  const addPlayer = async (newPlayerData) => {
    loading.value = true;
    const newPlayer = {
      ...newPlayerData,
      id: generateUniqueId(),
      totalAttendance: 0,
      dob: newPlayerData.dob ? new Date(newPlayerData.dob) : null,
      height_cm: Number(newPlayerData.height_cm),
      weight_kg: Number(newPlayerData.weight_kg),
      jerseyNumber: Number(newPlayerData.jerseyNumber),
    };
    players.value.push(newPlayer);
    savePlayersToLocal(players.value);
    loading.value = false;
  };

  const updatePlayer = async (id, updatedData) => {
    loading.value = true;
    const index = players.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      players.value[index] = {
        ...players.value[index],
        ...updatedData,
        dob: updatedData.dob ? new Date(updatedData.dob) : null,
        height_cm: Number(updatedData.height_cm),
        weight_kg: Number(updatedData.weight_kg),
        jerseyNumber: Number(updatedData.jerseyNumber),
      };
      savePlayersToLocal(players.value);
    }
    loading.value = false;
  };

  const fetchPlayer = (id) => {
    loading.value = true;
    player.value = players.value.find((p) => p.id === id) || null;
    loading.value = false;
    if (!player.value) error.value = "Không tìm thấy cầu thủ.";
  };

  const getPlayerWithBMI = (player) => {
    if (!player) return {};
    const h = player.height_cm;
    const w = player.weight_kg;
    let bmi = null;
    let status = "N/A";

    if (h && w) {
      const h_m = h / 100;
      bmi = (w / (h_m * h_m)).toFixed(1);
      if (bmi < 18.5) status = "Thiếu cân";
      else if (bmi <= 24.9) status = "Bình thường";
      else if (bmi <= 29.9) status = "Thừa cân";
      else status = "Béo phì";
    }
    return { ...player, bmi, bmiStatus: status };
  };

  const incrementAttendance = (playerId) => {
    const playerToUpdate = players.value.find((p) => p.id === playerId);
    if (playerToUpdate) {
      playerToUpdate.totalAttendance =
        (playerToUpdate.totalAttendance || 0) + 1;
      savePlayersToLocal(players.value);
    }
  };

  const exportPlayersToCSV = () => {
    const dataToExport = players.value.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone || "",
      dob: p.dob ? p.dob.toISOString().split("T")[0] : "",
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
      bom: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `players.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    players,
    player,
    loading,
    error,
    fetchPlayers,
    resetDatabase, // Export hàm này để dùng ở component
    fetchPlayer,
    addPlayer,
    updatePlayer,
    getPlayerWithBMI,
    incrementAttendance,
    exportPlayersToCSV,
  };
});
