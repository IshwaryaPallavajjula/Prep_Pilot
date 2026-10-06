/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sora"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#12141C',
          soft: '#1C1F2B',
        },
        paper: {
          DEFAULT: '#F6F6F4',
          raised: '#FFFFFF',
        },
        runway: {
          50: '#EEF2FF',
          100: '#DCE4FF',
          200: '#B9C9FF',
          300: '#8CA4FF',
          400: '#5C79F5',
          500: '#3455E8',
          600: '#243FC7',
          700: '#1C319E',
          800: '#182A7D',
          900: '#151F52',
        },
        amber: {
          50: '#FDF6E9',
          100: '#FBEAC7',
          400: '#EDAB3D',
          500: '#DB9524',
          600: '#B5791A',
        },
        signal: {
          green: '#1D9A6C',
          red: '#D5544A',
          amber: '#DB9524',
          slate: '#5B6472',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 20, 28, 0.04), 0 1px 12px rgba(18, 20, 28, 0.06)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
}
