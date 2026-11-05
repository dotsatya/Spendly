import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useAppTheme } from '@/lib/theme';
import ThemeToggle from '@/components/ThemeToggle';
import { useUserStore } from '@/store/userStore';
import ProfileSection from './ProfileSection';
import ProfileRow from './ProfileRow';

export default function PreferencesSection() {
  const { themePreference, resolvedTheme, isDark } = useAppTheme();
  const colors = useThemeColors();
  const currency = useUserStore((state) => state.currency);

  return (
    <ProfileSection title="Preferences">
      <ProfileRow icon="cash-outline" title="Currency" value={currency || 'INR'} borderBottom={true} />

      {/* THEME TOGGLE: Light, Dark, System */}
      <View className="p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
              <Ionicons
                name={
                  themePreference === 'system'
                    ? 'phone-portrait-outline'
                    : isDark
                      ? 'moon-outline'
                      : 'sunny-outline'
                }
                size={16}
                color={colors.foreground}
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-card-foreground">Theme</Text>
              <Text className="text-xs text-muted-foreground">
                {themePreference === 'system'
                  ? `Follows device appearance (${resolvedTheme})`
                  : `${themePreference.charAt(0).toUpperCase() + themePreference.slice(1)} mode active`}
              </Text>
            </View>
          </View>
        </View>

        <ThemeToggle />
      </View>
    </ProfileSection>
  );
}

