module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        shell: '#FFFDF5',
        panel: '#FFFFFF',
        muted: '#F1F5F9',
        ink: '#1E293B',
        accent: '#8B5CF6',
        secondary: '#F472B6',
        tertiary: '#FBBF24',
        quaternary: '#34D399',
        borderc: '#E2E8F0'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px'
      },
      boxShadow: {
        pop: '4px 4px 0px 0px #1E293B',
        'pop-hover': '6px 6px 0px 0px #1E293B',
        'pop-active': '2px 2px 0px 0px #1E293B',
        sticker: '8px 8px 0px 0px #E2E8F0'
      }
    }
  },
  plugins: []
};
