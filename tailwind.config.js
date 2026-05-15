/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#e8ecef',
          surface: '#e8ecef',
          primary: '#6c63ff',
          'primary-dark': '#574fd6',
          accent: '#a78bfa',
          text: '#2d3748',
          'text-secondary': '#718096',
          success: '#48bb78',
          warning: '#ed8936',
          error: '#fc5c7d',
        }
      },
      boxShadow: {
        'neo': '8px 8px 16px #c5ccd4, -8px -8px 16px #ffffff',
        'neo-sm': '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff',
        'neo-inset': 'inset 4px 4px 8px #c5ccd4, inset -4px -4px 8px #ffffff',
        'neo-pressed': '2px 2px 5px #c5ccd4, -2px -2px 5px #ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
