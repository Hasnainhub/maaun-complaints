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
                brand: {
                    blue: '#1e3a8a',
                    blueLight: '#2563eb',
                    gold: '#eab308',
                    goldLight: '#fde047',
                    dark: '#1e293b',
                    light: '#f8fafc',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'maaun-gate': "url('/7E4A1996.jpg')",
            },
        },
    },
    plugins: [],
}
export default config
