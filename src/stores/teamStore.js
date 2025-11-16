// src/stores/teamStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Papa from "papaparse";

const TEAMS_CSV_PATH = "/teams.csv";

export const useTeamStore = defineStore("team", () => {
  const teams = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // --- Helpers ---
  const getTeamColor = (teamId) => {
    const map = {
      t1: "team-green",
      t2: "team-red",
      t3: "team-yellow",
      t4: "team-purple",
    };
    return map[teamId] || "gray-500";
  };

  // --- CSV Logic (Fetching) ---
  const fetchTeams = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(TEAMS_CSV_PATH);
      const csvText = await response.text();

      const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Giữ playerIds là string để xử lý
      });

      if (errors.length > 0) {
        console.error("CSV Parsing Errors:", errors);
        throw new Error("Lỗi định dạng file teams.csv");
      }

      // Xử lý playerIds (danh sách ID)
      const formattedTeams = data.map((t) => ({
        ...t,
        // playerIds sẽ là string 'p1,p2,p3...' -> split thành array
        playerIds: (t.playerIds || "")
          .split(",")
          .filter((id) => id.trim())
          .map((id) => id.trim()),
        colorClass: getTeamColor(t.id),
      }));

      teams.value = formattedTeams;
    } catch (err) {
      error.value =
        "Không thể tải file teams.csv. Hãy đảm bảo file đã tồn tại trong public/. Chi tiết: " +
        err.message;
      teams.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    teams,
    loading,
    error,
    fetchTeams,
    getTeamColor,
  };
});
