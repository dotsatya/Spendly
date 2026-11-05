import { useUserSync } from '@/hooks/useUserSync';
import { useThemeColors } from '@/lib/theme';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@clerk/expo';
import { Redirect, Slot, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RootGroupLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const needsOnboarding = useUserStore((state) => state.needsOnboarding);
  const pathname = usePathname();
  const [minLoadDone, setMinLoadDone] = useState(false);

  const colors = useThemeColors();

  const { syncError, retry } = useUserSync();

  useEffect(() => {
    const t = setTimeout(() => setMinLoadDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign_in" />;

  if (syncError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="cloud-offline-outline" size={48} color={colors.destructive} />
        <Text className="mt-4 text-center text-lg font-bold text-foreground">Sync Failed</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">{syncError}</Text>
        <TouchableOpacity
          onPress={retry}
          activeOpacity={0.8}
          className="mt-6 rounded-2xl bg-primary px-6 py-3.5 shadow-sm">
          <Text className="font-semibold text-primary-foreground">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!minLoadDone || needsOnboarding === null)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.chart2} />
      </View>
    );

  if (needsOnboarding && pathname !== '/onboarding') return <Redirect href="/(root)/onboarding" />;

  return <Slot />;
}
