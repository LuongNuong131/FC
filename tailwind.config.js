/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Màu sắc custom cho tính năng Chia Đội
        "team-green": "#10b981",
        "team-red": "#ef4444",
        "team-yellow": "#f59e0b",
        "team-purple": "#a855f7",
      },
    },
  },
  // THÊM safelist để Tailwind không purge các class được dùng động
  safelist: [
    {
      pattern: /text-(team|fund)-(green|red|yellow|purple|500|800)/,
    },
    {
      pattern: /bg-(team|fund|gray)-(green|red|yellow|purple|50|100)/,
    },
    {
      pattern: /border-(team|fund)-(green|red|yellow|purple|200|500)/,
    },
  ],
  plugins: [],
};
