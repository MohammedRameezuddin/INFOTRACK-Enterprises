/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8', // Electric Cyan/Sky Blue from screenshot logo
          500: '#0ea5e9',
          600: '#0284c7', // Royal Electric Blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        navy: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#eef2f6',
          300: '#e6eef6',
          400: '#cfe6f3',
          500: '#bfdff0',
          600: '#9fc7e6',
          700: '#6faecf',
          800: '#3f8fb8',
          900: '#1f5f7a',
          950: '#ffffff',
        },
        electric: {
          light: '#38bdf8', // Matching the sky blue highlights
          DEFAULT: '#00a3ff', // Bright electric blue
          dark: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

