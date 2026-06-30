export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          brand: {
            50:  '#E6F4EA',
            100: '#C8E6D0',
            200: '#95CBA4',
            400: '#4CAF72',
            500: '#2D8A4E',
            600: '#1E6E35',
            700: '#155227',
          },
        },
        fontFamily: {
          sans: ['Sora', 'sans-serif'],
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.25rem',
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-out',
          'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        keyframes: {
          fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
          slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        },
      },
    },
    plugins: [],
  }