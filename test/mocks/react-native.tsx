import React from "react";

const host = (name: string) => React.forwardRef<unknown, Record<string, unknown> & { children?: React.ReactNode }>((props, ref) => React.createElement(name, { ...props, ref }, props.children as React.ReactNode));

export const View = host("View");
export const Text = host("Text");
export const Pressable = host("Pressable");
export const ScrollView = host("ScrollView");
export const RefreshControl = host("RefreshControl");
export function SectionList(props: Record<string, unknown> & {
  sections: Array<{ title: string; data: unknown[] }>;
  renderItem: (info: { item: unknown; index: number; section: { title: string; data: unknown[] } }) => React.ReactNode;
  renderSectionHeader?: (info: { section: { title: string; data: unknown[] } }) => React.ReactNode;
  ListHeaderComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
}) {
  const { sections, renderItem, renderSectionHeader, ListHeaderComponent, ListEmptyComponent, ListFooterComponent, ...rest } = props;
  const rows = sections.flatMap((section, sectionIndex) => [
    React.createElement(React.Fragment, { key: `section-${sectionIndex}` }, renderSectionHeader?.({ section })),
    ...section.data.map((item, index) => React.createElement(React.Fragment, { key: `row-${sectionIndex}-${index}` }, renderItem({ item, index, section }))),
  ]);
  return React.createElement("SectionList", rest, ListHeaderComponent, rows.length === 0 ? ListEmptyComponent : rows, ListFooterComponent);
}
export const StyleSheet = { create: <T,>(styles: T) => styles, flatten: (style: unknown) => style };
export const Platform = { OS: "ios", select: <T,>(values: { ios?: T; default?: T }) => values.ios ?? values.default };
export const AccessibilityInfo = { isScreenReaderEnabled: async () => false };
export const NativeModules = {};
export function useColorScheme() { return "light" as const; }
