/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                black: "#050505",
                white: "#ffffff",
                grey: {
                    50: "#f9fafb",
                    100: "#f3f4f6",
                    200: "#e5e7eb",
                    300: "#d1d5db",
                    400: "#9ca3af",
                    500: "#6b7280",
                    600: "#4b5563",
                    700: "#374151",
                    800: "#1f2937",
                    900: "#111827",
                    950: "#030712",
                },
                // Semantic colors maps
                bg: {
                    primary: "#050505", // black
                    secondary: "#030712", // grey-950
                    tertiary: "#111827", // grey-900
                },
                text: {
                    primary: "#ffffff", // white
                    secondary: "#9ca3af", // grey-400
                    muted: "#4b5563", // grey-600
                },
                border: {
                    primary: "#1f2937", // grey-800
                    secondary: "#374151", // grey-700
                }
            },
            fontFamily: {
                outfit: ['var(--font-outfit)'],
                inter: ['var(--font-inter)'],
            },
            spacing: {
                container: "1400px",
            }
        },
    },
    plugins: [],
};
