import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, Text, type TextProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

export function Label({ children, ...props }: TextProps) {
  const theme = useTheme();
  return <Text {...props} style={[styles.label, { color: theme.muted }, props.style]}>{children}</Text>;
}

export function Title({ children, ...props }: TextProps) {
  const theme = useTheme();
  return <Text {...props} style={[styles.title, { color: theme.ink }, props.style]}>{children}</Text>;
}

export function Body({ children, ...props }: TextProps) {
  const theme = useTheme();
  return <Text {...props} style={[styles.body, { color: theme.ink }, props.style]}>{children}</Text>;
}

export function Button({ children, onPress, variant = "primary", accessibilityLabel, disabled, style }:
  PropsWithChildren<{ onPress(): void; variant?: "primary" | "quiet" | "danger" | "secondary"; accessibilityLabel?: string; disabled?: boolean; style?: ViewStyle }>) {
  const theme = useTheme();
  const background = variant === "primary" ? theme.accent : variant === "secondary" ? theme.surface : "transparent";
  const color = variant === "primary" ? "#FFFFFF" : variant === "danger" ? theme.danger : theme.accentStrong;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof children === "string" ? children : undefined)}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, variant === "secondary" && { borderColor: theme.line, borderWidth: 1 }, { backgroundColor: background, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }, style]}
    >
      {typeof children === "string" || typeof children === "number" ? <Text style={[styles.buttonText, { color }]}>{children}</Text> : children}
    </Pressable>
  );
}

export function IconButton({ label, glyph, onPress }: { label: string; glyph: ReactNode; onPress(): void }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, { borderColor: theme.line, backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 }]}>{typeof glyph === "string" ? <Text style={{ color: theme.ink, fontSize: 22 }}>{glyph}</Text> : glyph}</Pressable>;
}

const styles = StyleSheet.create({
  label: { fontSize: 12, lineHeight: 16, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase" },
  title: { fontSize: 34, lineHeight: 38, letterSpacing: -1.1, fontWeight: "800" },
  body: { fontSize: 16, lineHeight: 23 },
  button: { minHeight: 48, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16, lineHeight: 21, fontWeight: "800" },
  iconButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
