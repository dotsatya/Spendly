import React from 'react';
import { View, Text } from 'react-native';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View className="mt-6 px-5">
      <Text className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-card">{children}</View>
    </View>
  );
}

