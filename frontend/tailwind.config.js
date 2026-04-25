/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0D1B2A',
          800: '#112236',
          700: '#162D44',
        },
        teal: {
          DEFAULT: '#00C9A7',
          dark: '#00A688',
        },
        coral: {
          DEFAULT: '#FF6B35',
          dark: '#E05520',
        },
        yellow: {
          DEFAULT: '#FFE66D',
        }
      },
      fontFamily: {
        heading: ['Unbounded', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
