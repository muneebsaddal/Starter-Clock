import React from "react";

const host = (name: string) => React.forwardRef<unknown, Record<string, unknown> & { children?: React.ReactNode }>((props, ref) => React.createElement(name, { ...props, ref }, props.children as React.ReactNode));

export const View = host("View");
export const Text = host("Text");
export const Pressable = host("Pressable");
export const ScrollView = host("ScrollView");
export const RefreshControl = host("RefreshControl");
export const StyleSheet = { create: <T,>(styles: T) => styles, flatten: (style: unknown) => style };
export const Platform = { OS: "ios", select: <T,>(values: { ios?: T; default?: T }) => values.ios ?? values.default };
export const AccessibilityInfo = { isScreenReaderEnabled: async () => false };
export const NativeModules = {};
export function useColorScheme() { return "light" as const; }
