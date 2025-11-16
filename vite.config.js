import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Dòng này định nghĩa: mỗi khi thấy "@/..." thì nó sẽ hiểu là trỏ đến "src/..."
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
