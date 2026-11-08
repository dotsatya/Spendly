import { Text } from "react-native";
import { View } from "react-native";

export default function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View className="mb-3 h-8 flex-row items-center justify-between">
      <Text className="text-base font-bold text-foreground">{title}</Text>
      {right}
    </View>
  );
} 