import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-dark': '#180404',
                'secondary-dark': '#2c0a0a',
                'accent-orange': '#ea580c',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config
