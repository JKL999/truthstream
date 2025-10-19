import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        verdict: {
          true: '#10b981',       // green-500
          mostlyTrue: '#84cc16', // lime-500
          mixed: '#f59e0b',      // amber-500
          mostlyFalse: '#f97316', // orange-500
          false: '#ef4444',      // red-500
          unverifiable: '#6b7280', // gray-500
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
