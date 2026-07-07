import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pathzy: {
          bg: "#050816",
          panel: "#0B1020",
          blue: "#5B8CFF",
          purple: "#7B5CFF"
        }
      },
      borderRadius: {
        pathzy: "24px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      opacity: {
        7: "0.07",
        8: "0.08",
        12: "0.12",
        42: "0.42",
        48: "0.48",
        52: "0.52",
        58: "0.58",
        62: "0.62",
        66: "0.66",
        68: "0.68",
        70: "0.70",
        72: "0.72",
        74: "0.74",
        76: "0.76",
        78: "0.78",
        82: "0.82"
      }
    }
  },
  plugins: []
};

export default config;
