export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'text-base': 'var(--color-text-base)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)'
      },
      fontFamily: {
        sans: ['Ubuntu', 'sans-serif'],
        display: ['Permanent Marker', 'cursive']
      }
    }
  },
  plugins: []
}
