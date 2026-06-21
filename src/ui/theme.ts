import { useColorScheme } from "react-native";

const light = {
  paper: "#F7F2E9", surface: "#FFFDF8", ink: "#2D2925", muted: "#716A62", line: "#DED5C8",
  accent: "#9B4F35", accentStrong: "#743722", sage: "#58705D", sageSoft: "#DCE5DA",
  warning: "#765B19", warningSoft: "#FFF2C9", danger: "#A33A32", scrim: "rgba(20,16,12,0.58)",
};

const dark = {
  paper: "#1F1C19", surface: "#2A2622", ink: "#F5EEE4", muted: "#BDB4A8", line: "#4A433B",
  accent: "#DF8F70", accentStrong: "#F1AD92", sage: "#A9BEA8", sageSoft: "#34443A",
  warning: "#F3D77F", warningSoft: "#4A3B17", danger: "#FF9D95", scrim: "rgba(0,0,0,0.68)",
};

export type Theme = typeof light;
export function useTheme(): Theme { return useColorScheme() === "dark" ? dark : light; }
