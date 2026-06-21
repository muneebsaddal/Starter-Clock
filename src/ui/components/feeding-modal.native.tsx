import { useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Feeding, FlourType } from "@/domain/models";
import { calculateFeedingRatio, calculateHydrationPercent } from "@/domain/peak-model";
import { formatNumber } from "@/domain/presentation";
import { gramsToTenths } from "@/domain/validation";
import { ManagedPhotoStore, managedPhotoUri } from "@/infrastructure/files/photo-store.native";
import { useTracking } from "../tracking-context";
import { useTheme } from "../theme";
import { Body, Button, IconButton, Label, Title } from "./primitives";

interface Props { visible: boolean; nowMs: number; feeding?: Feeding | undefined; onClose(): void; onSaved?(feeding: Feeding): void }
const flourOptions: { value: FlourType; label: string }[] = [
  { value: "white", label: "White" }, { value: "blend", label: "Blend" }, { value: "whole_wheat", label: "Whole wheat" }, { value: "rye", label: "Rye" }, { value: "other", label: "Other" },
];

export function FeedingModal({ visible, nowMs, feeding, onClose, onSaved }: Props) {
  const theme = useTheme();
  const { selectedStarter, saveFeeding, deleteFeeding, attachPhoto } = useTracking();
  const [starter, setStarter] = useState(feeding ? String(feeding.starterTenthsGrams / 10) : "25");
  const [flour, setFlour] = useState(feeding ? String(feeding.flourTenthsGrams / 10) : "50");
  const [water, setWater] = useState(feeding ? String(feeding.waterTenthsGrams / 10) : "50");
  const [temperature, setTemperature] = useState(feeding?.temperatureTenthsC === undefined ? "24" : String(feeding.temperatureTenthsC / 10));
  const [flourType, setFlourType] = useState<FlourType | undefined>(feeding?.flourType ?? "white");
  const [fedAt, setFedAt] = useState(formatLocalInput(feeding?.fedAtMs ?? nowMs));
  const [observedAt, setObservedAt] = useState(feeding?.observation ? formatLocalInput(feeding.observation.observedAtMs) : "");
  const [notes, setNotes] = useState(feeding?.notes ?? "");
  const [optionalOpen, setOptionalOpen] = useState(Boolean(feeding?.flourType || feeding?.temperatureTenthsC || feeding?.notes || feeding?.photo || feeding?.observation));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoCandidate, setPhotoCandidate] = useState<Awaited<ReturnType<ManagedPhotoStore["select"]>>>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const preview = useMemo(() => {
    try {
      const values = { starterGrams: gramsToTenths(starter) / 10, flourGrams: gramsToTenths(flour) / 10, waterGrams: gramsToTenths(water) / 10 };
      const ratio = calculateFeedingRatio(values);
      return { ratio: `1:${formatNumber(ratio.flour)}:${formatNumber(ratio.water)}`, hydration: `${formatNumber(calculateHydrationPercent(values), 1)}%` };
    } catch { return { ratio: "—", hydration: "—" }; }
  }, [flour, starter, water]);

  async function selectPhoto() {
    try { setPhotoCandidate(await new ManagedPhotoStore().select()); setError(null); }
    catch { setError("Photo access is off. You can still save this feeding without a photo."); }
  }

  async function submit() {
    if (!selectedStarter) return;
    setSaving(true); setError(null);
    try {
      const fedAtMs = parseLocalInput(fedAt);
      if (!Number.isFinite(fedAtMs) || fedAtMs > nowMs + 5 * 60_000) throw new RangeError("Enter a feeding time that is not in the future.");
      const observedAtMs = observedAt.trim() === "" ? undefined : parseLocalInput(observedAt);
      if (observedAtMs !== undefined && (!Number.isFinite(observedAtMs) || observedAtMs <= fedAtMs)) throw new RangeError("Observed peak must be after the feeding.");
      const temperatureValue = temperature.trim() === "" ? undefined : Number(temperature);
      if (temperatureValue !== undefined && (!Number.isFinite(temperatureValue) || temperatureValue < -50 || temperatureValue > 80)) throw new RangeError("Enter a temperature between -50°C and 80°C, or leave it blank.");
      const saved = await saveFeeding({
        starterId: selectedStarter.id,
        fedAtMs,
        entryZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        entryOffsetMinutes: -new Date(fedAtMs).getTimezoneOffset(),
        starterTenthsGrams: gramsToTenths(starter), flourTenthsGrams: gramsToTenths(flour), waterTenthsGrams: gramsToTenths(water),
        ...(flourType === undefined ? {} : { flourType }),
        ...(temperatureValue === undefined ? {} : { temperatureTenthsC: Math.round(temperatureValue * 10) }),
        ...(notes.trim() === "" ? {} : { notes }),
        ...(observedAtMs === undefined ? {} : { observedAtMs }),
      }, feeding?.id);
      if (photoCandidate) {
        try {
          const store = new ManagedPhotoStore();
          const staged = await store.stage(photoCandidate, saved.id);
          const photo = await store.commit(staged.temporaryPath, staged.finalPath);
          try { await attachPhoto(saved.id, photo); } catch (error) { await store.remove(photo.relativePath); throw error; }
        } catch { setError("Feeding saved, but the photo could not be attached. Try the photo again from history."); onSaved?.(saved); return; }
      } else if (removePhoto && feeding?.photo) {
        await attachPhoto(saved.id, null);
        try { await new ManagedPhotoStore().remove(feeding.photo.relativePath); } catch { /* database remains authoritative */ }
      }
      onSaved?.(saved); onClose();
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Couldn’t save this feeding. Your entries are still here. Try again.");
    } finally { setSaving(false); }
  }

  function remove() {
    if (!feeding) return;
    Alert.alert("Delete this feeding?", "Its peak estimate, observed peak, photo, and reminder intent will also be removed. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete feeding", style: "destructive", onPress: () => { setSaving(true); void deleteFeeding(feeding.id).then(onClose).catch(() => setError("Couldn’t delete this feeding. Try again.")).finally(() => setSaving(false)); } },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.surface }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heading}><View><Label>{selectedStarter?.name ?? "Starter"}</Label><Title>{feeding ? "Edit feeding" : "Log feeding"}</Title></View><IconButton label="Close" glyph="×" onPress={onClose} /></View>
          <Field label="Fed at" value={fedAt} onChangeText={setFedAt} placeholder="YYYY-MM-DD HH:MM" />
          <Title style={styles.sectionTitle}>Amounts</Title><Body style={{ color: theme.muted, marginBottom: 10 }}>Enter what you used in grams.</Body>
          <View style={styles.amounts}>
            <AmountField label="Starter" value={starter} onChangeText={setStarter} />
            <AmountField label="Flour" value={flour} onChangeText={setFlour} />
            <AmountField label="Water" value={water} onChangeText={setWater} />
          </View>
          <View style={[styles.calculation, { backgroundColor: theme.paper }]}>
            <View><Body style={{ color: theme.muted, fontSize: 13 }}>Feeding ratio</Body><Text style={[styles.metric, { color: theme.ink }]}>{preview.ratio}</Text></View>
            <View><Body style={{ color: theme.muted, fontSize: 13 }}>Hydration</Body><Text style={[styles.metric, { color: theme.ink }]}>{preview.hydration}</Text></View>
          </View>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: optionalOpen }} onPress={() => setOptionalOpen((current) => !current)} style={[styles.optionalButton, { borderColor: theme.line }]}>
            <Body style={{ fontWeight: "800" }}>Flour, temperature, photo & notes</Body><Body style={{ color: theme.muted }}>{optionalOpen ? "Hide" : "Optional"}</Body>
          </Pressable>
          {optionalOpen ? <View style={styles.optional}>
            <Body style={{ fontWeight: "800" }}>Flour type</Body><View style={styles.chips}>{flourOptions.map((option) => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected: flourType === option.value }} onPress={() => setFlourType(option.value)} style={[styles.chip, { borderColor: theme.line, backgroundColor: flourType === option.value ? theme.sageSoft : theme.surface }]}><Text style={{ color: flourType === option.value ? theme.sage : theme.ink, fontWeight: "700" }}>{option.label}</Text></Pressable>)}</View>
            <Field label="Temperature (°C)" value={temperature} onChangeText={setTemperature} keyboardType="decimal-pad" />
            <Field label="Observed peak (optional)" value={observedAt} onChangeText={setObservedAt} placeholder="YYYY-MM-DD HH:MM" />
            <Field label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
            {feeding?.photo && !removePhoto && !photoCandidate ? <Image accessibilityLabel="Progress photo" source={{ uri: managedPhotoUri(feeding.photo.relativePath) }} style={styles.photo} /> : null}
            <Button variant="secondary" onPress={() => { setRemovePhoto(false); void selectPhoto(); }}>{photoCandidate || (feeding?.photo && !removePhoto) ? "Replace progress photo" : "Add progress photo"}</Button>
            {feeding?.photo && !removePhoto ? <Button variant="danger" onPress={() => { setPhotoCandidate(null); setRemovePhoto(true); }}>Remove progress photo</Button> : null}
          </View> : null}
          {error ? <Text accessibilityRole="alert" style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
          <Button disabled={saving} onPress={() => void submit()}>{saving ? "Saving…" : "Save feeding"}</Button>
          {feeding ? <Button disabled={saving} variant="danger" onPress={remove} style={{ marginTop: 8 }}>Delete feeding</Button> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const theme = useTheme(); const { label, ...inputProps } = props;
  return <View style={styles.field}><Body style={{ fontWeight: "800", marginBottom: 6 }}>{label}</Body><TextInput accessibilityLabel={label} {...inputProps} style={[styles.input, { color: theme.ink, backgroundColor: theme.paper, borderColor: theme.line }, inputProps.style]} placeholderTextColor={theme.muted} /></View>;
}

function AmountField({ label, value, onChangeText }: { label: string; value: string; onChangeText(value: string): void }) {
  const theme = useTheme();
  return <View style={{ flex: 1 }}><Body style={{ color: theme.muted, fontSize: 12, fontWeight: "800" }}>{label}</Body><View style={[styles.amountInput, { backgroundColor: theme.paper, borderColor: theme.line }]}><TextInput accessibilityLabel={`${label} grams`} keyboardType="decimal-pad" value={value} onChangeText={onChangeText} selectTextOnFocus style={[styles.amountText, { color: theme.ink }]} /><Text style={{ color: theme.muted, fontWeight: "800" }}>g</Text></View></View>;
}

function formatLocalInput(timestamp: number) {
  const date = new Date(timestamp - new Date(timestamp).getTimezoneOffset() * 60_000);
  return date.toISOString().slice(0, 16).replace("T", " ");
}
function parseLocalInput(input: string) { return new Date(input.trim().replace(" ", "T")).getTime(); }

const styles = StyleSheet.create({
  content: { padding: 22, paddingBottom: 48, width: "100%", maxWidth: 620, alignSelf: "center" },
  heading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  sectionTitle: { fontSize: 20, lineHeight: 26, marginTop: 20 }, field: { marginBottom: 16 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  amounts: { flexDirection: "row", gap: 8 }, amountInput: { flexDirection: "row", alignItems: "center", minHeight: 52, borderWidth: 1, borderRadius: 12, paddingRight: 8, marginTop: 6 },
  amountText: { flex: 1, minWidth: 0, padding: 10, fontSize: 18, fontWeight: "800" },
  calculation: { flexDirection: "row", justifyContent: "space-around", borderRadius: 16, padding: 16, marginVertical: 18 }, metric: { fontSize: 21, fontWeight: "800", marginTop: 3 },
  optionalButton: { minHeight: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, marginBottom: 16 },
  optional: { gap: 4, marginBottom: 18 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 8 }, chip: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderRadius: 22, paddingHorizontal: 13 },
  error: { fontSize: 14, lineHeight: 20, fontWeight: "700", marginVertical: 12 },
  photo: { width: "100%", aspectRatio: 4 / 3, borderRadius: 16, marginVertical: 8 },
});
