import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileUserCard,
  AccountsSection,
  PreferencesSection,
  UserActionsSection,
} from '@/components/profile';

export default function ProfileTab() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* TITLE */}
        <View className="px-5 pb-2 pt-4">
          <Text className="text-2xl font-bold tracking-tight text-foreground">Profile</Text>
        </View>

        {/* USER CARD */}
        <ProfileUserCard />

        {/* ACCOUNTS */}
        <AccountsSection />

        {/* PREFERENCES */}
        <PreferencesSection />

        {/* USER ACTIONS */}
        <UserActionsSection />
      </ScrollView>
    </SafeAreaView>
  );
}
