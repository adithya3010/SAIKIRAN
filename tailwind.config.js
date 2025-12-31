/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
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
                background: "var(--background)",
                foreground: "var(--foreground)",

                bg: {
                    primary: "var(--background)",
                    secondary: "var(--background-secondary)",
                    tertiary: "var(--background-tertiary)",
                },
                text: {
                    primary: "var(--foreground)",
                    secondary: "var(--foreground-secondary)",
                    muted: "var(--foreground-muted)",
                },
                border: {
                    primary: "var(--border-primary)",
                    secondary: "var(--border-secondary)",
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
