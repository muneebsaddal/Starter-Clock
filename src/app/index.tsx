import { SafeAreaView } from "react-native-safe-area-context";
import { TodayScreen } from "@/ui/screens/today-screen.native";
import { useTheme } from "@/ui/theme";

export default function TodayRoute() { const theme = useTheme(); return <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: theme.paper }}><TodayScreen /></SafeAreaView>; }
