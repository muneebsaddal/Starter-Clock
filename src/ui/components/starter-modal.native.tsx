import { useState } from "react";
import { Alert, Modal, StyleSheet, TextInput, View } from "react-native";
import { useTracking } from "../tracking-context";
import { useTheme } from "../theme";
import { Body, Button, IconButton, Label, Title } from "./primitives";

export function StarterModal({ visible, mode, onClose, onCreated, onUpgrade }: { visible: boolean; mode: "create" | "manage"; onClose(): void; onCreated?(): void; onUpgrade?(): void }) {
  const theme = useTheme();
  const { selectedStarter, createStarter, renameStarter, archiveStarter, deleteStarter, starters, selectStarter, entitlement } = useTracking();
  const [name, setName] = useState(mode === "manage" ? selectedStarter?.name ?? "" : ""); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const creating = mode === "create" || adding;

  async function save() {
    setSaving(true); setError(null);
    try { if (creating) await createStarter(name); else await renameStarter(name); onClose(); if (creating) onCreated?.(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Couldn’t save this starter. Try again."); }
    finally { setSaving(false); }
  }

  function confirmDelete() {
    if (!selectedStarter) return;
    Alert.alert(`Delete ${selectedStarter.name}?`, "Its feedings, estimates, observations, and local photos will also be removed. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete starter", style: "destructive", onPress: () => void deleteStarter().then(onClose) },
    ]);
  }

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={[styles.scrim, { backgroundColor: theme.scrim }]}>
      <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
        <View style={styles.heading}><View><Label>Starter Clock</Label><Title style={{ fontSize: 28 }}>{creating ? "Name your starter" : "Manage starter"}</Title></View><IconButton label="Close" glyph="×" onPress={onClose} /></View>
        <Body style={{ color: theme.muted }}>{creating ? "A short, familiar name makes feeding history easier to recognize." : "Rename, switch, or archive this culture. Your history stays on this device."}</Body>
        <TextInput accessibilityLabel="Starter name" autoFocus value={name} onChangeText={setName} maxLength={40} returnKeyType="done" onSubmitEditing={() => void save()} style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.line }]} />
        {error ? <Body accessibilityRole="alert" style={{ color: theme.danger }}>{error}</Body> : null}
        <Button disabled={saving} onPress={() => void save()}>{saving ? "Saving…" : creating ? "Create starter" : "Save name"}</Button>
        {mode === "manage" && !adding ? <View style={{ gap: 6, marginTop: 8 }}>
          {entitlement.level === "pro" ? starters.filter((starter) => starter.status === "active" && starter.id !== selectedStarter?.id).map((starter) => <Button key={starter.id} variant="secondary" onPress={() => { void selectStarter(starter.id); onClose(); }}>Switch to {starter.name}</Button>) : null}
          <Button variant="quiet" onPress={() => { if (entitlement.level === "pro") { setAdding(true); setName(""); } else { onClose(); onUpgrade?.(); } }}>{entitlement.level === "pro" ? "Add another starter" : "Add another starter with Pro"}</Button>
          <Button variant="quiet" onPress={() => void archiveStarter().then(onClose)}>Archive starter</Button><Button variant="danger" onPress={confirmDelete}>Delete starter</Button>
        </View> : null}
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "center", padding: 22 }, dialog: { width: "100%", maxWidth: 480, alignSelf: "center", borderRadius: 28, padding: 22, gap: 16 },
  heading: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, input: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 18, fontWeight: "700" },
});
