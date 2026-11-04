import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';

interface InputFieldProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder?: string;
  error?: string;
  children: React.ReactNode;
}

export default function InputField({ label, icon, error, children }: InputFieldProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-1">
      {/* LABEL */}
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>

      {/* INPUT CONTAINER */}
      <View
        className={`h-[54px] flex-row items-center rounded-2xl border bg-muted/40 px-4 ${
          error ? 'border-destructive' : 'border-input'
        }`}>
        <Ionicons name={icon} size={19} color={colors.mutedForeground} />

        {children}
      </View>

      {/* ERROR MESSAGE */}
      {error ? <Text className="mt-1.5 text-xs text-destructive">{error}</Text> : null}
    </View>
  );
}
