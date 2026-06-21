import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";

export function BottomNavigation() {
  const theme = useTheme(); const pathname = usePathname(); const router = useRouter();
  return <View accessibilityRole="tablist" style={[styles.bar, { backgroundColor: theme.paper, borderColor: theme.line }]}>
    <Tab label="Today" icon="◷" selected={pathname === "/"} onPress={() => router.replace("/")} />
    <Tab label="History" icon="≡" selected={pathname === "/history"} onPress={() => router.replace("/history")} />
  </View>;
}

function Tab({ label, icon, selected, onPress }: { label: string; icon: string; selected: boolean; onPress(): void }) {
  const theme = useTheme(); return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} onPress={onPress} style={styles.tab}><Text style={{ color: selected ? theme.accentStrong : theme.muted, fontSize: 22 }}>{icon}</Text><Text style={{ color: selected ? theme.accentStrong : theme.muted, fontSize: 12, fontWeight: selected ? "800" : "600" }}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ bar: { minHeight: 72, borderTopWidth: 1, flexDirection: "row", paddingHorizontal: 20, paddingBottom: 8 }, tab: { flex: 1, minHeight: 56, alignItems: "center", justifyContent: "center", gap: 2 } });
