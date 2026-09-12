/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces_600SemiBold', 'ui-serif', 'serif'],
        sans: ['Inter_400Regular', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
