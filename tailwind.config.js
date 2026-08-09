/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bronze: {
          DEFAULT: '#8B5E3C',
          50: '#F7F1EB',
          100: '#EFE3D6',
          200: '#DFC7AD',
          300: '#CFAB84',
          400: '#BF8F5B',
          500: '#8B5E3C',
          600: '#734B2F',
          700: '#5A3A24',
        },
        textDark: '#1f2937',
        textMuted: '#6b7280',
      },
      fontFamily: {
        serif: ['"DM Serif Text"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
