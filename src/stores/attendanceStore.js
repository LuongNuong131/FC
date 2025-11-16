// src/stores/attendanceStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import Papa from "papaparse";
import html2canvas from "html2canvas";

// NEW: Sử dụng CSV file content để fetch sessions
const SESSIONS_CSV_PATH = "/sessions.csv";
const LAST_CONFIRMED_SESSION_KEY = "lastConfirmedSession";

export const useAttendanceStore = defineStore("attendance", () => {
  const playerStore = usePlayerStore();
  const sessions = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lastConfirmedSession = ref(
    JSON.parse(localStorage.getItem(LAST_CONFIRMED_SESSION_KEY))
  );

  // --- Helpers ---
  const saveConfirmedSessionToLocalStorage = (session) => {
    localStorage.setItem(LAST_CONFIRMED_SESSION_KEY, JSON.stringify(session));
    lastConfirmedSession.value = session;
  };

  const generateUniqueId = (prefix = "s") => {
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 5)
    );
  };

  // --- CSV Logic (Fetching) ---
  const fetchSessions = async () => {
    loading.value = true;
    error.value = null;
    try {
      // Fetch từ CSV
      const response = await fetch(SESSIONS_CSV_PATH);
      const csvText = await response.text();

      const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (errors.length > 0) {
        console.error("CSV Parsing Errors:", errors);
        throw new Error("Lỗi định dạng file sessions.csv");
      }

      // Xử lý attendees (danh sách ID)
      const formattedSessions = data.map((s) => ({
        ...s,
        attendees: (s.attendeeIds || "")
          .split(",")
          .filter((id) => id.trim())
          .map((id) => id.trim()),
      }));
      sessions.value = formattedSessions.reverse(); // Đảo ngược để sessions mới nhất lên đầu
    } catch (err) {
      error.value =
        "Không thể tải file sessions.csv. Hãy đảm bảo file đã tồn tại trong public/. Chi tiết: " +
        err.message;
      sessions.value = [];
    } finally {
      loading.value = false;
    }
  };

  // --- Main Actions ---

  // Thêm session mới vào MEMORY VÀ CẬP NHẬT PLAYER ATTENDANCE
  const addSession = (sessionData) => {
    // 1. Tạo session mới
    const newSession = {
      id: generateUniqueId(),
      date: sessionData.date,
      note: sessionData.note,
      attendees: sessionData.attendees,
      attendeeIds: sessionData.attendees.join(","), // CSV format
      createdAt: new Date().toISOString(),
    };

    // 2. Cập nhật MEMORY (để hiển thị ngay)
    sessions.value.unshift(newSession);

    // 3. Cập nhật totalAttendance của CẦU THỦ trong playerStore (MEMORY)
    sessionData.attendees.forEach((playerId) => {
      playerStore.incrementAttendance(playerId);
    });

    // 4. Lưu vào LocalStorage để hiển thị toast
    saveConfirmedSessionToLocalStorage(newSession);
  };

  // Xóa session khỏi memory
  const removeSession = (sessionId) => {
    const index = sessions.value.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions.value.splice(index, 1);
    }
  };

  // Xuất file sessions.csv (NGƯỜI DÙNG PHẢI COPY VÀO PUBLIC/ THỦ CÔNG)
  const exportSessionsToCSV = () => {
    if (sessions.value.length === 0) {
      alert("Không có buổi tập nào để xuất!");
      return;
    }

    const dataToExport = sessions.value
      .map((s) => ({
        id: s.id,
        date: s.date,
        note: s.note,
        attendeeIds: s.attendees.join(","), // Chuyển array về string CSV
        createdAt: s.createdAt,
      }))
      .reverse(); // Xuất ra file thì sessions cũ nhất lên đầu

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
    link.setAttribute("download", `sessions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(
      "Đã xuất file sessions.csv. Vui lòng copy file này vào thư mục public/ để lưu trữ vĩnh viễn dữ liệu điểm danh!"
    );
  };

  // Export session báo cáo CSV chi tiết
  const exportSessionToExcel = (sessionId) => {
    const session = sessions.value.find((s) => s.id === sessionId);
    if (!session) return;

    // 1. Chuẩn bị dữ liệu chi tiết người tham gia
    const attendeesDetail = session.attendees.map((id) => {
      const player = playerStore.players.find((p) => p.id === id);
      return player
        ? playerStore.getPlayerWithBMI(player)
        : { name: "Unknown", totalAttendance: 0 };
    });

    // 2. Tạo nội dung CSV báo cáo chi tiết
    const reportData = attendeesDetail.map((p) => ({
      ID: p.id,
      "Tên Cầu Thủ": p.name,
      "Số áo": p.jerseyNumber || "N/A",
      "Vị trí": p.position || "N/A",
      "Chiều cao (cm)": p.height_cm || "N/A",
      "Cân nặng (kg)": p.weight_kg || "N/A",
      BMI: p.bmi || "N/A",
      "Trạng thái BMI": p.bmiStatus || "N/A",
      "Tổng buổi tập": p.totalAttendance || 0,
    }));

    // 3. Metadata (Header)
    const metadata = [
      ["BÁO CÁO THAM GIA BUỔI TẬP"],
      [`Ngày: ${session.date}`],
      [`Ghi chú: ${session.note || "Không có ghi chú"}`],
      [`Số lượng tham gia: ${session.attendees.length}`],
      [], // Dòng trống
    ];

    // 4. Combine metadata và report data
    // Chuyển mảng reportData thành CSV string, sau đó tách thành mảng các hàng (rows)
    const dataCsvString = Papa.unparse(reportData, {
      delimiter: ",",
      header: true,
      encoding: "utf-8",
      bom: true,
    });

    // Tách CSV thành mảng các hàng, mỗi hàng là một mảng các giá trị
    const dataRows = dataCsvString.split("\n").map((row) => row.split(","));

    // Kết hợp metadata và data rows
    const finalData = metadata.concat(dataRows);

    const csvContent = finalData.map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ThamGia_${session.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Đã xuất file ThamGia_${session.date}.csv!`);
  };

  // Export báo cáo ảnh
  const exportToImage = async (elementId, fileName) => {
    const element = document.getElementById(elementId);
    if (!element) {
      alert(`Lỗi: Không tìm thấy nội dung báo cáo!`);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 3, // High quality screenshot
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `${fileName}_${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Đã xuất ảnh báo cáo thành công!");
    } catch (err) {
      console.error("Lỗi xuất ảnh:", err);
      alert("Lỗi: Không thể xuất ảnh. Vui lòng kiểm tra console (F12).");
    }
  };

  return {
    sessions,
    loading,
    error,
    lastConfirmedSession,
    fetchSessions,
    addSession,
    removeSession,
    exportSessionsToCSV,
    exportSessionToExcel,
    exportToImage,
  };
});
