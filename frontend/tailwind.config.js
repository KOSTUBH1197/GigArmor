/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Indigo (updated from old blue)
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Brand accent — Cyan
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        // Surface — Slate (replaces old neutral)
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'soft':       '0 2px 15px -3px rgba(0,0,0,.07), 0 10px 20px -2px rgba(0,0,0,.04)',
        'card':       '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,.10), 0 12px 32px rgba(0,0,0,.06)',
        'glow':       '0 0 20px rgba(79,70,229,.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease both',
        'slide-up':      'slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'slide-down':    'slideDown 0.3s ease both',
        'pulse-soft':    'pulseSoft 3s ease-in-out infinite',
        'float':         'float 4s ease-in-out infinite',
        'toast-in':      'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'shimmer':       'shimmer 1.5s infinite',
        'pulse-ring':    'pulseRing 1.5s ease-out infinite',
        'spin':          'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        toastIn:   { from: { opacity: '0', transform: 'translateX(24px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:   { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(79,70,229,0.4)' },
          '70%':  { boxShadow: '0 0 0 10px rgba(79,70,229,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(79,70,229,0)' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}