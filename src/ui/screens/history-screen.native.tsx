import { useCallback, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View, type SectionListRenderItem } from "react-native";
import type { Feeding } from "@/domain/models";
import { formatHydration, formatPeakWindow, formatRatio, formatTime } from "@/domain/presentation";
import { useTracking } from "../tracking-context";
import { useTheme } from "../theme";
import { BottomNavigation } from "../components/bottom-navigation.native";
import { FeedingModal } from "../components/feeding-modal.native";
import { Body, Button, Label, Title } from "../components/primitives";
import { useNow } from "../use-now";
import { ProModal } from "../components/pro-modal.native";

export function HistoryScreen() {
  const theme = useTheme(); const { selectedStarter, feedings, entitlement, hasMoreFeedings, loadingMoreFeedings, loadMoreFeedings } = useTracking(); const [editing, setEditing] = useState<Feeding | undefined>(); const [proOpen, setProOpen] = useState(false); const now = useNow();
  const groups = useMemo(() => groupByDate(feedings), [feedings]);
  const renderFeeding = useCallback<SectionListRenderItem<Feeding, HistorySection>>(({ item: feeding }) => <Button variant="secondary" accessibilityLabel={`Open feeding from ${formatTime(feeding.fedAtMs)}`} onPress={() => setEditing(feeding)} style={styles.row}>
    <View style={{ flex: 1 }}><Text style={[styles.rowTitle, { color: theme.ink }]}>{formatTime(feeding.fedAtMs)}</Text><Text style={{ color: theme.muted }}>{formatRatio(feeding)} · {formatHydration(feeding)}{feeding.flourType ? ` · ${feeding.flourType.replaceAll("_", " ")}` : ""}</Text><Text style={{ color: theme.sage, marginTop: 5, fontSize: 12 }}>{feeding.observation ? `Observed peak ${formatTime(feeding.observation.observedAtMs)}` : `Peak estimated ${formatPeakWindow(feeding.estimate, now)}`}</Text></View><Text style={{ color: theme.muted, fontSize: 24 }}>›</Text>
  </Button>, [now, theme]);
  return <View style={[styles.root, { backgroundColor: theme.paper }]}>
    <SectionList
      sections={groups}
      keyExtractor={(feeding) => feeding.id}
      renderItem={renderFeeding}
      renderSectionHeader={({ section }) => <Label style={styles.sectionHeader}>{section.title}</Label>}
      ListHeaderComponent={<><Label>{selectedStarter?.name ?? "Starter Clock"}</Label><Title>Feeding history</Title>{entitlement.level === "free" ? <Button variant="secondary" onPress={() => setProOpen(true)} style={styles.freeNote}><Body style={{ color: theme.sage, fontSize: 13 }}>Showing the 30 most recent feedings on Free. Unlock complete retained history.</Body></Button> : <View style={[styles.freeNote, { backgroundColor: theme.sageSoft }]}><Body style={{ color: theme.sage, fontSize: 13 }}>Complete retained history · Lifetime Pro</Body></View>}</>}
      ListEmptyComponent={<View style={styles.empty}><Title style={{ fontSize: 25 }}>No feedings yet.</Title><Body style={{ color: theme.muted }}>Your saved feedings will appear here, newest first.</Body></View>}
      ListFooterComponent={loadingMoreFeedings ? <Body style={[styles.loadingMore, { color: theme.muted }]}>Loading more history…</Body> : hasMoreFeedings ? <Body style={[styles.loadingMore, { color: theme.muted }]}>Scroll to load more history.</Body> : null}
      contentContainerStyle={styles.content}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      onEndReached={() => void loadMoreFeedings()}
      onEndReachedThreshold={0.4}
      stickySectionHeadersEnabled={false}
      windowSize={7}
    />
    <BottomNavigation />
    {editing ? <FeedingModal visible nowMs={now} feeding={editing} onClose={() => setEditing(undefined)} /> : null}
    {proOpen ? <ProModal visible onClose={() => setProOpen(false)} /> : null}
  </View>;
}

interface HistorySection { title: string; data: Feeding[] }

function groupByDate(feedings: Feeding[]): HistorySection[] {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });
  const map = new Map<string, Feeding[]>();
  for (const feeding of feedings) {
    const key = formatter.format(feeding.fedAtMs);
    const existing = map.get(key);
    if (existing) existing.push(feeding);
    else map.set(key, [feeding]);
  }
  return [...map.entries()].map(([title, data]) => ({ title, data }));
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 22, paddingTop: 36, paddingBottom: 40 }, freeNote: { borderRadius: 14, padding: 12, marginTop: 18 }, empty: { paddingVertical: 72, alignItems: "center", gap: 8 }, sectionHeader: { marginTop: 26, marginBottom: 10 }, row: { flexDirection: "row", alignItems: "center", textAlign: "left", padding: 16, marginBottom: 10 }, rowTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 }, loadingMore: { textAlign: "center", paddingVertical: 18 } });
