import { SafeAreaView } from "react-native-safe-area-context";
import { HistoryScreen } from "@/ui/screens/history-screen.native";
import { useTheme } from "@/ui/theme";

export default function HistoryRoute() { const theme = useTheme(); return <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: theme.paper }}><HistoryScreen /></SafeAreaView>; }
