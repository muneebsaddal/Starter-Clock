import { useEffect } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { PublicFooter, PublicHeader } from "./public-navigation.web";

export type InfoSection = {
  title: string;
  body: string;
  symbol: string;
  tone: "green" | "red";
  link?: { label: string; href: string };
};

export function PublicInfoPage(props: {
  current: "privacy" | "support";
  title: string;
  description: string;
  metaDescription: string;
  sections: InfoSection[];
  afterSections?: ReactNode;
  updated?: string;
}) {
  const compact = useWindowDimensions().width < 680;

  useEffect(() => {
    document.title = `${props.title} - Starter Clock`;
    setMeta("description", props.metaDescription);
  }, [props.metaDescription, props.title]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, compact ? styles.contentCompact : null]}>
      <PublicHeader current={props.current} />
      <View style={[styles.article, compact ? styles.articleCompact : null]}>
        <Text accessibilityRole="header" style={[styles.h1, compact ? styles.h1Compact : null]}>{props.title}</Text>
        <View accessibilityElementsHidden style={styles.fermentationRule}>
          <View style={styles.ruleLine} /><View style={styles.dotGreen} /><View style={styles.dotRed} /><View style={styles.dotGreen} /><View style={styles.ruleLine} />
        </View>
        <Text style={styles.lede}>{props.description}</Text>
        <View style={styles.sections}>
          {props.sections.map((section) => <InfoRow compact={compact} key={section.title} section={section} />)}
        </View>
        {props.afterSections}
        {props.updated ? <Text style={styles.updated}>Last updated: {props.updated}</Text> : null}
      </View>
      <PublicFooter links={props.current === "privacy" ? ["home", "support"] : ["home", "privacy"]} />
    </ScrollView>
  );
}

function InfoRow({ compact, section }: { compact: boolean; section: InfoSection }) {
  const tone = section.tone === "green" ? "#58705D" : "#9B4F35";
  return (
    <View style={[styles.row, compact ? styles.rowCompact : null]}>
      <View accessible={false} style={[styles.symbolCircle, compact ? styles.symbolCircleCompact : null, { borderColor: tone }]}>
        <Text style={[styles.symbol, { color: tone }]}>{section.symbol}</Text>
      </View>
      <View style={styles.rowCopy}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionBody}>{section.body}</Text>
        {section.link ? (
          <Pressable accessibilityRole="link" onPress={() => window.location.assign(section.link!.href)} style={styles.inlineLink}>
            <Text style={styles.inlineLinkText}>{section.link.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
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
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  contentCompact: { paddingHorizontal: 16 },
  article: { width: "100%", maxWidth: 820, marginHorizontal: "auto", paddingTop: 62, paddingBottom: 22 },
  articleCompact: { paddingTop: 40 },
  h1: { color: "#2D2925", fontFamily: "Georgia", fontSize: 68, lineHeight: 76, fontWeight: "700", letterSpacing: -1.4 },
  h1Compact: { fontSize: 48, lineHeight: 56 },
  fermentationRule: { flexDirection: "row", alignItems: "center", gap: 8, width: 126, marginTop: 20 },
  ruleLine: { width: 28, height: 2, backgroundColor: "#58705D" },
  dotGreen: { width: 7, height: 7, borderRadius: 7, backgroundColor: "#58705D" },
  dotRed: { width: 9, height: 9, borderRadius: 9, backgroundColor: "#9B4F35" },
  lede: { color: "#403A34", fontFamily: "Georgia", fontSize: 24, lineHeight: 36, marginTop: 28, maxWidth: 660 },
  sections: { marginTop: 36 },
  row: { flexDirection: "row", gap: 28, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: "#D8CCBB" },
  rowCompact: { gap: 14, paddingVertical: 22 },
  symbolCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  symbolCircleCompact: { width: 56, height: 56, borderRadius: 28 },
  symbol: { fontSize: 30, lineHeight: 36, fontWeight: "500" },
  rowCopy: { flex: 1, minWidth: 0, paddingTop: 2 },
  sectionTitle: { color: "#2D2925", fontFamily: "Georgia", fontSize: 27, lineHeight: 34, fontWeight: "700" },
  sectionBody: { color: "#403A34", fontSize: 17, lineHeight: 27, marginTop: 7 },
  inlineLink: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", marginTop: 5 },
  inlineLinkText: { color: "#8D432D", fontSize: 17, lineHeight: 24, fontWeight: "800", textDecorationLine: "underline" },
  updated: { color: "#635D54", fontFamily: "Georgia", fontSize: 15, lineHeight: 22, marginTop: 24 },
});
