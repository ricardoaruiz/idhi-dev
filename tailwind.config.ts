import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        roboto: 'Roboto, sans-serif',
        kanit: 'Kanit, sans-serif',
        montserrat: 'Montserrat, sans-serif'
      }
    },
  },
  plugins: [],
} satisfies Config

