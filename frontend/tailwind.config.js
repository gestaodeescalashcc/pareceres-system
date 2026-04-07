/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      colors: {
        primary: {
          50: '#eef5ff', 100: '#d9e8ff', 200: '#bcd5ff', 300: '#8ebcff',
          400: '#599cff', 500: '#3374ff', 600: '#1a56f5', 700: '#1243e1',
          800: '#1536b6', 900: '#16328f', 950: '#111f5c',
        },
        gov: {
          50: '#effdf5', 100: '#d8fbea', 200: '#b4f5d6', 300: '#7aebb5',
          400: '#3dd98e', 500: '#18c06e', 600: '#0e9d58', 700: '#0d7d48',
          800: '#10633b', 900: '#0e5133', 950: '#022d1a',
        },
        accent: {
          50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
          400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
          800: '#86198f', 900: '#701a75', 950: '#4a044e',
        },
        surface: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          800: '#1e293b', 850: '#172033', 900: '#0f172a', 950: '#020617',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'soft': '0 2px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'medium': '0 4px 16px -4px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'elevated': '0 8px 30px -6px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        'dramatic': '0 20px 60px -12px rgb(0 0 0 / 0.18), 0 8px 16px -8px rgb(0 0 0 / 0.08)',
        'glow-primary': '0 0 20px -4px rgb(26 86 245 / 0.3)',
        'glow-gov': '0 0 20px -4px rgb(14 157 88 / 0.3)',
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0.01' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0.01', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0.01', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0.01', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0.01', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0.01', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'bar-grow': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'fade-in-down': 'fade-in-down 0.3s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        'slide-in-right': 'slide-in-right 0.35s ease-out both',
        'slide-in-left': 'slide-in-left 0.35s ease-out both',
        'shimmer': 'shimmer 2s infinite linear',
        'count-up': 'count-up 0.6s ease-out both',
        'bar-grow': 'bar-grow 0.8s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    }
  },
  plugins: []
}
