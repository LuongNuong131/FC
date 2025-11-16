// src/stores/attendanceStore.js - FIXED VERSION
import { defineStore } from "pinia";
import { usePlayerStore } from "./playerStore";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import Papa from "papaparse";

export const useAttendanceStore = defineStore("attendance", {
  state: () => ({
    sessions: [],
    loading: false,
    error: null,
    lastConfirmedSession: null,
  }),

  actions: {
    // ✅ FIX: Load sessions từ CSV file
    async fetchSessions() {
      this.loading = true;
      this.error = null;

      try {
        // 1. Thử load từ CSV file trước
        const response = await fetch("/sessions.csv");

        if (response.ok) {
          const csvText = await response.text();

          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              this.sessions = results.data.map((session) => ({
                id: session.id,
                date: new Date(session.date),
                note: session.note || "",
                attendees: session.attendeeIds
                  ? session.attendeeIds.split(",").map((id) => id.trim())
                  : [],
                createdAt: session.createdAt
                  ? new Date(session.createdAt)
                  : new Date(),
              }));

              console.log("✅ Loaded sessions from CSV:", this.sessions.length);
            },
            error: (error) => {
              console.error("❌ Parse CSV error:", error);
              this.loadFromLocalStorage();
            },
          });
        } else {
          // CSV không tồn tại, load từ localStorage
          console.warn("⚠️ sessions.csv not found, loading from localStorage");
          this.loadFromLocalStorage();
        }
      } catch (err) {
        console.error("❌ Fetch sessions error:", err);
        this.loadFromLocalStorage();
      } finally {
        this.loading = false;
      }
    },

    // Helper: Load từ localStorage
    loadFromLocalStorage() {
      try {
        const savedSessions = localStorage.getItem("attendance_sessions");
        if (savedSessions) {
          this.sessions = JSON.parse(savedSessions).map((s) => ({
            ...s,
            date: new Date(s.date),
            createdAt: new Date(s.createdAt),
          }));
          console.log(
            "✅ Loaded sessions from localStorage:",
            this.sessions.length
          );
        } else {
          this.sessions = [];
        }
      } catch (err) {
        console.warn("⚠️ Cannot load from localStorage:", err);
        this.sessions = [];
      }
    },

    // ✅ Add session với sync đầy đủ
    addSession(sessionData) {
      this.loading = true;
      const playerStore = usePlayerStore();

      try {
        // 1. Tạo session object
        const newSession = {
          id: `s${Date.now()}`,
          date: new Date(sessionData.date),
          note: sessionData.note || "",
          attendees: sessionData.attendees,
          createdAt: new Date(),
        };

        // 2. Cập nhật totalAttendance trong PlayerStore
        sessionData.attendees.forEach((playerId) => {
          playerStore.incrementAttendance(playerId);
        });

        // 3. Thêm session vào store
        this.sessions.unshift(newSession);

        // 4. Lưu vào localStorage
        localStorage.setItem(
          "attendance_sessions",
          JSON.stringify(this.sessions)
        );

        // 5. ⭐ XUẤT 2 FILE CSV
        // File 1: players.csv (updated totalAttendance)
        playerStore.exportStateToCSV("players.csv");

        // File 2: ThamGia_DATE.csv (attendee list)
        this.exportSessionAttendees(newSession);

        // File 3: sessions.csv (full history) - TỰ ĐỘNG
        this.exportSessionsToCSV();

        // 6. Lưu trạng thái success
        this.lastConfirmedSession = newSession;

        console.log("✅ Session added successfully:", newSession.id);
      } catch (err) {
        this.error = "Lỗi khi thêm buổi điểm danh: " + err.message;
        console.error("❌ Add session error:", err);
      } finally {
        this.loading = false;
      }
    },

    // ✅ XUẤT FILE SESSIONS.CSV (Full History)
    exportSessionsToCSV() {
      const dataToExport = this.sessions.map((session) => ({
        id: session.id,
        date:
          session.date instanceof Date
            ? session.date.toISOString().split("T")[0]
            : session.date,
        note: session.note || "",
        attendeeIds: Array.isArray(session.attendees)
          ? session.attendees.join(",")
          : session.attendees,
        createdAt:
          session.createdAt instanceof Date
            ? session.createdAt.toISOString()
            : session.createdAt,
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", "sessions.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Exported sessions.csv");
    },

    // ✅ XUẤT FILE THAM GIA (Per Session)
    exportSessionAttendees(session) {
      const playerStore = usePlayerStore();

      const attendedPlayers = playerStore.players.filter((p) =>
        session.attendees.includes(p.id)
      );

      const data = attendedPlayers.map((player) => ({
        Tên: player.name,
        "Số Áo": player.jerseyNumber || "N/A",
        "Vị trí": player.position || "N/A",
        "Số buổi đã tham gia (Mới)": player.totalAttendance || 0,
        "Ngày tham gia": new Date(session.date).toLocaleDateString("vi-VN"),
      }));

      const csv = Papa.unparse(data);
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");

      const filename = `ThamGia_${new Date(session.date).toLocaleDateString(
        "en-CA"
      )}.csv`;
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Exported attendee list:", filename);
    },

    // ✅ XUẤT EXCEL (Giữ nguyên)
    exportSessionToExcel(sessionId) {
      const session = this.sessions.find((s) => s.id === sessionId);
      if (!session) {
        alert("Không tìm thấy buổi điểm danh.");
        return;
      }

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

      console.log("✅ Exported Excel:", filename);
    },

    // ✅ XUẤT HÌNH ẢNH (Giữ nguyên)
    async exportToImage(elementId, filename) {
      const element = document.getElementById(elementId);
      if (!element) {
        alert("Không tìm thấy phần tử để xuất hình ảnh.");
        return;
      }

      this.loading = true;
      try {
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imageURL = canvas.toDataURL("image/png");

        const a = document.createElement("a");
        a.href = imageURL;
        a.download = `${filename || "bao_cao"}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log("✅ Exported image:", a.download);
      } catch (err) {
        this.error = "Lỗi khi xuất hình ảnh: " + err.message;
        console.error("❌ Export image error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
});
