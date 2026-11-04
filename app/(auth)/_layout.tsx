import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useThemeColors } from '@/lib/theme';

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const colors = useThemeColors();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.chart2} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
