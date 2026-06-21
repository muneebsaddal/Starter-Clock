import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { useTracking } from "../tracking-context";
import { useTheme } from "../theme";
import { Body, Button, IconButton, Label, Title } from "./primitives";

export function ProModal({ visible, onClose }: { visible: boolean; onClose(): void }) {
  const theme = useTheme();
  const { entitlement, purchaseLifetime, restorePurchases } = useTracking();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null);

  async function purchase() {
    setBusy(true); setMessage(null);
    try {
      const result = await purchaseLifetime();
      setMessage(result.state === "purchased" ? "Lifetime Pro is active." : result.state === "pending" ? "The store is still processing this purchase. Pro will unlock after approval." : result.state === "cancelled" ? "Purchase cancelled. Nothing was charged." : "The store could not complete the purchase. Try again when it is available.");
    } catch { setMessage("The store could not complete the purchase. Try again when it is available."); } finally { setBusy(false); }
  }

  async function restore() {
    setBusy(true); setMessage(null);
    try {
      const restored = await restorePurchases();
      setMessage(restored.level === "pro" ? "Lifetime Pro was restored." : restored.offline ? "The store is unavailable. Your last verified access is unchanged." : "No Lifetime Pro purchase was found for this store account.");
    } catch { setMessage("The store could not check purchases. Your last verified access is unchanged."); } finally { setBusy(false); }
  }

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={[styles.scrim, { backgroundColor: theme.scrim }]}><View style={[styles.dialog, { backgroundColor: theme.surface }]}>
      <View style={styles.heading}><View><Label>Lifetime Pro</Label><Title style={{ fontSize: 28 }}>{entitlement.level === "pro" ? "Pro is active" : "Keep every starter together"}</Title></View><IconButton label="Close" glyph="×" onPress={onClose} /></View>
      <Body style={{ color: theme.muted }}>Pro unlocks multiple active starters and complete retained history. Feeding calculations, peak reminders, one starter, and its 30 latest feedings remain free.</Body>
      {entitlement.offline ? <Body accessibilityRole="alert" style={{ color: theme.warning }}>Offline: showing the last store-verified access on this device.</Body> : null}
      {message ? <Body accessibilityRole="alert" style={{ color: theme.ink }}>{message}</Body> : null}
      {entitlement.level === "free" ? <Button disabled={busy} onPress={() => void purchase()}>{busy ? "Contacting store…" : "View lifetime offer"}</Button> : null}
      <Button disabled={busy} variant="secondary" onPress={() => void restore()}>Restore purchase</Button>
      <Body style={{ color: theme.muted, fontSize: 12 }}>The App Store or Google Play shows the current local price before confirmation. This is a one-time purchase, not a subscription.</Body>
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({ scrim: { flex: 1, justifyContent: "center", padding: 22 }, dialog: { width: "100%", maxWidth: 480, alignSelf: "center", borderRadius: 28, padding: 22, gap: 16 }, heading: { flexDirection: "row", justifyContent: "space-between", gap: 12 } });
