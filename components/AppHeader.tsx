import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showNotification?: boolean;
  onNotificationPress?: () => void;
  rightAction?: React.ReactNode;
}

export default function AppHeader({
  title = 'Spendly',
  subtitle = 'Track your spending. Own your savings.',
  showNotification = true,
  onNotificationPress,
  rightAction,
}: AppHeaderProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
      {/* App Branding */}
      <View className="flex-1 pr-3">
        <Text className="text-[30px] font-extrabold tracking-tight text-foreground">
          Spend<Text className="text-chart-2">ly</Text>
        </Text>

        <View className="mt-2.5 h-1 w-10 rounded-full bg-chart-2" />
      </View>

      {/* Right Action */}
      {rightAction ? (
        rightAction
      ) : showNotification ? (
        <Pressable
          onPress={onNotificationPress}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card active:bg-accent">
          <Ionicons name="notifications-outline" size={19} color={colors.foreground} />
        </Pressable>
      ) : null}
    </View>
  );
}
