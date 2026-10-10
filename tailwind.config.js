/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nuit: '#0A1929',
        royal: '#1E40AF',
        cloud: '#F3F4F6',
        accent: '#2563EB'
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(10, 25, 41, 0.10)',
        card: '0 8px 30px -8px rgba(10, 25, 41, 0.12)'
      }
    }
  },
  plugins: []
}
