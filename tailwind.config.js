/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#c9973a',
        'gold-light': '#e8b84b',
        cream: '#f5e6c8',
        'cream-muted': '#c4aa85',
        dark: '#0e0b06',
        surface: '#1a1408',
        card: '#221c0e',
        'card-hover': '#2a2212',
        bronze: '#7a4f28',
        ember: '#8b3a1a',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'check-bounce': 'checkBounce 0.4s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        checkBounce: { '0%': { transform: 'scale(0)' }, '60%': { transform: 'scale(1.2)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
