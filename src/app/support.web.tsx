import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PublicInfoPage, type InfoSection } from "@/ui/web/public-info-page.web";

const sections: InfoSection[] = [
  {
    title: "Quick help",
    body: "Core tracking works offline and without an account. If local data does not load, close and reopen the app before making another change, then use the in-app Try again action.",
    symbol: "?", tone: "green",
  },
  {
    title: "Reminders",
    body: "Notification access can be changed in your device settings. Saving an edited feeding recalculates its estimate and replaces its local peak reminder when reminders are enabled.",
    symbol: "◷", tone: "red",
  },
  {
    title: "Photos",
    body: "Starter Clock copies only the photo you select into app-managed local storage. Denying photo access does not prevent you from saving a feeding.",
    symbol: "▣", tone: "green",
  },
  {
    title: "Purchases and restore",
    body: "The optional lifetime upgrade is managed by your device app store. Use Restore purchases in the Lifetime Pro sheet to refresh ownership. A refund or revocation can remove Pro access but never deletes local records.",
    symbol: "◇", tone: "red",
  },
  {
    title: "Export or delete your data",
    body: "Export and delete-all controls are available to Free and Pro users. Export creates structured JSON for the system share sheet. Delete all requires confirmation and does not cancel store ownership.",
    symbol: "⇩", tone: "green",
  },
  {
    title: "Contact",
    body: "For help that is not covered here, email the Starter Clock support address. Please do not include purchase receipts, store tokens, or sensitive personal data.",
    symbol: "✉", tone: "red",
    link: { label: "support@starterclock.app", href: "mailto:support@starterclock.app" },
  },
];

export default function SupportPage() {
  return (
    <PublicInfoPage
      current="support"
      title="Support"
      description="Help with Starter Clock, your local baking records, and common device permissions."
      metaDescription="Starter Clock support for reminders, photos, purchases, restore, export, and local data deletion."
      sections={sections}
      afterSections={
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>Learn how Starter Clock handles local data on the </Text>
          <Link href={"/privacy" as Href} asChild>
            <Pressable accessibilityRole="link" style={styles.privacyLink}><Text style={styles.privacyLinkText}>Privacy page</Text></Pressable>
          </Link>
          <Text style={styles.privacyText}>.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  privacyNote: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginTop: 22 },
  privacyText: { color: "#635D54", fontSize: 16, lineHeight: 24 },
  privacyLink: { minHeight: 44, justifyContent: "center" },
  privacyLinkText: { color: "#8D432D", fontSize: 16, lineHeight: 24, fontWeight: "800", textDecorationLine: "underline" },
});
