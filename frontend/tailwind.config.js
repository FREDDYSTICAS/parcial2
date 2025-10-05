/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta del molino de arroz
        dorado: '#D4AF37',
        marron: '#8B4513',
        verde: '#228B22',
        'gris-claro': '#F5F5F5',
        'gris-medio': '#CCCCCC',
        'gris-oscuro': '#666666',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
