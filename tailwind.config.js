/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "sub-background": "var(--sub-background)",
        foreground: "var(--foreground)",
        "main-purple": "var(--main-purple)",
        "sub-purple": "var(--sub-purple)",
        "main-pink": "var(--main-pink)",
      },
    },
  },
  plugins: [],
};
