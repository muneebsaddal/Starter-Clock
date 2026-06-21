import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { Feeding } from "@/domain/models";
import { formatHydration, formatPeakWindow, formatRatio, formatTime } from "@/domain/presentation";
import { useTracking } from "../tracking-context";
import { useTheme } from "../theme";
import { BottomNavigation } from "../components/bottom-navigation.native";
import { FeedingModal } from "../components/feeding-modal.native";
import { Body, Button, Label, Title } from "../components/primitives";
import { useNow } from "../use-now";

export function HistoryScreen() {
  const theme = useTheme(); const { selectedStarter, feedings } = useTracking(); const [editing, setEditing] = useState<Feeding | undefined>(); const now = useNow();
  const groups = useMemo(() => groupByDate(feedings), [feedings]);
  return <View style={[styles.root, { backgroundColor: theme.paper }]}>
    <ScrollView contentContainerStyle={styles.content}>
      <Label>{selectedStarter?.name ?? "Starter Clock"}</Label><Title>Feeding history</Title>
      <View style={[styles.freeNote, { backgroundColor: theme.sageSoft }]}><Body style={{ color: theme.sage, fontSize: 13 }}>Showing your 30 most recent feedings on Free.</Body></View>
      {feedings.length === 0 ? <View style={styles.empty}><Title style={{ fontSize: 25 }}>No feedings yet.</Title><Body style={{ color: theme.muted }}>Your saved feedings will appear here, newest first.</Body></View> : groups.map(([date, entries]) => <View key={date} style={styles.group}>
        <Label>{date}</Label>
        {entries.map((feeding) => <Button key={feeding.id} variant="secondary" accessibilityLabel={`Open feeding from ${formatTime(feeding.fedAtMs)}`} onPress={() => setEditing(feeding)} style={styles.row}>
          <View style={{ flex: 1 }}><Text style={[styles.rowTitle, { color: theme.ink }]}>{formatTime(feeding.fedAtMs)}</Text><Text style={{ color: theme.muted }}>{formatRatio(feeding)} · {formatHydration(feeding)}{feeding.flourType ? ` · ${feeding.flourType.replaceAll("_", " ")}` : ""}</Text><Text style={{ color: theme.sage, marginTop: 5, fontSize: 12 }}>{feeding.observation ? `Observed peak ${formatTime(feeding.observation.observedAtMs)}` : `Peak estimated ${formatPeakWindow(feeding.estimate, now)}`}</Text></View><Text style={{ color: theme.muted, fontSize: 24 }}>›</Text>
        </Button>)}
      </View>)}
    </ScrollView>
    <BottomNavigation />
    {editing ? <FeedingModal visible nowMs={now} feeding={editing} onClose={() => setEditing(undefined)} /> : null}
  </View>;
}

function groupByDate(feedings: Feeding[]): [string, Feeding[]][] {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });
  const map = new Map<string, Feeding[]>();
  for (const feeding of feedings) { const key = formatter.format(feeding.fedAtMs); map.set(key, [...(map.get(key) ?? []), feeding]); }
  return [...map.entries()];
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 22, paddingTop: 36, paddingBottom: 40 }, freeNote: { borderRadius: 14, padding: 12, marginTop: 18 }, empty: { paddingVertical: 72, alignItems: "center", gap: 8 }, group: { gap: 10, marginTop: 26 }, row: { flexDirection: "row", alignItems: "center", textAlign: "left", padding: 16 }, rowTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 } });
