import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0d2118',
          mid:     '#152e1e',
          light:   '#1e4d31',
        },
        leaf:    '#1c5735',
        sage: {
          DEFAULT: '#3a7550',
          light:   '#4f8f66',
        },
        gold: {
          DEFAULT: '#c5923a',
          warm:    '#d4a84e',
          pale:    '#f0ddb5',
          faint:   '#2a2210',
        },
        surface: {
          DEFAULT: '#0d2118',
          1:       '#152e1e',
          2:       '#1a3825',
          3:       '#203f2b',
        },
        ink: {
          DEFAULT: '#f0ede8',
          soft:    '#c8c4bc',
          mid:     '#8a8680',
          muted:   '#5e5c58',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['Syne', 'system-ui', 'sans-serif'],
        mono:    ['Syne Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '5px',
        md:      '8px',
        lg:      '10px',
      },
      transitionTimingFunction: {
        'ease-out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
}

export default config
