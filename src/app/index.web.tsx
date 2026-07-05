import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { calculateFeedingRatioView, calculateHydrationView } from "@/domain/calculators";

const initialRatio = { starter: "25", flour: "50", water: "50" };
const initialHydration = { flour: "100", water: "80" };

export default function PublicLanding() {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [ratioInput, setRatioInput] = useState(initialRatio);
  const [hydrationInput, setHydrationInput] = useState(initialHydration);
  const ratio = useMemo(() => calculateFeedingRatioView(ratioInput), [ratioInput]);
  const hydration = useMemo(() => calculateHydrationView(hydrationInput), [hydrationInput]);

  useEffect(() => {
    document.title = "Starter Clock - Sourdough starter calculators";
    setMeta("description", "Starter Clock helps home bakers understand sourdough feeding ratios, hydration, and the mobile app's estimated peak window.");
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={[styles.header, compact ? styles.headerCompact : null]}>
        <Text style={styles.brand}>Starter Clock</Text>
        <View style={styles.nav}>
          <Text style={styles.navItem}>Calculators</Text>
          <Text style={styles.navItem}>Mobile tracking</Text>
        </View>
      </View>

      <View style={[styles.hero, compact ? styles.heroCompact : null]}>
        <View style={[styles.heroCopy, compact ? styles.fullWidth : null]}>
          <Text style={[styles.h1, compact ? styles.h1Compact : null]}>Know when your starter will peak.</Text>
          <Text style={styles.lede}>
            Log a feeding on mobile, see an estimated peak window, and get one local reminder near the useful moment.
            On web, use the free feeding and hydration calculators without an account.
          </Text>
          <View style={styles.actions}>
            <AnchorButton label="Use the calculators" targetId="calculators" primary />
            <AnchorButton label="Mobile app in progress" targetId="mobile" />
          </View>
        </View>
        <View style={[styles.heroVisual, compact ? styles.fullWidth : null]} accessible accessibilityLabel="Starter Clock calculator preview with a sourdough starter jar">
          <View style={styles.jar}>
            <View style={styles.jarLid} />
            <View style={styles.bubbles}>
              <View style={[styles.bubble, styles.bubbleOne]} />
              <View style={[styles.bubble, styles.bubbleTwo]} />
              <View style={[styles.bubble, styles.bubbleThree]} />
            </View>
            <Text style={styles.jarText}>fed 8:10</Text>
          </View>
          <View style={styles.previewPanel}>
            <Text style={styles.previewLabel}>Feeding ratio</Text>
            <Text style={styles.previewValue}>{ratio.ratio ?? "1:2:2"}</Text>
            <View style={styles.previewLine} />
            <Text style={styles.previewLabel}>Hydration</Text>
            <Text style={styles.previewValue}>{ratio.hydration ?? "100%"}</Text>
          </View>
        </View>
      </View>

      <View nativeID="calculators" style={styles.calculatorBand}>
        <View style={styles.sectionIntro}>
          <Text style={styles.sectionTitle}>Free web calculators</Text>
          <Text style={styles.sectionCopy}>Use the same ratio and hydration formulas as the mobile app. These calculators do not predict peak timing.</Text>
        </View>
        <View style={[styles.calculatorGrid, compact ? styles.calculatorGridCompact : null]}>
          <CalculatorPanel
            compact={compact}
            title="Feeding ratio"
            description="Compare starter, flour, and water as a simple starter:flour:water ratio."
            resultLabel="Ratio"
            resultValue={ratio.ratio}
            secondaryLabel="Hydration"
            secondaryValue={ratio.hydration}
          >
            <GramField label="Starter" value={ratioInput.starter} error={ratio.starter.error} onChangeText={(starter) => setRatioInput((current) => ({ ...current, starter }))} />
            <GramField label="Flour" value={ratioInput.flour} error={ratio.flour.error} onChangeText={(flour) => setRatioInput((current) => ({ ...current, flour }))} />
            <GramField label="Water" value={ratioInput.water} error={ratio.water.error} onChangeText={(water) => setRatioInput((current) => ({ ...current, water }))} />
          </CalculatorPanel>

          <CalculatorPanel
            compact={compact}
            title="Hydration"
            description="Calculate water as a percentage of flour for a starter feeding or dough mix."
            resultLabel="Hydration"
            resultValue={hydration.hydration}
          >
            <GramField label="Flour" value={hydrationInput.flour} error={hydration.flour.error} onChangeText={(flour) => setHydrationInput((current) => ({ ...current, flour }))} />
            <GramField label="Water" value={hydrationInput.water} error={hydration.water.error} onChangeText={(water) => setHydrationInput((current) => ({ ...current, water }))} />
          </CalculatorPanel>
        </View>
      </View>

      <View nativeID="mobile" style={styles.mobileSection}>
        <Text style={styles.sectionTitle}>What the mobile app tracks</Text>
        <View style={styles.mobileRows}>
          {["Feedings with flour, water, starter, temperature, and flour type", "Estimated peak windows with the factors that shaped them", "Local reminders, editable history, observed peaks, and optional photos"].map((item) => (
            <View key={item} style={styles.mobileRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.mobileText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteTitle}>Peak timing stays approximate.</Text>
        <Text style={styles.noteCopy}>
          Starter behavior changes with temperature, flour, hydration, inoculation, and starter health. Starter Clock shows an estimated window and encourages observation; it does not make food-safety claims.
        </Text>
      </View>
    </ScrollView>
  );
}

function CalculatorPanel(props: {
  compact: boolean;
  title: string;
  description: string;
  resultLabel: string;
  resultValue?: string | undefined;
  secondaryLabel?: string | undefined;
  secondaryValue?: string | undefined;
  children: ReactNode;
}) {
  return (
    <View style={[styles.panel, props.compact ? styles.panelCompact : null]}>
      <Text style={styles.panelTitle}>{props.title}</Text>
      <Text style={styles.panelCopy}>{props.description}</Text>
      <View style={styles.fields}>{props.children}</View>
      <View style={styles.resultBox} accessibilityLiveRegion="polite">
        <Text style={styles.resultLabel}>{props.resultLabel}</Text>
        <Text style={styles.resultValue}>{props.resultValue ?? "Check the highlighted fields"}</Text>
        {props.secondaryLabel ? <Text style={styles.resultSmall}>{props.secondaryLabel}: {props.secondaryValue ?? "—"}</Text> : null}
      </View>
    </View>
  );
}

function GramField(props: { label: string; value: string; error?: string | undefined; onChangeText(value: string): void }) {
  const id = `${props.label.toLowerCase()}-grams`;
  return (
    <View style={styles.field}>
      <Text nativeID={`${id}-label`} style={styles.fieldLabel}>{props.label} grams</Text>
      <TextInput
        accessibilityLabel={`${props.label} grams`}
        accessibilityLabelledBy={`${id}-label`}
        accessibilityHint="Enter a positive gram amount"
        aria-invalid={props.error ? "true" : "false"}
        inputMode="decimal"
        keyboardType="decimal-pad"
        onChangeText={props.onChangeText}
        style={[styles.input, props.error ? styles.inputError : null]}
        value={props.value}
      />
      {props.error ? <Text role="alert" style={styles.error}>{props.error}</Text> : null}
    </View>
  );
}

function AnchorButton(props: { label: string; targetId: string; primary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => document.getElementById(props.targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
      style={[styles.button, props.primary ? styles.buttonPrimary : styles.buttonSecondary]}
    >
      <Text style={[styles.buttonText, props.primary ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>{props.label}</Text>
    </Pressable>
  );
}

function setMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F2E9" },
  content: { paddingHorizontal: 24, paddingBottom: 52 },
  header: { width: "100%", maxWidth: 1120, marginHorizontal: "auto", paddingTop: 24, paddingBottom: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  headerCompact: { alignItems: "flex-start", flexDirection: "column" },
  brand: { color: "#2D2925", fontSize: 22, lineHeight: 28, fontWeight: "900" },
  nav: { flexDirection: "row", gap: 20, flexWrap: "wrap", justifyContent: "flex-end" },
  navItem: { color: "#635D54", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  hero: { width: "100%", maxWidth: 1120, marginHorizontal: "auto", minHeight: 580, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 52, paddingVertical: 42 },
  heroCompact: { minHeight: 0, flexDirection: "column", alignItems: "stretch", gap: 32, paddingTop: 24 },
  heroCopy: { flex: 1, minWidth: 300 },
  fullWidth: { minWidth: 0, width: "100%" },
  h1: { color: "#2D2925", fontSize: 64, lineHeight: 68, fontWeight: "900", maxWidth: 660 },
  h1Compact: { fontSize: 44, lineHeight: 48 },
  lede: { color: "#5F584F", fontSize: 20, lineHeight: 32, marginTop: 24, maxWidth: 610 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 32 },
  button: { minHeight: 48, borderRadius: 8, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  buttonPrimary: { backgroundColor: "#8D432D", borderColor: "#8D432D" },
  buttonSecondary: { backgroundColor: "transparent", borderColor: "#CFC3B3" },
  buttonText: { fontSize: 15, lineHeight: 20, fontWeight: "900" },
  buttonTextPrimary: { color: "#FFFDF8" },
  buttonTextSecondary: { color: "#743722" },
  heroVisual: { flex: 1, minWidth: 300, minHeight: 390, alignItems: "center", justifyContent: "center" },
  jar: { width: 230, height: 300, borderWidth: 2, borderColor: "#8C7B68", borderRadius: 8, backgroundColor: "#E8B06F", justifyContent: "flex-end", alignItems: "center", paddingBottom: 26, shadowColor: "#3A2B20", shadowOpacity: 0.18, shadowRadius: 22, shadowOffset: { width: 0, height: 16 } },
  jarLid: { position: "absolute", top: -28, width: 178, height: 34, borderRadius: 6, backgroundColor: "#766B5E" },
  bubbles: { position: "absolute", inset: 0 },
  bubble: { position: "absolute", width: 22, height: 22, borderRadius: 99, backgroundColor: "rgba(255,253,248,0.62)" },
  bubbleOne: { top: 82, left: 52 },
  bubbleTwo: { top: 132, right: 48, width: 30, height: 30 },
  bubbleThree: { bottom: 84, left: 94, width: 16, height: 16 },
  jarText: { color: "#3A2B20", fontWeight: "900", fontSize: 18, lineHeight: 24 },
  previewPanel: { position: "absolute", right: 16, bottom: 18, width: 216, borderRadius: 8, borderWidth: 1, borderColor: "#D8CCBB", backgroundColor: "#FFFDF8", padding: 18, shadowColor: "#3A2B20", shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  previewLabel: { color: "#716A62", fontSize: 13, lineHeight: 18, fontWeight: "800" },
  previewValue: { color: "#58705D", fontSize: 34, lineHeight: 40, fontWeight: "900", marginTop: 2 },
  previewLine: { height: 1, backgroundColor: "#E5DCCE", marginVertical: 12 },
  calculatorBand: { width: "100%", maxWidth: 1120, marginHorizontal: "auto", paddingTop: 34, paddingBottom: 28 },
  sectionIntro: { maxWidth: 650, marginBottom: 24 },
  sectionTitle: { color: "#2D2925", fontSize: 36, lineHeight: 42, fontWeight: "900" },
  sectionCopy: { color: "#635D54", fontSize: 17, lineHeight: 27, marginTop: 10 },
  calculatorGrid: { flexDirection: "row", gap: 20, alignItems: "stretch" },
  calculatorGridCompact: { flexDirection: "column" },
  panel: { flex: 1, minWidth: 310, borderWidth: 1, borderColor: "#D8CCBB", borderRadius: 8, backgroundColor: "#FFFDF8", padding: 22 },
  panelCompact: { minWidth: 0, width: "100%", alignSelf: "stretch" },
  panelTitle: { color: "#2D2925", fontSize: 25, lineHeight: 31, fontWeight: "900" },
  panelCopy: { color: "#635D54", fontSize: 15, lineHeight: 23, marginTop: 8 },
  fields: { gap: 12, marginTop: 20 },
  field: { gap: 6 },
  fieldLabel: { color: "#403A34", fontSize: 14, lineHeight: 18, fontWeight: "800" },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#CFC3B3", borderRadius: 8, paddingHorizontal: 12, color: "#2D2925", backgroundColor: "#FFFCF6", fontSize: 18, lineHeight: 24, fontWeight: "700" },
  inputError: { borderColor: "#A33A32", backgroundColor: "#FFF7F4" },
  error: { color: "#A33A32", fontSize: 13, lineHeight: 18, fontWeight: "700" },
  resultBox: { width: "100%", minWidth: 0, marginTop: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: "#E5DCCE", alignSelf: "stretch" },
  resultLabel: { color: "#716A62", fontSize: 13, lineHeight: 18, fontWeight: "900", textTransform: "uppercase" },
  resultValue: { width: "100%", minWidth: 0, color: "#8D432D", fontSize: 34, lineHeight: 42, fontWeight: "900", marginTop: 2, flexShrink: 1 },
  resultSmall: { width: "100%", minWidth: 0, color: "#58705D", fontSize: 16, lineHeight: 22, fontWeight: "800", marginTop: 6, flexShrink: 1 },
  mobileSection: { width: "100%", maxWidth: 1120, marginHorizontal: "auto", paddingVertical: 44 },
  mobileRows: { marginTop: 20, gap: 12 },
  mobileRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderBottomWidth: 1, borderBottomColor: "#DED5C8", paddingBottom: 14 },
  check: { color: "#58705D", fontSize: 19, lineHeight: 26, fontWeight: "900" },
  mobileText: { color: "#403A34", fontSize: 18, lineHeight: 27, fontWeight: "700", flex: 1 },
  noteSection: { width: "100%", maxWidth: 1120, marginHorizontal: "auto", borderTopWidth: 1, borderTopColor: "#D8CCBB", paddingTop: 28 },
  noteTitle: { color: "#2D2925", fontSize: 24, lineHeight: 30, fontWeight: "900" },
  noteCopy: { color: "#635D54", fontSize: 16, lineHeight: 26, marginTop: 10, maxWidth: 760 },
});
