import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';

import { ArrowRight, Sparkles, Wallet } from 'lucide-react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { useThemeColors } from '@/lib/theme';
import { useSupabase } from '@/hooks/useSupabase';
import { useUserStore } from '@/store/userStore';

import { onboardingSchema, type OnboardingFormValues } from '@/lib/schemas/onboarding';

import CurrencyPicker, { ALL_CURRENCIES, DEFAULT_CURRENCY } from '@/components/CurrencyPicker';

export default function Onboarding() {
  const router = useRouter();

  // ============================================
  // AUTHENTICATION
  // ============================================

  const { user } = useUser();

  // ============================================
  // THEME
  // ============================================

  const colors = useThemeColors();

  // ============================================
  // SUPABASE
  // ============================================

  const authSupabase = useSupabase();

  // ============================================
  // ZUSTAND GLOBAL STATE
  // ============================================

  const setStoreCurrency = useUserStore((state) => state.setCurrency);

  const setNeedsOnboarding = useUserStore((state) => state.setNeedsOnboarding);

  // ============================================
  // REACT HOOK FORM + ZOD VALIDATION
  // ============================================

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onBlur',
    defaultValues: {
      startingBalance: '',
    },
  });

  // ============================================
  // LOCAL STATE
  // ============================================

  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY.code);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get selected currency information from CurrencyPicker.
  const activeCurrency =
    ALL_CURRENCIES.find((currency) => currency.code === selectedCurrency) ?? DEFAULT_CURRENCY;

  // ============================================
  // COMPLETE ONBOARDING
  // ============================================

  const handleCompleteOnboarding = async ({ startingBalance }: OnboardingFormValues) => {
    // 1. Verify authentication
    if (!user) {
      Alert.alert('Authentication Error', 'User authentication not found. Please log in again.');

      return;
    }

    // 2. Parse starting balance
    const normalizedBalance = startingBalance.replace(/,/g, '').trim();

    const parsedBalance = normalizedBalance === '' ? 0 : Number(normalizedBalance);

    // Additional defensive validation
    if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
      Alert.alert('Invalid Balance', 'Please enter a valid starting balance.');

      return;
    }

    try {
      setIsSubmitting(true);

      // ============================================
      // STEP 1: UPDATE USER CURRENCY
      // ============================================

      const { error: userError } = await authSupabase
        .from('users')
        .update({
          currency: selectedCurrency,
        })
        .eq('clerk_id', user.id);

      if (userError) {
        console.error('Error updating user currency:', userError);

        Alert.alert('Update Failed', 'Could not save your currency preference. Please try again.');

        return;
      }

      // ============================================
      // STEP 2: PROCESS STARTING BALANCE
      // ============================================

      // Starting balance is optional.
      // Skip transaction creation when balance is zero.

      if (parsedBalance > 0) {
        // Fetch the user's default account
        const { data: defaultAccount, error: accountFetchError } = await authSupabase
          .from('accounts')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (accountFetchError || !defaultAccount) {
          console.error('Error fetching default account:', accountFetchError);

          Alert.alert(
            'Account Error',
            'Could not find your default cash account. Please try again.'
          );

          return;
        }

        // ============================================
        // STEP 3: INSERT STARTING BALANCE TRANSACTION
        // ============================================

        const { error: transactionError } = await authSupabase.from('transactions').insert({
          user_id: user.id,
          account_id: defaultAccount.id,
          type: 'INCOME',
          amount: parsedBalance,
          category: 'other_income',
          description: 'Starting balance',
          date: new Date().toISOString(),
          input_method: 'MANUAL',
        });

        if (transactionError) {
          console.error('Error inserting starting balance transaction:', transactionError);

          Alert.alert(
            'Transaction Failed',
            'Could not record your starting balance. Please try again.'
          );

          return;
        }

        // ============================================
        // STEP 4: UPDATE DEFAULT ACCOUNT BALANCE
        // ============================================

        const currentBalance = Number(defaultAccount.balance ?? 0);

        const newBalance = currentBalance + parsedBalance;

        const { error: balanceError } = await authSupabase
          .from('accounts')
          .update({
            balance: newBalance,
          })
          .eq('id', defaultAccount.id);

        if (balanceError) {
          console.error('Error updating account balance:', balanceError);

          Alert.alert(
            'Balance Update Failed',
            'Your starting balance transaction was recorded, but the account balance could not be updated. Please contact support.'
          );

          return;
        }
      }

      // ============================================
      // STEP 5: UPDATE ZUSTAND GLOBAL STATE
      // ============================================

      setStoreCurrency(selectedCurrency);

      setNeedsOnboarding(false);

      // ============================================
      // STEP 6: NAVIGATE TO MAIN APPLICATION
      // ============================================

      router.replace('/(root)/(tabs)');
    } catch (err: unknown) {
      console.error('Onboarding submission error:', err);

      const message = err instanceof Error ? err.message : 'Something went wrong while saving.';

      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}>
          {/* ===== HEADER ===== */}

          <View className="overflow-hidden rounded-b-3xl bg-foreground">
            <View className="flex-row items-center justify-between px-5 pb-5 pt-4">
              {/* App Logo */}

              <View>
                <Text className="text-[28px] font-extrabold tracking-tight text-background">
                  Spend<Text className="text-chart-2">ly</Text>
                </Text>

                <View className="mt-2.5 h-1 w-10 rounded-full bg-chart-2" />
              </View>

              {/* Status Pill */}

              <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                <Sparkles size={14} color="#FF6900" />

                <Text className="text-xs font-semibold text-background">Quick Setup</Text>
              </View>
            </View>

            {/* Greeting & Headline */}

            <View className="px-5 pb-7 pt-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-background/50">
                Welcome aboard
              </Text>

              <Text className="mt-1 text-[26px] font-extrabold leading-tight text-background">
                Let&apos;s personalize your finances
              </Text>

              <Text className="mt-2 text-xs leading-5 text-background/70">
                Pick your primary currency and optional starting cash to start tracking your daily
                expenses.
              </Text>
            </View>
          </View>

          {/* ===== CONTENT BODY ===== */}

          <View className="px-5 pt-6">
            {/* STEP 1: SELECT PRIMARY CURRENCY */}

            <View className="mb-6">
              <View className="gap-2.5">
                <CurrencyPicker
                  selectedCurrency={selectedCurrency}
                  onSelect={(currency) => {
                    setSelectedCurrency(currency.code);
                  }}
                />
              </View>
            </View>

            {/* STEP 2: STARTING CASH WALLET */}

            <View className="mb-6 rounded-2xl border border-border bg-card p-4">
              <View className="mb-1 flex-row items-center gap-2">
                <Wallet size={18} color={colors.chart2} />

                <Text className="text-lg font-bold text-card-foreground">
                  Starting Cash Balance
                </Text>
              </View>

              <Text className="mb-3.5 text-xs text-muted-foreground">
                Enter your physical cash in hand right now (optional, defaults to{' '}
                {activeCurrency.symbol}0).
              </Text>

              <View className="h-14 flex-row items-center rounded-xl border border-input bg-background px-4">
                <Text className="mr-2 text-lg font-extrabold text-chart-2">
                  {activeCurrency.symbol}
                </Text>

                {/* React Hook Form Controller */}

                <Controller
                  control={control}
                  name="startingBalance"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={colors.mutedForeground}
                      returnKeyType="done"
                      className="flex-1 text-base font-semibold text-foreground"
                    />
                  )}
                />
              </View>

              {/* Zod Validation Error */}

              {formErrors.startingBalance?.message && (
                <Text className="mt-2 text-xs text-destructive">
                  {formErrors.startingBalance.message}
                </Text>
              )}
            </View>

            {/* QUICK INFO CALLOUT */}

            <View className="mb-8 rounded-2xl border border-border bg-secondary/60 p-4">
              <View className="flex-row items-start gap-2.5">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.chart2}
                  style={{ marginTop: 2 }}
                />

                <View className="flex-1">
                  <Text className="text-xs font-semibold text-foreground">
                    Safe & Flexible Setup
                  </Text>

                  <Text className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    A default &apos;Cash&apos; account will be created automatically. You can add
                    bank accounts, edit balances, or modify preferences anytime from your Profile.
                  </Text>
                </View>
              </View>
            </View>

            {/* COMPLETE ONBOARDING BUTTON */}

            <TouchableOpacity
              onPress={handleSubmit(handleCompleteOnboarding)}
              disabled={isSubmitting}
              activeOpacity={0.85}
              className={`h-14 flex-row items-center justify-center rounded-2xl bg-primary shadow-md ${
                isSubmitting ? 'opacity-70' : ''
              }`}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text className="text-base font-bold text-primary-foreground">
                    Complete Setup & Continue
                  </Text>

                  <ArrowRight
                    size={18}
                    color={colors.primaryForeground}
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
