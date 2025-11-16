// src/stores/attendanceStore.js
import { defineStore } from "pinia";
import { usePlayerStore } from "./playerStore";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

export const useAttendanceStore = defineStore("attendance", {
  state: () => ({
    sessions: [],
    loading: false,
    error: null,
  }),

  actions: {
    fetchSessions() {
      // Giữ nguyên logic cục bộ
    },

    addSession(sessionData) {
      this.loading = true;
      const playerStore = usePlayerStore();

      try {
        const newSession = {
          id: Date.now().toString(),
          date: new Date(sessionData.date),
          note: sessionData.note,
          attendees: sessionData.attendees,
        };
        this.sessions.unshift(newSession);

        sessionData.attendees.forEach((playerId) => {
          playerStore.incrementAttendance(playerId);
        });
      } catch (err) {
        this.error = "Lỗi khi thêm buổi điểm danh: " + err.message;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    // HÀM XUẤT EXCEL (Báo cáo Điểm danh chi tiết)
    exportSessionToExcel(sessionId) {
      const session = this.sessions.find((s) => s.id === sessionId);
      if (!session) return alert("Không tìm thấy buổi điểm danh.");

      const playerStore = usePlayerStore();

      const data = [
        ["BÁO CÁO ĐIỂM DANH CHI TIẾT"],
        ["Ngày:", new Date(session.date).toLocaleDateString("vi-VN")],
        ["Ghi Chú:", session.note || "N/A"],
        [],
        ["ID", "Tên Cầu Thủ", "Số Áo", "Vị Trí", "Tham Gia?"],
      ];

      playerStore.players.forEach((player) => {
        const isAttended = session.attendees.includes(player.id)
          ? "CÓ"
          : "VẮNG";
        data.push([
          player.id,
          player.name,
          player.jerseyNumber || "N/A",
          player.position || "N/A",
          isAttended,
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const colWidths = [
        { wch: 5 },
        { wch: 25 },
        { wch: 10 },
        { wch: 15 },
        { wch: 10 },
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Điểm Danh");

      const filename = `DiemDanh_${new Date(session.date).toLocaleDateString(
        "en-CA"
      )}.xlsx`;
      XLSX.writeFile(workbook, filename);
    },

    // HÀM XUẤT HÌNH ẢNH (Báo cáo tổng hợp)
    async exportToImage(elementId, filename) {
      const element = document.getElementById(elementId);
      if (!element) return alert("Không tìm thấy phần tử để xuất hình ảnh.");

      this.loading = true;
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
        });
        const imageURL = canvas.toDataURL("image/png");

        const a = document.createElement("a");
        a.href = imageURL;
        a.download = `${filename || "bao_cao"}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        this.error = "Lỗi khi xuất hình ảnh: " + err.message;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
