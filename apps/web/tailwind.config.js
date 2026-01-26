/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: '#CCCCCC',
                input: '#CCCCCC',
                ring: '#0056b3',
                background: '#FFFFFF',
                foreground: '#333333',
                primary: {
                    DEFAULT: '#0056b3',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#E1E1E1',
                    foreground: '#333333',
                },
                destructive: {
                    DEFAULT: '#FF0000',
                    foreground: '#FFFFFF',
                },
                muted: {
                    DEFAULT: '#F8F8F8',
                    foreground: '#555555',
                },
                accent: {
                    DEFAULT: '#E1E1E1',
                    foreground: '#333333',
                },
                popover: {
                    DEFAULT: '#FFFFFF',
                    foreground: '#333333',
                },
                card: {
                    DEFAULT: '#FFFFFF',
                    foreground: '#333333',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: 0 },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: 0 },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                pulse: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                shimmer: 'shimmer 2s linear infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
};
