import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface ProfileRowProps {
  icon: IconName;
  title: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  borderBottom?: boolean;
  showChevron?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export default function ProfileRow({
  icon,
  title,
  value,
  onPress,
  destructive = false,
  borderBottom = true,
  showChevron = true,
  disabled = false,
  loading = false,
}: ProfileRowProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        borderBottom ? 'border-b border-border' : ''
      } ${disabled || loading ? 'opacity-50' : ''}`}>
      <View className="flex-1 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
          <Ionicons name={icon} size={16} color={destructive ? colors.destructive : colors.foreground} />
        </View>
        <Text
          className={`text-sm font-medium ${destructive ? 'text-destructive' : 'text-card-foreground'}`}>
          {title}
        </Text>
      </View>

      <View className="flex-row items-center">
        {loading ? (
          <ActivityIndicator size="small" color={destructive ? colors.destructive : colors.foreground} />
        ) : (
          <>
            {value ? <Text className="mr-2 text-xs text-muted-foreground">{value}</Text> : null}
            {showChevron && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

