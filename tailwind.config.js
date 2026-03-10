/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'app.vue',
    'app/**/*.{vue,js,ts,jsx,tsx}',
    'app/components/**/*.{vue,js,ts,jsx,tsx}',
    'app/pages/**/*.{vue,js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          DEFAULT: '#3B82F6', // Electric Blue
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
        secondary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          DEFAULT: '#ef4444', // Vibrant Red
          light: '#f87171',
          dark: '#dc2626',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          DEFAULT: '#10B981', // Emerald Glow
          light: '#34d399',
          dark: '#059669',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          DEFAULT: '#EF4444',
          light: '#f87171',
          dark: '#b91c1c',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          DEFAULT: '#F59E0B',
          light: '#fbbf24',
          dark: '#d97706',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          DEFAULT: '#3B82F6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        background: {
          light: '#ffffff',
          dark: '#0B1120', // Deep Midnight Navy
        },
        surface: {
          light: '#f8fafc',
          dark: '#1e293b',
        },
        border: {
          light: '#e2e8f0',
          dark: '#334155',
        },
        text: {
          light: '#1e293b',
          dark: '#f1f5f9',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        'section': '120px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'brutal': '0px',
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 15px -3px rgba(59, 130, 246, 0.5)',
        'glow-secondary': '0 0 15px -3px rgba(239, 68, 68, 0.5)',
        'glow-success': '0 0 15px -3px rgba(16, 185, 129, 0.5)',
      }
    },
  },
  plugins: [],
}