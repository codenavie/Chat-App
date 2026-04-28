module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        shell: '#e0e5ec',
        panel: '#f0f2f5',
        muted: '#d1d9e6',
        ink: '#2d3436',
        accent: '#ff4757'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        card: '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        pressed: 'inset 4px 4px 10px #babecc, inset -4px -4px 10px #ffffff',
        recessed: 'inset 6px 6px 12px #c2c9d3, inset -6px -6px 12px #ffffff'
      }
    }
  },
  plugins: []
};
