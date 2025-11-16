// src/stores/fundStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Papa from "papaparse";

const FUND_CSV_PATH = "/fund_contributions.csv";

export const useFundStore = defineStore("fund", () => {
  const contributions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const generateUniqueId = (prefix = "f") => {
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 5)
    );
  };

  // --- Computed ---
  const totalFund = computed(() => {
    // Tính tổng quỹ, đảm bảo số âm nếu là chi tiêu
    return contributions.value.reduce((sum, c) => sum + c.amount, 0);
  });

  const formattedTotalFund = computed(() => {
    // Định dạng tiền tệ VND
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(totalFund.value);
  });

  // --- CSV Logic (Fetching) ---
  const fetchContributions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(FUND_CSV_PATH);
      const csvText = await response.text();

      const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Auto convert string numbers to actual numbers
      });

      if (errors.length > 0) {
        console.error("CSV Parsing Errors:", errors);
        throw new Error("Lỗi định dạng file fund_contributions.csv");
      }

      // Đảm bảo amount là số và sort theo ngày tạo mới nhất
      contributions.value = data
        .map((c) => ({
          ...c,
          amount: parseFloat(c.amount) || 0,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      error.value =
        "Không thể tải file fund_contributions.csv. Hãy đảm bảo file đã tồn tại trong public/. Chi tiết: " +
        err.message;
      contributions.value = [];
    } finally {
      loading.value = false;
    }
  };

  // --- Main Actions ---

  // Thêm đóng góp mới (Chỉ Admin)
  const addContribution = (contributionData) => {
    const newContribution = {
      id: generateUniqueId(),
      date: contributionData.date,
      contributor: contributionData.contributor,
      amount: parseFloat(contributionData.amount) || 0,
      note: contributionData.note,
      imageUrl: contributionData.imageUrl || "",
      createdAt: new Date().toISOString(),
    };

    // Thêm vào memory (để hiển thị ngay)
    contributions.value.unshift(newContribution);

    return newContribution;
  };

  // Xuất file fund_contributions.csv (NGƯỜI DÙNG PHẢI COPY VÀO PUBLIC/ THỦ CÔNG)
  const exportFundToCSV = () => {
    if (contributions.value.length === 0) {
      alert("Không có giao dịch nào để xuất!");
      return;
    }

    const dataToExport = contributions.value
      .map((c) => ({
        id: c.id,
        date: c.date,
        contributor: c.contributor,
        amount: c.amount,
        note: c.note,
        imageUrl: c.imageUrl,
        createdAt: c.createdAt,
      }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Xuất ra file thì sessions cũ nhất lên đầu

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
    link.setAttribute("download", `fund_contributions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(
      "Đã xuất file fund_contributions.csv. Vui lòng copy file này vào thư mục public/ để lưu trữ vĩnh viễn dữ liệu quỹ nhóm!"
    );
  };

  return {
    contributions,
    loading,
    error,
    totalFund,
    formattedTotalFund,
    fetchContributions,
    addContribution,
    exportFundToCSV,
  };
});
