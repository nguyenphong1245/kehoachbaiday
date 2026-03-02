import type { Config } from "tailwindcss";
import tailwindScrollbar from "tailwind-scrollbar";

const config: Config = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0284c7", // sky-600 — xanh nước biển vừa
          dark: "#0369a1",    // sky-700
          light: "#0ea5e9",   // sky-500
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'soft-lg': '0 4px 25px -5px rgba(0,0,0,0.1), 0 10px 30px -5px rgba(0,0,0,0.05)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
            code: {
              color: '#ec4899',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
            },
          },
        },
      },
    },
  },
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
    require('@tailwindcss/typography'),
  ],
};

export default config;
