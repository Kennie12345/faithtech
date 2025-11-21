import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ==================================
           LEGACY SHADCN UI COMPATIBILITY
           ================================== */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        "background-alt": "hsl(var(--background-alt))",

        /* ==================================
           BRAND COLORS (Direct Access)
           ================================== */

        // Yellows (Primary Brand)
        "brand-yellow-100": "var(--brand--yellow-100)", // #fff737
        "brand-yellow-200": "var(--brand--yellow-200)", // #ffd800

        // Greys & Beige (Neutrals)
        "brand-grey-100": "var(--brand--grey-100)", // #f5f0f0
        "brand-grey-200": "var(--brand--grey-200)", // #e9e7e4
        "brand-grey-300": "var(--brand--grey-300)", // #e5e0d8
        "brand-grey-400": "var(--brand--grey-400)", // #cdcdcd
        "brand-grey-500": "var(--brand--grey-500)", // #c6c5bb

        // Greens (Accents)
        "brand-green-100": "var(--brand--green-100)", // #bae386
        "brand-green-200": "var(--brand--green-200)", // #32a432

        // Oranges (Accents)
        "brand-orange-100": "var(--brand--orange-100)", // #ffb300
        "brand-orange-200": "var(--brand--orange-200)", // #f05228

        // Blues (Accents)
        "brand-blue-100": "var(--brand--blue-100)", // #8adfff
        "brand-blue-200": "var(--brand--blue-200)", // #1d8fb9

        /* ==================================
           SWATCHES (Foundation Layer)
           ================================== */
        "swatch-light": "var(--swatch--light)",
        "swatch-dark": "var(--swatch--dark)",
        "swatch-brand": "var(--swatch--brand)",
        "swatch-brand-text": "var(--swatch--brand-text)",
        "swatch-transparent": "var(--swatch--transparent)",
        "swatch-faded-mid": "var(--swatch--faded-mid)",
        "swatch-faded-dark": "var(--swatch--faded-dark)",
        "swatch-faded-light": "var(--swatch--faded-light)",

        /* Legacy aliases (for backwards compatibility) */
        "grey-100": "var(--brand--grey-100)",
        "grey-200": "var(--brand--grey-200)",
        "grey-300": "var(--brand--grey-300)",
        "grey-400": "var(--brand--grey-400)",
        "grey-500": "var(--brand--grey-500)",
        dark: "var(--swatch--dark)",
        light: "var(--swatch--light)",
      },

      spacing: {
        /* Map spacing variables to Tailwind utilities */
        "space-1": "var(--_spacing---space--1)",
        "space-2": "var(--_spacing---space--2)",
        "space-3": "var(--_spacing---space--3)",
        "space-4": "var(--_spacing---space--4)",
        "space-4-5": "var(--_spacing---space--4-5)",
        "space-5": "var(--_spacing---space--5)",
        "space-5-5": "var(--_spacing---space--5-5)",
        "space-6": "var(--_spacing---space--6)",
        "space-6-5": "var(--_spacing---space--6-5)",
        "space-7": "var(--_spacing---space--7)",
        "space-8": "var(--_spacing---space--8)",
        "space-9": "var(--_spacing---space--9)",
        "space-10": "var(--_spacing---space--10)",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        /* Extended radius values from design system */
        "radius-0-1875": "var(--radius--0-1875)",
        "radius-0-25": "var(--radius--0-25)",
        "radius-0-375": "var(--radius--0-375)",
        "radius-0-5": "var(--radius--0-5)",
        "radius-round": "var(--radius--round)",
      },

      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        decorative: ["var(--font-decorative)", "cursive"],
        /* Design system fonts */
        heading: ["var(--_typography---heading-font--heading-family)", "Arial", "sans-serif"],
        body: ["var(--_typography---body-font--paragraph-family)", "Arial", "sans-serif"],
        accent: ["var(--_typography---accent-font--accent-family)", "Palatino Linotype", "sans-serif"],
      },

      fontSize: {
        /* Typography system font sizes */
        "p-12": "var(--_typography---font-size--p-12)",
        "p-14": "var(--_typography---font-size--p-14)",
        "p-16": "var(--_typography---font-size--p-16)",
        "p-18": "var(--_typography---font-size--p-18)",
        "p-20": "var(--_typography---font-size--p-20)",
        /* Heading sizes */
        "h-display": "var(--_typography---heading-size--display)",
        "h0": "var(--_typography---heading-size--h0)",
        "h1": "var(--_typography---heading-size--h1)",
        "h2": "var(--_typography---heading-size--h2)",
        "h3": "var(--_typography---heading-size--h3)",
        "h4": "var(--_typography---heading-size--h4)",
        "h5": "var(--_typography---heading-size--h5)",
        "h6": "var(--_typography---heading-size--h6)",
        "h1-large": "var(--_typography---heading-size--h1-large)",
        /* Label sizes */
        "label-16": "var(--_typography---label-size--label-16)",
        "label-14": "var(--_typography---label-size--label-14)",
        "label-12": "var(--_typography---label-size--label-12)",
      },

      lineHeight: {
        /* Typography system line heights */
        "lh-1": "var(--_typography---line-height--1)",
        "lh-1-05": "var(--_typography---line-height--1-05)",
        "lh-1-0625": "var(--_typography---line-height--1-0625)",
        "lh-1-1": "var(--_typography---line-height--1-1)",
        "lh-1-167": "var(--_typography---line-height--1-167)",
        "lh-1-33": "var(--_typography---line-height--1-33)",
        "lh-1-4": "var(--_typography---line-height--1-4)",
        "lh-1-428": "var(--_typography---line-height--1-428)",
        "lh-1-44": "var(--_typography---line-height--1-44)",
        "lh-1-5": "var(--_typography---line-height--1-5)",
      },

      letterSpacing: {
        /* Typography system letter spacing */
        "ls-3": "var(--_typography---letter-spacing--3)",
        "ls-2": "var(--_typography---letter-spacing--2)",
        "ls-1": "var(--_typography---letter-spacing--1)",
        "ls-0": "var(--_typography---letter-spacing--0)",
        "ls-0-3": "var(--_typography---letter-spacing--0-3)",
        "ls-6": "var(--_typography---letter-spacing--6)",
        "ls-8": "var(--_typography---letter-spacing--8)",
      },

      fontWeight: {
        /* Typography system font weights */
        "300": "var(--_typography---font-weight--weight-300)",
        "400": "var(--_typography---font-weight--weight-400)",
        "500": "var(--_typography---font-weight--weight-500)",
        "600": "var(--_typography---font-weight--weight-600)",
        "700": "var(--_typography---font-weight--weight-700)",
      },

      maxWidth: {
        /* Container system */
        "container-main": "var(--container--main)",
        "container-small": "var(--container--small)",
        "container-full": "var(--container--full)",
        "container-large": "var(--container--large)",
        "container-max": "var(--container--max)",
      },

      gridTemplateColumns: {
        /* Grid system */
        "grid-1": "var(--grid-1)",
        "grid-2": "var(--grid-2)",
        "grid-3": "var(--grid-3)",
        "grid-4": "var(--grid-4)",
        "grid-5": "var(--grid-5)",
        "grid-6": "var(--grid-6)",
        "grid-7": "var(--grid-7)",
        "grid-8": "var(--grid-8)",
        "grid-9": "var(--grid-9)",
        "grid-10": "var(--grid-10)",
        "grid-11": "var(--grid-11)",
        "grid-12": "var(--grid-12)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
