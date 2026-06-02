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
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal accent
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        medical: {
          50: '#f4f7fb',
          100: '#e8eef6',
          200: '#cbd9ea',
          300: '#9db8da',
          400: '#6890c5',
          500: '#4672ab', // Royal medical blue
          600: '#35598d',
          700: '#2c4873',
          800: '#273f62',
          900: '#243752',
          950: '#182438',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 8px 30px rgb(0, 0, 0, 0.04)',
        'premium-hover': '0 20px 40px rgb(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
