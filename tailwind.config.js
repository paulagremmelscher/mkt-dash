/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto"', 'sans-serif'],
      },
      colors: {
        r: {
          green:    '#95C11F',
          'green-d':'#7AA318',
          'green-l':'#B8DC5A',
          'green-xl':'#DFF2A0',
          'green-bg':'#EEF8D4',
          gray:     '#575756',
          'gray-l': '#8A8A89',
          'gray-xl':'#E0E0DF',
          bg:       '#F4F7EE',
          surface:  '#FAFDF5',
          border:   '#D8E8B8',
          black:    '#1C1C1B',
        },
      },
      boxShadow: {
        card: '0 1px 8px rgba(87,119,22,0.08)',
        'card-h': '0 4px 24px rgba(87,119,22,0.14)',
      },
    },
  },
  plugins: [],
}
