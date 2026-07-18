import type { Href } from "expo-router";
import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

type PublicPage = "home" | "privacy" | "support";

const publicLinks: Record<PublicPage, { href: Href; label: string }> = {
  home: { href: "/", label: "Home" },
  privacy: { href: "/privacy" as Href, label: "Privacy" },
  support: { href: "/support" as Href, label: "Support" },
};
const headerOrder: PublicPage[] = ["home", "privacy", "support"];

export function PublicHeader({ current }: { current: "home" | "privacy" | "support" }) {
  const compact = useWindowDimensions().width < 600;
  return (
    <View style={[styles.header, compact ? styles.headerCompact : null]}>
      <Link href="/" asChild>
        <Pressable accessibilityLabel="Starter Clock home" style={styles.brandLink}>
          <Image source={require("../../../assets/app-assets/icon.png")} style={styles.mark} />
          <Text style={styles.brand}>Starter Clock</Text>
        </Pressable>
      </Link>
      <View accessibilityLabel="Public pages" style={[styles.nav, compact ? styles.navCompact : null]}>
        {headerOrder.map((name) => {
          const link = publicLinks[name];
          return (
          <Link key={name} href={link.href} asChild>
            <Pressable accessibilityState={{ selected: current === name }} style={styles.navLink}>
              <Text style={[styles.navText, current === name ? styles.navTextCurrent : null]}>{link.label}</Text>
            </Pressable>
          </Link>
          );
        })}
      </View>
    </View>
  );
}

export function PublicFooter({ links: footerLinks = ["home", "privacy", "support"] }: { links?: PublicPage[] }) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerRule} />
      <Text style={styles.footerMark}>⌁</Text>
      <View style={styles.footerRule} />
      <View style={styles.footerLinks}>
        {footerLinks.map((name) => {
          const link = publicLinks[name];
          return (
            <Link key={name} href={link.href} asChild>
              <Pressable style={styles.footerLink}><Text style={styles.footerText}>{link.label}</Text></Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%", maxWidth: 1120, marginHorizontal: "auto", minHeight: 88,
    paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    gap: 20, borderBottomWidth: 1, borderBottomColor: "#D8CCBB",
  },
  headerCompact: { alignItems: "flex-start", flexDirection: "column", gap: 6, paddingBottom: 12 },
  brandLink: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12 },
  mark: { width: 42, height: 42, borderRadius: 9 },
  brand: { color: "#2D2925", fontFamily: "Georgia", fontSize: 24, lineHeight: 30, fontWeight: "700" },
  nav: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", gap: 4 },
  navCompact: { width: "100%", justifyContent: "flex-start" },
  navLink: { minHeight: 44, minWidth: 44, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  navText: { color: "#403A34", fontSize: 16, lineHeight: 22, fontWeight: "600" },
  navTextCurrent: { color: "#8D432D", textDecorationLine: "underline", textDecorationColor: "#8D432D" },
  footer: { width: "100%", maxWidth: 1120, marginHorizontal: "auto", paddingTop: 30, alignItems: "center" },
  footerRule: { width: "100%", height: 1, backgroundColor: "#D8CCBB" },
  footerMark: { color: "#58705D", fontSize: 30, lineHeight: 34, marginTop: -18, backgroundColor: "#F7F2E9", paddingHorizontal: 18 },
  footerLinks: { minHeight: 64, flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 },
  footerLink: { minHeight: 44, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  footerText: { color: "#403A34", fontFamily: "Georgia", fontSize: 16, lineHeight: 22 },
});
