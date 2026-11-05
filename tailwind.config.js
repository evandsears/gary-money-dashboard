/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        m3: {
          primary: '#131F19',
          'primary-container': '#213329',
          'on-primary': '#EAF2D3',
          secondary: '#2D4F38',
          tertiary: '#A3D9A5',
          'tertiary-hover': '#8BCE8D',
          surface: '#F0F4DB',
          'surface-container': '#FCFDF6',
          'surface-high': '#E1EBC2',
          'surface-highest': '#D5E1B2',
          outline: '#EAF2D3',
          error: '#B04C4C',
          'error-container': '#FFE8E8',
          'on-error': '#FFFFFF',
          neutral: {
            900: '#1c1917',
            800: '#292524',
            700: '#44403c',
            600: '#57534e',
            500: '#78716c',
            400: '#a8a29e',
            300: '#d6d3d1',
            200: '#e7e5e4',
            100: '#f5f5f4',
            50: '#fafaf9',
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        'm3-sm': '0.5rem',
        'm3-md': '1rem',
        'm3-lg': '1.5rem',
        'm3-xl': '2rem',
        'm3-full': '9999px',
      },
      boxShadow: {
        'm3-1': '0px 1px 3px 1px rgba(19, 31, 25, 0.08), 0px 1px 2px 0px rgba(19, 31, 25, 0.05)',
        'm3-2': '0px 2px 6px 2px rgba(19, 31, 25, 0.08), 0px 1px 2px 0px rgba(19, 31, 25, 0.04)',
        'm3-3': '0px 4px 12px 3px rgba(19, 31, 25, 0.10), 0px 1px 3px 0px rgba(19, 31, 25, 0.06)',
        'm3-4': '0px 6px 16px 4px rgba(19, 31, 25, 0.12), 0px 2px 4px 0px rgba(19, 31, 25, 0.08)',
      }
    },
  },
  plugins: [],
}
