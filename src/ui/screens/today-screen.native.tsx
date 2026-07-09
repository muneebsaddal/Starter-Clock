import { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatHydration, formatPeakWindow, formatRatio, formatTime, describePeakState } from "@/domain/presentation";
import type { Feeding } from "@/domain/models";
import { useTracking } from "../tracking-context";
import { useTheme } from "../theme";
import { Body, Button, IconButton, Label, Title } from "../components/primitives";
import { FeedingModal } from "../components/feeding-modal.native";
import { StarterModal } from "../components/starter-modal.native";
import { BottomNavigation } from "../components/bottom-navigation.native";
import { ProModal } from "../components/pro-modal.native";
import { useNow } from "../use-now";

export function TodayScreen() {
  const theme = useTheme();
  const { loading, error, starters, selectedStarter, feedings, refresh, clearError, reactivateStarter, exportData, deleteAllData } = useTracking();
  const [feedingOpen, setFeedingOpen] = useState(false); const [feedingNowMs, setFeedingNowMs] = useState(0); const [starterOpen, setStarterOpen] = useState(false); const [editing, setEditing] = useState<Feeding | undefined>(); const [explaining, setExplaining] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [dataStatus, setDataStatus] = useState<string | null>(null);
  const latest = feedings[0]; const now = useNow();
  function openFeeding(feeding?: Feeding) { setEditing(feeding); setFeedingNowMs(Date.now()); setFeedingOpen(true); }
  async function runExport() {
    try {
      const uri = await exportData();
      setDataStatus(`Export sheet opened. File: ${uri}`);
    } catch {
      setDataStatus("Couldn’t create an export. Try again.");
    }
  }
  function confirmDeleteAll() {
    Alert.alert("Delete all Starter Clock data?", "This removes starters, feedings, observations, reminder intent, and local photos from this device. Store purchases can still be restored.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete all data", style: "destructive", onPress: () => void deleteAllData().then(() => setDataStatus("All local Starter Clock data was deleted.")).catch(() => setDataStatus("Couldn’t delete all local data. Try again.")) },
    ]);
  }

  if (loading) return <View style={[styles.root, { backgroundColor: theme.paper }]}><View style={styles.loading}><View style={[styles.skeletonTall, { backgroundColor: theme.line }]} /><View style={[styles.skeleton, { backgroundColor: theme.line }]} /></View><BottomNavigation /></View>;

  return <View style={[styles.root, { backgroundColor: theme.paper }]}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={false} onRefresh={() => void refresh()} tintColor={theme.accent} />}>
      {error ? <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: theme.warningSoft }]}><Body style={{ color: theme.warning, flex: 1 }}>{error}</Body><Button variant="quiet" onPress={() => { clearError(); void refresh(); }}>Try again</Button></View> : null}
      {selectedStarter ? <>
        <View style={styles.topbar}>
          <Button variant="quiet" accessibilityLabel="Manage active starter" onPress={() => setStarterOpen(true)} style={{ paddingHorizontal: 4 }}><Text style={{ fontWeight: "800" }}>{selectedStarter.name}  ⌄</Text></Button>
          <IconButton label="Manage starter" glyph="•••" onPress={() => setStarterOpen(true)} />
        </View>
        {latest ? <>
          <Label>Estimated peak</Label>
          <View style={[styles.peakCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            {(() => { const state = describePeakState(latest.estimate, selectedStarter.name, now); return <><View style={[styles.state, { backgroundColor: theme.sageSoft }]}><Text style={{ color: theme.sage, fontWeight: "800" }}>◔  {state.label}</Text></View><Title style={[styles.peakTitle, { color: theme.accent }]}>{formatPeakWindow(latest.estimate, now)}</Title><Body style={{ color: theme.muted, fontWeight: "700" }}>{state.detail}</Body></>; })()}
            <View accessibilityLabel={`Fed at ${formatTime(latest.fedAtMs)}. Estimated peak ${formatTime(latest.estimate.earliestAtMs)} to ${formatTime(latest.estimate.latestAtMs)}.`} style={[styles.timeline, { backgroundColor: theme.line }]}><View style={[styles.timelineFill, { backgroundColor: theme.accent }]} /><View style={[styles.timelineWindow, { backgroundColor: theme.sage }]} /></View>
            <View style={styles.timelineLabels}><Body style={{ color: theme.muted, fontSize: 12 }}>Fed {formatTime(latest.fedAtMs)}</Body><Body style={{ color: theme.muted, fontSize: 12 }}>Peak window</Body></View>
            {latest.reminder.status === "scheduled" ? <Body accessibilityLabel={`Peak reminder scheduled for ${formatTime(latest.reminder.targetAtMs)}`} style={{ color: theme.sage, fontWeight: "700", marginTop: 14 }}>Reminder set for {formatTime(latest.reminder.targetAtMs)}</Body> : null}
            {latest.reminder.status === "denied" || latest.reminder.status === "failed" ? <Body accessibilityRole="alert" style={{ color: theme.warning, fontWeight: "700", marginTop: 14 }}>{latest.reminder.status === "denied" ? "Reminder not set · notifications are off" : "Reminder not set · tap Edit to retry"}</Body> : null}
            <Button variant="quiet" accessibilityLabel="Explain this peak window" onPress={() => setExplaining((open) => !open)}>{explaining ? "Hide explanation" : "Why this window?"}</Button>
            {explaining ? <View style={[styles.explanation, { borderColor: theme.line }]}><Body style={{ fontWeight: "800" }}>An estimate, not a guarantee.</Body><Body style={{ color: theme.muted }}>Your starter may peak earlier or later. Look for a rounded top, bubbles, and maximum rise.</Body><Body style={{ color: theme.muted, marginTop: 8 }}>{latest.estimate.factors.filter((factor) => !factor.code.startsWith("missing")).map((factor) => `• ${factor.code.replaceAll("_", " ")}`).join("\n")}</Body>{latest.estimate.missingInputs.length ? <Body style={{ color: theme.warning, marginTop: 8 }}>The window is wider because {latest.estimate.missingInputs.join(" and ").replaceAll("_", " ")} was not recorded.</Body> : null}</View> : null}
          </View>
          <Button onPress={() => openFeeding()} style={styles.logButton}>＋ Log feeding</Button>
          <View style={[styles.section, { borderColor: theme.line }]}><Label>Latest feeding</Label><View style={styles.latestRow}><View><Body style={{ fontWeight: "800" }}>{formatTime(latest.fedAtMs)}</Body><Body style={{ color: theme.muted }}>{formatRatio(latest)} · {formatHydration(latest)} hydration</Body></View><Button variant="quiet" onPress={() => openFeeding(latest)}>Edit</Button></View></View>
        </> : <View style={styles.noFeeding}><Label>{selectedStarter.name}</Label><Title>No feeding logged yet.</Title><Body style={{ color: theme.muted }}>Add the amounts you used to see an understandable estimated peak window.</Body><Button onPress={() => openFeeding()} style={{ marginTop: 18 }}>Log first feeding</Button></View>}
      </> : <View style={styles.empty}>
        <View accessibilityElementsHidden style={[styles.jar, { borderColor: theme.accent }]}><View style={[styles.jarFill, { backgroundColor: theme.sageSoft }]} /></View>
        <Label>Welcome to Starter Clock</Label><Title style={{ textAlign: "center" }}>Meet your starter{"\n"}at its best.</Title><Body style={{ textAlign: "center", color: theme.muted }}>Name your starter, log a feeding, and get an understandable peak window.</Body><Button onPress={() => setStarterOpen(true)} style={{ alignSelf: "stretch", marginTop: 18 }}>Create my starter</Button><Body style={{ color: theme.muted, fontSize: 13, marginTop: 14 }}>No account needed. Your data stays on this device.</Body>
        {starters.filter((starter) => starter.status === "archived").map((starter) => <Button key={starter.id} variant="quiet" onPress={() => void reactivateStarter(starter.id)} style={{ marginTop: 12 }}>Restore {starter.name}</Button>)}
      </View>}
      <View style={[styles.dataControls, { borderColor: theme.line }]}>
        <Label>Data controls</Label>
        <Body style={{ color: theme.muted, marginTop: 8 }}>Export or permanently delete the local data on this device. These actions are available on Free and Pro.</Body>
        {dataStatus ? <Body accessibilityRole="alert" style={{ color: dataStatus.startsWith("Couldn’t") ? theme.warning : theme.sage, marginTop: 10 }}>{dataStatus}</Body> : null}
        <View style={styles.dataActions}>
          <Button variant="secondary" onPress={() => void runExport()}>Export data</Button>
          <Button variant="danger" onPress={confirmDeleteAll}>Delete all data</Button>
        </View>
      </View>
    </ScrollView>
    <BottomNavigation />
    {starterOpen ? <StarterModal visible mode={selectedStarter ? "manage" : "create"} onClose={() => setStarterOpen(false)} onCreated={() => openFeeding()} onUpgrade={() => setProOpen(true)} /> : null}
    {feedingOpen ? <FeedingModal visible nowMs={feedingNowMs} feeding={editing} onClose={() => { setFeedingOpen(false); setEditing(undefined); }} /> : null}
    {proOpen ? <ProModal visible onClose={() => setProOpen(false)} /> : null}
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 22, paddingBottom: 36 }, topbar: { minHeight: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  banner: { borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  peakCard: { borderWidth: 1, borderRadius: 30, padding: 22, marginTop: 8, shadowColor: "#3A2B20", shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  state: { alignSelf: "flex-start", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 99, marginBottom: 18 }, peakTitle: { fontSize: 39, lineHeight: 44 },
  timeline: { height: 8, borderRadius: 99, marginTop: 26, overflow: "hidden" }, timelineFill: { width: "58%", height: "100%" }, timelineWindow: { position: "absolute", left: "68%", right: "8%", height: "100%", borderRadius: 99 }, timelineLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  explanation: { borderTopWidth: 1, paddingTop: 14, marginTop: 8 }, logButton: { minHeight: 58, marginVertical: 18 }, section: { borderTopWidth: 1, paddingTop: 20 }, latestRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dataControls: { borderTopWidth: 1, marginTop: 26, paddingTop: 20 }, dataActions: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 14 },
  empty: { alignItems: "center", paddingTop: 72 }, noFeeding: { paddingTop: 60 }, jar: { width: 110, height: 115, borderWidth: 4, borderRadius: 22, justifyContent: "flex-end", padding: 8, marginBottom: 30 }, jarFill: { height: "54%", borderRadius: 15 },
  loading: { flex: 1, width: "100%", maxWidth: 620, alignSelf: "center", padding: 22 }, skeletonTall: { height: 350, borderRadius: 28, marginTop: 70 }, skeleton: { height: 64, borderRadius: 16, marginTop: 18 },
});
