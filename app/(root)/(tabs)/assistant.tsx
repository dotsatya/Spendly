import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssistantTab() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-5 py-4">
          <Text className="text-2xl font-bold text-foreground">AI Assistant</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
