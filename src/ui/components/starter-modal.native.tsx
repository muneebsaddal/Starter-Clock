import { useState } from "react";
import { Alert, Modal, StyleSheet, TextInput, View } from "react-native";
import { useTracking } from "../tracking-context";
import { useTheme } from "../theme";
import { Body, Button, IconButton, Label, Title } from "./primitives";

export function StarterModal({ visible, mode, onClose, onCreated }: { visible: boolean; mode: "create" | "manage"; onClose(): void; onCreated?(): void }) {
  const theme = useTheme();
  const { selectedStarter, createStarter, renameStarter, archiveStarter, deleteStarter } = useTracking();
  const [name, setName] = useState(mode === "manage" ? selectedStarter?.name ?? "" : ""); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true); setError(null);
    try { if (mode === "create") await createStarter(name); else await renameStarter(name); onClose(); onCreated?.(); }
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
        <View style={styles.heading}><View><Label>Starter Clock</Label><Title style={{ fontSize: 28 }}>{mode === "create" ? "Name your starter" : "Manage starter"}</Title></View><IconButton label="Close" glyph="×" onPress={onClose} /></View>
        <Body style={{ color: theme.muted }}>{mode === "create" ? "A short, familiar name makes feeding history easier to recognize." : "Rename or archive this culture. Your history stays on this device."}</Body>
        <TextInput accessibilityLabel="Starter name" autoFocus value={name} onChangeText={setName} maxLength={40} returnKeyType="done" onSubmitEditing={() => void save()} style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.line }]} />
        {error ? <Body accessibilityRole="alert" style={{ color: theme.danger }}>{error}</Body> : null}
        <Button disabled={saving} onPress={() => void save()}>{saving ? "Saving…" : mode === "create" ? "Create starter" : "Save name"}</Button>
        {mode === "manage" ? <View style={{ gap: 6, marginTop: 8 }}><Button variant="quiet" onPress={() => void archiveStarter().then(onClose)}>Archive starter</Button><Button variant="danger" onPress={confirmDelete}>Delete starter</Button></View> : null}
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "center", padding: 22 }, dialog: { width: "100%", maxWidth: 480, alignSelf: "center", borderRadius: 28, padding: 22, gap: 16 },
  heading: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, input: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 18, fontWeight: "700" },
});
