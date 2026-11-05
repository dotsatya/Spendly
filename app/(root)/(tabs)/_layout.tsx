import React from 'react';
import { NativeTabs } from 'expo-router/native-tabs';
import { useNavColors } from '@/lib/theme';

export default function TabLayout() {
  const colors = useNavColors();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.active}
      shadowColor={colors.border} // iOS: line above the bar
      indicatorColor={colors.indicator} // Android: pill behind the active icon
      rippleColor={colors.ripple} // Android: press effect
      badgeBackgroundColor={colors.active}
      iconColor={{ default: colors.inactive, selected: colors.active }}
      labelStyle={{
        default: { color: colors.inactive, fontSize: 11, fontWeight: '600' },
        selected: { color: colors.active, fontSize: 11, fontWeight: '700' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="transactions">
        <NativeTabs.Trigger.Icon sf="arrow.left.arrow.right" md="sync_alt" />
        <NativeTabs.Trigger.Label>Transactions</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add-transaction">
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add_circle" />
        <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="assistant">
        <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right.fill" md="forum" />
        <NativeTabs.Trigger.Label>Assistant</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="account_circle" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
