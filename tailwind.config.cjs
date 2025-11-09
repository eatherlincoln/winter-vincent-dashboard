/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
