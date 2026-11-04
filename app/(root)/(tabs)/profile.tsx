import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useAppTheme } from '@/lib/theme';
import ThemeToggle from '@/components/ThemeToggle';

type IconName = keyof typeof Ionicons.glyphMap;

/* ---------- Shared pieces ---------- */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mt-6 px-5">
    <Text className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {title}
    </Text>
    <View className="overflow-hidden rounded-2xl border border-border bg-card">{children}</View>
  </View>
);

interface RowProps {
  icon: IconName;
  title: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  borderBottom?: boolean;
  showChevron?: boolean;
}

const Row = ({
  icon,
  title,
  value,
  onPress,
  destructive = false,
  borderBottom = true,
  showChevron = true,
}: RowProps) => {
  const c = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        borderBottom ? 'border-b border-border' : ''
      }`}>
      <View className="flex-1 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
          <Ionicons name={icon} size={16} color={destructive ? c.destructive : c.foreground} />
        </View>
        <Text
          className={`text-sm font-medium ${destructive ? 'text-destructive' : 'text-card-foreground'}`}>
          {title}
        </Text>
      </View>

      <View className="flex-row items-center">
        {value ? <Text className="mr-2 text-xs text-muted-foreground">{value}</Text> : null}
        {showChevron && <Ionicons name="chevron-forward" size={16} color={c.mutedForeground} />}
      </View>
    </TouchableOpacity>
  );
};

/* ---------- Screen ---------- */
export default function ProfileTab() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { themePreference, resolvedTheme, isDark } = useAppTheme();
  const c = useThemeColors();

  const fullName = user?.fullName || 'Spendly User';
  const email = user?.primaryEmailAddress?.emailAddress || 'No email available';
  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((name) => name?.[0])
      .join('')
      .toUpperCase() || 'U';

  const accounts = [
    { icon: 'cash-outline' as IconName, title: 'Cash (default)', value: '₹0' },
    { icon: 'shield-outline' as IconName, title: 'Bank account', value: '₹0' },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign_in');
            } catch (error) {
              console.error('Sign out failed:', error);
              Alert.alert('Error', 'Unable to sign out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* TITLE */}
        <View className="px-5 pb-2 pt-4">
          <Text className="text-2xl font-bold tracking-tight text-foreground">Profile</Text>
        </View>

        {/* USER CARD (flips automatically: dark in light mode, light in dark mode) */}

        <View className="mt-3 px-5">
          <View className="flex-row items-center rounded-3xl bg-primary px-5 py-6">
            {/* Avatar */}
            <View className="relative">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="h-20 w-20 rounded-full border-2 border-primary-foreground"
                />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-foreground">
                  <Text className="text-2xl font-bold text-primary">{initials}</Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-primary-foreground">
                <Ionicons name="camera" size={12} color={c.primary} />
              </TouchableOpacity>
            </View>

            {/* User Details */}
            <View className="ml-4 flex-1">
              <Text numberOfLines={1} className="text-lg font-bold text-primary-foreground">
                {fullName}
              </Text>

              <View className="mt-1 flex-row items-center">
                <Ionicons name="mail-outline" size={13} className='text-white' />
                <Text
                  numberOfLines={1}
                  className="ml-1.5 flex-1 text-xs text-primary-foreground opacity-70">
                  {email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ACCOUNTS */}
        <Section title="Accounts">
          {accounts.map((a) => (
            <Row key={a.title} icon={a.icon} title={a.title} value={a.value} />
          ))}
          <Row icon="add" title="Add account" borderBottom={false} />
        </Section>

        {/* PREFERENCES */}
        <Section title="Preferences">
          <Row icon="cash-outline" title="Currency" value="INR" borderBottom={true} />

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
                    color={c.foreground}
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
        </Section>

        {/* USER ACTIONS */}
        <Section title="User actions">
          <Row
            icon="log-out-outline"
            title="Sign out"
            destructive
            showChevron={false}
            borderBottom={false}
            onPress={handleSignOut}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
