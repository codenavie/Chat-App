module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        shell: '#050506',
        deep: '#020203',
        panel: '#0a0a0c',
        muted: 'rgba(255,255,255,0.05)',
        ink: '#EDEDEF',
        textmuted: '#8A8F98',
        accent: '#5E6AD2',
        'accent-bright': '#6872D9',
        'accent-glow': 'rgba(94,106,210,0.3)',
        borderc: 'rgba(255,255,255,0.06)',
        secondary: '#5E6AD2',
        tertiary: '#6872D9',
        quaternary: '#22c55e'
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Geist Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '16px'
      },
      boxShadow: {
        pop: '0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        'pop-hover': '0 0 0 1px rgba(94,106,210,0.65), 0 8px 20px rgba(94,106,210,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
        'pop-active': '0 0 0 1px rgba(94,106,210,0.45), 0 2px 8px rgba(94,106,210,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
        sticker: '0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' }
        }
      },
      animation: {
        float: 'float 9s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
