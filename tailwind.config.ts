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
        leaf:  '#1c5735',
        sage: {
          DEFAULT: '#3a7550',
          light:   '#4f8f66',
        },
        gold: {
          DEFAULT: '#c5923a',
          warm:    '#d4a84e',
          pale:    '#f0ddb5',
          faint:   '#fdf6e8',
        },
        surface: {
          DEFAULT: '#f5f4f1',
          card:    '#ffffff',
          hover:   '#f9f8f5',
        },
        ink: {
          DEFAULT: '#0f1a14',
          soft:    '#2d3d34',
          mid:     '#516058',
          muted:   '#7a8f82',
        },
        rule: {
          DEFAULT: '#e4e1da',
          soft:    '#ece9e2',
          mid:     '#d8d4cc',
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
        'ease-out-strong':    'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
}

export default config
