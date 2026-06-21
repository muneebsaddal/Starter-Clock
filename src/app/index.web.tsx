import { StyleSheet, Text, View } from "react-native";

export default function PublicPlaceholder() {
  return <View style={styles.root}><Text style={styles.title}>Starter Clock</Text><Text style={styles.copy}>Know when your starter will peak.</Text><Text style={styles.note}>The public web landing page and calculators arrive in Phase 5. Tracking remains on iOS and Android.</Text></View>;
}
const styles = StyleSheet.create({ root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F7F2E9" }, title: { fontSize: 42, fontWeight: "800", color: "#2D2925" }, copy: { fontSize: 22, color: "#9B4F35", marginTop: 10 }, note: { maxWidth: 520, textAlign: "center", lineHeight: 24, color: "#716A62", marginTop: 20 } });
