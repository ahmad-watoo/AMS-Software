import { createContext, useState, useMemo } from "react";
import { ConfigProvider, theme } from "antd";

// Define your color tokens
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        primaryColor: "#1F2A40",
        greenAccentColor: "#4cceac",
        redAccentColor: "#db4f4a",
        blueAccentColor: "#6870fa",
        greyColors: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
      }
    : {
        primaryColor: "#f2f0f0",
        greenAccentColor: "#4cceac",
        redAccentColor: "#db4f4a",
        blueAccentColor: "#6870fa",
        greyColors: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
      }),
});

// Ant Design theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    token: {
      // Customize token values based on light/dark mode
      colorPrimary: colors.primaryColor,
      colorSuccess: colors.greenAccentColor,
      colorError: colors.redAccentColor,
      colorWarning: colors.blueAccentColor,
      colorTextBase: colors.greyColors[500],
    },
    components: {
      Layout: {
        colorBgLayout: mode === "dark" ? colors.greyColors[900] : "#ffffff",
      },
    },
    // Adjusting typography (Ant Design does not allow deep typography customization)
    typography: {
      fontFamily: "Source Sans Pro, sans-serif",
    },
  };
};

// Context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  // Ant Design uses ConfigProvider for theming
  const themeConfig = useMemo(() => themeSettings(mode), [mode]);

  return [themeConfig, colorMode];
};
