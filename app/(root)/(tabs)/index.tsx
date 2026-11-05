import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';
import { ArrowUpRight, ArrowDownRight, Camera, Mic, Plus } from 'lucide-react-native';
import { useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useAccountsQuery } from '@/hooks/queries/useAccountsQuery';
import { useTransactionsQuery } from '@/hooks/queries/useTransactionsQuery';
import { useBudgetQuery } from '@/hooks/queries/useBudgetQuery';
import { isSameMonth } from 'date-fns';
import { Transaction } from '@/types';
import { getCategoryConfig } from '@/constants/categories';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { formatPrice, getGreeting } from '@/lib/utils/utils';

export default function HomeTab() {
  const colors = useThemeColors(); // for icons, placeholder, switch
  const { user } = useUser();
  const currency = useUserStore((state) => state.currency);

  const [budgetModelOpen, setBudgetModelOpen] = useState(false);
  const [alerts, setAlerts] = useState(true);

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    isRefetching: accountsRefetching,
    refetch: refetchAccounts,
    isError: accountsError,
  } = useAccountsQuery();

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isRefetching: transactionsRefetching,
    refetch: transactionsRefetch,
    isError: transactionsError,
  } = useTransactionsQuery();

  const { data: budget = [], refetch: refetchBudget, isError: budgetError } = useBudgetQuery();

  const loading = accountsLoading || transactionsLoading;
  const refetching = accountsRefetching || transactionsRefetching;

  const onRefresh = () => {
    refetchAccounts();
    transactionsRefetch();
    refetchBudget();
  };

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts]
  );

  const monthTransactions = useMemo(() => {
    const now = new Date();
    const monthTransactions = transactions.filter((tx) => isSameMonth(new Date(tx.date), now));
    return monthTransactions;
  }, [transactions]);

  const monthlyIncome = useMemo(
    () =>
      monthTransactions
        .filter((tx) => tx.type === 'INCOME')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions]
  );
  const monthlyExpense = useMemo(
    () =>
      monthTransactions
        .filter((tx) => tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions]
  );

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const expensesBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .forEach((tx) => {
        map[tx.category] = map[tx.category] ?? 0 + tx.amount;
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category: category as Transaction['category'],
        amount,
        color: getCategoryConfig(category as Transaction['category']).color,
      }));
  }, [monthTransactions]);
  // console.log(totalBalance, monthTransactions);

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((name) => name?.[0])
      .join('')
      .toUpperCase() || 'U';

  return (
    // 1. Screen background
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refetching} onRefresh={onRefresh} />}>
        {/* ===== HEADER ===== */}

        <View className="overflow-hidden rounded-b-3xl bg-foreground">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-5 pt-4">
            {/* App Logo */}
            <View>
              <Text className="text-[28px] font-extrabold tracking-tight text-background">
                Spend<Text className="text-chart-2">ly</Text>
              </Text>
              <View className="mt-2.5 h-1 w-10 rounded-full bg-chart-2" />
            </View>

            {/* Greeting + Profile */}

            <View className="flex-row items-center gap-3">
              <View className="items-end">
                <Text className="text-[11px] font-medium text-background/60">{getGreeting()}</Text>

                <Text className="text-lg font-bold text-chart-2">{user?.firstName}</Text>
              </View>

              {/* Avatar */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(root)/profile')}
                className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-card">
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-sm font-bold text-primary">{initials}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Overview */}
          <View className="px-5 py-5">
            <Text className="text-xs font-medium text-background/50">Total balance</Text>

            <Text className="text-[32px] font-extrabold tracking-tight text-background">
              {formatPrice(totalBalance, currency)}
            </Text>

            {/* Income & Expense */}
            <View className="mt-2 flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <ArrowUpRight size={15} color="#4ADE80" />
                <Text className="text-xs font-semibold text-green-400">₹15,944</Text>
              </View>

              <View className="flex-row items-center gap-1">
                <ArrowDownRight size={15} color="#F87171" />
                <Text className="text-xs font-semibold text-red-400">₹30,899</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="mt-2 flex-row gap-2.5 py-4">
              {/* AI Receipt Scan */}
              <Pressable
                accessibilityRole="button"
                className="min-h-[84px] flex-1 items-center justify-center rounded-2xl border border-muted-foreground/20 bg-muted-foreground/15 px-1 py-3 active:bg-background/20 dark:border-muted-foreground/10 dark:bg-muted-foreground/5">
                <View className="mb-2 h-11 w-11 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/20">
                  <Camera size={20} color="#38BDF8" strokeWidth={2.2} />
                </View>
                <Text className="text-center text-[10.5px] font-semibold leading-tight text-background">
                  AI Receipt Scan
                </Text>
              </Pressable>

              {/* Voice Entry */}
              <Pressable
                accessibilityRole="button"
                className="min-h-[84px] flex-1 items-center justify-center rounded-2xl border border-muted-foreground/20 bg-muted-foreground/15 px-1 py-3 active:bg-background/20 dark:border-muted-foreground/10 dark:bg-muted-foreground/5">
                <View className="mb-2 h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/20">
                  <Mic size={20} color="#FB923C" strokeWidth={2.2} />
                </View>
                <Text className="text-center text-[10.5px] font-semibold leading-tight text-background">
                  Voice Entry
                </Text>
              </Pressable>

              {/* Add Manually */}
              <Pressable
                accessibilityRole="button"
                className="min-h-[84px] flex-1 items-center justify-center rounded-2xl border border-muted-foreground/20 bg-muted-foreground/15 px-1 py-3 active:bg-background/20 dark:border-muted-foreground/10 dark:bg-muted-foreground/5">
                <View className="mb-2 h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20">
                  <Plus size={21} color="#34D399" strokeWidth={2.5} />
                </View>
                <Text className="text-center text-[10.5px] font-semibold leading-tight text-background">
                  Add Manually
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ===== SEARCH INPUT ===== */}
        <View className="mx-5 mt-5 flex-row items-center rounded-md border border-input bg-background px-3">
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            className="ml-2 h-11 flex-1 text-foreground"
            placeholder="Search city or area"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* ===== PROPERTY CARD ===== */}
        <View className="mx-5 mt-6 overflow-hidden rounded-lg border border-border bg-card">
          {/* Image placeholder (skeleton color) */}
          <View className="h-40 bg-muted" />

          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-card-foreground">2 BHK Apartment</Text>

              {/* Outline badge */}
              <View className="rounded-full border border-border px-2.5 py-0.5">
                <Text className="text-xs text-foreground">New</Text>
              </View>
            </View>

            <Text className="mt-1 text-sm text-muted-foreground">Salt Lake, Kolkata</Text>

            {/* Price = orange accent */}
            <Text className="mt-3 text-xl font-semibold text-chart-2">₹ 18,000 / month</Text>

            {/* Progress bar (example: 70% booked) */}
            <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <View className="h-full w-[70%] rounded-full bg-chart-3" />
            </View>
          </View>

          {/* Card footer with buttons */}
          <View className="flex-row gap-3 border-t border-border p-4">
            {/* Outline button */}
            <Pressable className="flex-1 items-center rounded-md border border-input bg-background py-3 active:bg-accent">
              <Text className="font-medium text-foreground">Save</Text>
            </Pressable>

            {/* Main button */}
            <Pressable className="flex-1 items-center rounded-md bg-primary py-3 active:bg-primary/90">
              <Text className="font-medium text-primary-foreground">Contact</Text>
            </Pressable>
          </View>
        </View>

        {/* ===== SETTINGS ROW ===== */}
        <View className="mx-5 mt-6 flex-row items-center justify-between rounded-lg border border-border bg-card p-4">
          <View className="flex-1 pr-4">
            <Text className="font-medium text-card-foreground">New listing alerts</Text>
            <Text className="text-sm text-muted-foreground">Get notified for new homes</Text>
          </View>
          <Switch
            value={alerts}
            onValueChange={setAlerts}
            trackColor={{ false: colors.input, true: colors.chart2 }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
