import { PublicInfoPage, type InfoSection } from "@/ui/web/public-info-page.web";

const sections: InfoSection[] = [
  {
    title: "What stays on your device",
    body: "Starter names, feedings, notes, estimates, observed peaks, reminder settings, diagnostics, and selected photos are stored locally on your device. Starter Clock does not send them to a product-controlled service.",
    symbol: "⌂", tone: "green",
  },
  {
    title: "What leaves your device",
    body: "Starter Clock has no accounts, advertising, analytics, or cloud sync. The mobile app uses the device app store only when you view, buy, or restore the optional lifetime upgrade.",
    symbol: "↛", tone: "red",
  },
  {
    title: "Photos and exports",
    body: "Photos stay in the app’s local storage. A structured export lists photo metadata but does not include the photo files. Exported JSON leaves the app only when you choose a destination in the system share sheet.",
    symbol: "⇧", tone: "green",
  },
  {
    title: "Purchases",
    body: "Google Play or Apple processes a purchase under its own terms and privacy practices. The app receives the result needed to unlock Pro, but does not persist or log store receipts, purchase tokens, or payment details.",
    symbol: "◇", tone: "red",
  },
  {
    title: "Your controls",
    body: "You can export your structured records or delete all local app data regardless of upgrade status. Delete all removes local records, managed photos, reminders, preferences, and the local entitlement cache; store ownership remains restorable.",
    symbol: "≡", tone: "green",
  },
  {
    title: "Web calculators",
    body: "The public feeding-ratio and hydration calculators work without an account. Values entered there are used in your browser to show the result and are not sent to Starter Clock. The site does not use analytics or advertising trackers.",
    symbol: "◎", tone: "red",
  },
];

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      current="privacy"
      title="Privacy"
      description="Starter Clock is designed to keep your baking records on your device."
      metaDescription="How Starter Clock handles local baking records, photos, exports, purchases, and web calculator entries."
      sections={sections}
      updated="July 18, 2026"
    />
  );
}
