module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        shell: '#FAFAF8',
        deep: '#F5F3F0',
        panel: '#FFFFFF',
        muted: '#F5F3F0',
        ink: '#1A1A1A',
        textmuted: '#6B6B6B',
        accent: '#B8860B',
        'accent-bright': '#D4A84B',
        'accent-glow': 'rgba(184,134,11,0.24)',
        borderc: '#E8E4DF',
        secondary: '#B8860B',
        tertiary: '#D4A84B',
        quaternary: '#1A1A1A'
      },
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '8px'
      },
      boxShadow: {
        pop: '0 1px 2px rgba(26,26,26,0.04)',
        'pop-hover': '0 4px 12px rgba(26,26,26,0.06)',
        'pop-active': '0 1px 2px rgba(26,26,26,0.04)',
        sticker: '0 4px 12px rgba(26,26,26,0.06)'
      }
    }
  },
  plugins: []
};
