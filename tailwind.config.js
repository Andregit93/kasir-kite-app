/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.jsx",
    "./resources/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#004ac6',
          container: '#2563eb',
          'on-primary': '#ffffff',
        },
        surface: {
          base: '#F4F7FE', // Premium canvas color (Light Blue-Grey)
          low: '#E9EDF7', // Soft tint for inputs
          lowest: '#FFFFFF', // High contrast cards
          high: '#64748B', // Slate-500 for borders
        },
        'on-surface': '#020617', // Slate-950: Extreme dark for readability
        'on-surface-variant': '#475569', // Slate-600: High-contrast secondary info
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '3rem',
        '6xl': '4rem',
      }
    },
  },
  plugins: [],
}
