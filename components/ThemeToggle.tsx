import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useThemeColors, ThemePreference } from '@/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface ThemeOption {
  key: ThemePreference;
  label: string;
  icon: IconName;
  activeIcon: IconName;
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: 'light', label: 'Light', icon: 'sunny-outline', activeIcon: 'sunny' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline', activeIcon: 'moon' },
  { key: 'system', label: 'System', icon: 'phone-portrait-outline', activeIcon: 'phone-portrait' },
];

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { themePreference, setThemePreference } = useAppTheme();
  const colors = useThemeColors();

  return (
    // Track: gray rounded box that holds the options
    <View className={`flex-row items-center rounded-xl bg-muted p-1 ${className}`}>
      {THEME_OPTIONS.map((option) => {
        const isSelected = themePreference === option.key;

        return (
          <Pressable
            key={option.key}
            onPress={() => {
              void setThemePreference(option.key);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} theme`}
            accessibilityState={{ selected: isSelected }}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 active:opacity-70 ${
              isSelected ? 'border-border bg-card' : 'border-transparent'
            }`}>
            <Ionicons
              name={isSelected ? option.activeIcon : option.icon}
              size={16}
              color={isSelected ? colors.chart2 : colors.mutedForeground}
            />
            <Text
              className={`text-xs font-semibold ${
                isSelected ? 'text-foreground' : 'text-muted-foreground'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
