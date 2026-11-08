import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/lib/theme';

/**
 * Reusable bottom sheet for any form (budget, account, category, etc).
 * Put FormField(s) and a SheetButton inside as children.
 */
export function FormSheetModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      {/* 'padding' on both platforms: on Android a transparent Modal does not resize by itself */}
      <KeyboardAvoidingView behavior="padding" className="flex-1 justify-end">
        {/* Tap outside to close */}
        <Pressable
          onPress={onClose}
          className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
        />

        <View
          className="rounded-t-3xl border-t border-border bg-background px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 20 }}>
          {/* Grab handle */}
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-muted-foreground/30" />

          {/* Header */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-bold text-foreground">{title}</Text>
              {subtitle ? (
                <Text className="mt-0.5 text-xs leading-5 text-muted-foreground">{subtitle}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:bg-accent">
              <X size={16} color={colors.foreground} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View className="mt-5">{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Label + content + optional hint/error. Use for every input inside the sheet. */
export function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      {children}
      {error ? (
        <Text className="mt-1.5 text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
}

/** Main action button for the sheet. */
export function SheetButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const colors = useThemeColors();
  const off = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      className={`h-14 items-center justify-center rounded-2xl bg-primary active:opacity-90 ${
        off ? 'opacity-60' : ''
      }`}>
      {loading ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <Text className="text-base font-bold text-primary-foreground">{label}</Text>
      )}
    </Pressable>
  );
}