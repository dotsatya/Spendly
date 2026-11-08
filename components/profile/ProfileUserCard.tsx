import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';
import { useThemeColors } from '@/lib/theme';

export default function ProfileUserCard() {
  const { user } = useUser();
  const colors = useThemeColors();

  const fullName = user?.fullName || 'Spendly User';
  const email = user?.primaryEmailAddress?.emailAddress || 'No email available';
  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((name) => name?.[0])
      .join('')
      .toUpperCase() || 'U';

  return (
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
            <Ionicons name="camera" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* User Details */}
        <View className="ml-4 flex-1">
          <Text numberOfLines={1} className="text-lg font-bold text-primary-foreground">
            {fullName}
          </Text>

          <View className="mt-1 flex-row items-center">
            <Ionicons name="mail-outline" size={13} color={colors.background} />
            <Text
              numberOfLines={1}
              className="ml-1.5 flex-1 text-sm text-primary-foreground ">
              {email}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

