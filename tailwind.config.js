/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'kaleido-bg': '#0a0e27',
        'kaleido-bg-light': '#12183d',
        'kaleido-pink': '#ff2d95',
        'kaleido-blue': '#00f0ff',
        'kaleido-purple': '#b967ff',
        'kaleido-yellow': '#ffd700',
        'kaleido-green': '#39ff14',
        'kaleido-orange': '#ff6b35',
      },
      fontFamily: {
        display: ['"Orbitron"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 45, 149, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 240, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(185, 103, 255, 0.5)',
        'glow-strong': '0 0 40px rgba(185, 103, 255, 0.6), 0 0 80px rgba(0, 240, 255, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(185, 103, 255, 0.5), 0 0 10px rgba(0, 240, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(185, 103, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
