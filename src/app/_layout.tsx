import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { TrackingProvider } from "@/ui/tracking-context";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const scheme = useColorScheme();
  return <SafeAreaProvider><TrackingProvider><StatusBar style={scheme === "dark" ? "light" : "dark"} /><Stack screenOptions={{ headerShown: false, animation: "fade" }} /></TrackingProvider></SafeAreaProvider>;
}
