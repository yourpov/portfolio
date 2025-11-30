import type { Config } from 'tailwindcss';

export default {
  content: ['./public/**/*.{html,js}', './src/**/*.{ts,js}'],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0a',
        darker: '#050505',
        accent: '#ff6b6b',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  safelist: [
    'bg-darker',
    'bg-dark',
    'bg-dark/40',
    'bg-dark/50',
    'bg-darker/50',
    'bg-darker/80',
    'text-white',
    'text-gray-200',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'text-gray-600',
    'bg-accent',
    'text-accent',
    'border-accent',
    'text-darker',
  ],
  plugins: [],
} satisfies Config;
