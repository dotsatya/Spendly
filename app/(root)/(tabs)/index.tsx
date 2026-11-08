import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/lib/theme';
import {
  ArrowUpRight,
  ArrowDownRight,
  Camera,
  Mic,
  Plus,
  LucideIcon,
  ArrowRight,
  Edit2,
  Inbox,
  Sparkles,
  Wallet,
  PieChartIcon,
  Pencil,
  Target,
  ChevronRight,
  Receipt,
} from 'lucide-react-native';
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
import { PieChart } from 'react-native-gifted-charts';
import { TransactionRow } from '@/components/home/TransactionRow';
import { BudgetModal } from '@/components/home/BudgetModal';
import SectionHeader from '@/components/SectionHeader';

type QuickAction = {
  icon: LucideIcon;
  label: string;
  action: string;
  color: string;
  borderColor: string;
  bgColor: string;
};

const QuickActions: QuickAction[] = [
  {
    icon: Camera,
    label: 'AI Receipt Scan',
    action: 'Scan',
    color: '#38BDF8',
    borderColor: 'border-sky-400/30',
    bgColor: 'bg-sky-500/20',
  },
  {
    icon: Mic,
    label: 'Voice Entry',
    action: 'Talk',
    color: '#FB923C',
    borderColor: 'border-amber-400/30',
    bgColor: 'bg-amber-500/20',
  },
  {
    icon: Plus,
    label: 'Manual Entry',
    action: 'Add',
    color: '#34D399',
    borderColor: 'border-emerald-400/30',
    bgColor: 'bg-emerald-500/20',
  },
];

export default function HomeTab() {
  const colors = useThemeColors(); // for icons, placeholder, switch
  const { user } = useUser();
  const currency = useUserStore((state) => state.currency);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
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

  //////////////////////////////////////
  // Budget calculations

  const budgetAmount = Number((budget as { amount?: number } | undefined)?.amount ?? 0);
  const hasBudget = budgetAmount > 0;
  const spentRatio = hasBudget ? monthlyExpense / budgetAmount : 0;
  const spentPercent = Math.min(Math.round(spentRatio * 100), 100);
  const remaining = budgetAmount - monthlyExpense;

  const budgetState: 'ok' | 'warn' | 'over' =
    spentRatio >= 1 ? 'over' : spentRatio >= 0.8 ? 'warn' : 'ok';

  // Full class strings so NativeWind can see them at build time.
  const BUDGET_STATE = {
    ok: { label: 'On track', bar: 'bg-chart-2' },
    warn: { label: 'Close to limit', bar: 'bg-chart-3' },
    over: { label: 'Over budget', bar: 'bg-destructive' },
  } as const;

  const expenseTotal = useMemo(
    () => expensesBreakdown.reduce((sum, c) => sum + c.amount, 0),
    [expensesBreakdown]
  );

  //////////////////////////////////////
  return (
    // 1. Screen background
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refetching} onRefresh={onRefresh} />}>
        {/* ===== HEADER ===== */}

        <View className="overflow-hidden rounded-b-3xl bg-foreground px-5">
          {/* Header */}
          <View className="flex-row items-center justify-between  pb-5 pt-4">
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

                <Text className="text-lg font-bold text-chart-2">{user?.firstName ?? 'User'}</Text>
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
          <View className=" py-5">
            <Text className="text-xs font-medium text-background/50">Total balance</Text>

            <Text className="text-[32px] font-extrabold tracking-tight text-background">
              {formatPrice(totalBalance, currency)}
            </Text>

            {/* Income & Expense */}
            <View className="mt-2 flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <ArrowUpRight size={15} color="#4ADE80" />
                <Text className="text-xs font-semibold text-green-400">
                  {formatPrice(monthlyIncome, currency)}
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <ArrowDownRight size={15} color="#F87171" />
                <Text className="text-xs font-semibold text-red-400">
                  {formatPrice(monthlyExpense, currency)}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="mt-2 flex-row gap-2.5 py-4">
              {QuickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <TouchableOpacity
                    key={action.label}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname: '/(root)/(tabs)/add-transaction',
                        params: { action: action.action },
                      })
                    }
                    className="min-h-[84px] flex-1 items-center justify-center rounded-2xl border border-muted-foreground/20 bg-muted-foreground/15 px-1 py-3 active:bg-background/20 ">
                    <View
                      className={`mb-2 h-11 w-11 items-center justify-center rounded-full border ${action.borderColor} ${action.bgColor}`}>
                      <Icon size={20} color={action.color} strokeWidth={2.2} />
                    </View>

                    <Text className="text-center text-[10.5px] font-semibold leading-tight text-background">
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ===== BODY ===== */}

        <View className="mt-8 gap-6 px-5">
          {/* ===== AI ASSISTANT (slim row) ===== */}
          <Pressable
            onPress={() => router.push('/(root)/(tabs)/assistant')}
            className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 active:bg-accent">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
              <Sparkles size={18} color={colors.chart2} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">Ask AI about your money</Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Get answers on spending, savings and budgets.
              </Text>
            </View>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </Pressable>

          {/* ===== MONTHLY BUDGET (main card) ===== */}
          <View>
            <SectionHeader
              title="Monthly budget"
              right={
                <Pressable
                  onPress={() => setBudgetModalOpen(true)}
                  className="flex-row items-center gap-1.5 rounded-full bg-chart-2/10 px-3 py-1 active:bg-chart-2/20">
                  <Pencil size={13} color={colors.chart2} strokeWidth={2.4} />
                  <Text className="text-sm font-semibold text-chart-2">Edit</Text>
                </Pressable>
              }
            />
            <Pressable
              onPress={() => setBudgetModalOpen(true)}
              className="rounded-2xl border border-border bg-card px-5 py-4 active:bg-accent">
              {hasBudget ? (
                <>
                  <View className="flex-row items-end justify-between">
                    <View className="flex-row items-baseline gap-1.5">
                      <Text
                        className={`mt-1 text-[32px] font-extrabold tracking-tight ${
                          remaining >= 0 ? 'text-foreground' : 'text-destructive'
                        }`}>
                        {formatPrice(Math.abs(remaining), currency)}
                      </Text>
                      <Text
                        className={`text-[11px] font-semibold ${
                          remaining >= 0 ? 'text-muted-foreground' : 'text-destructive'
                        }`}>
                        {remaining >= 0 ? 'Left to spend' : 'Over budget'}
                      </Text>
                    </View>
                    <View className="items-end pb-1">
                      <Text className="text-xs font-medium text-muted-foreground">Spent</Text>
                      <Text className="mt-1 text-base font-bold text-foreground">
                        {formatPrice(monthlyExpense, currency)}
                      </Text>
                    </View>
                  </View>
                  {/* Progress */}
                  <View className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
                    <View
                      className={`h-full rounded-full ${BUDGET_STATE[budgetState].bar}`}
                      style={{ width: `${Math.max(spentPercent, 2)}%` }}
                    />
                  </View>

                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground">
                      {formatPrice(monthlyExpense, currency)} of
                      {formatPrice(budgetAmount, currency)}
                    </Text>
                    <View className="flex-row items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
                      <View
                        className={`h-1.5 w-1.5 rounded-full ${BUDGET_STATE[budgetState].bar}`}
                      />
                      <Text className="text-[11px] font-semibold text-foreground">
                        {BUDGET_STATE[budgetState].label} · {spentPercent}%
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                /* empty state: unchanged except the mt-4 block below stays the same */
                <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-dashed border-border p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
                    <Target size={18} color={colors.chart2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Set a monthly budget
                    </Text>
                    <Text className="mt-0.5 text-xs text-muted-foreground">
                      See how much you can still spend this month.
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.mutedForeground} />
                </View>
              )}
            </Pressable>
          </View>

          {/* ===== SPENDING BY CATEGORY ===== */}
          {expensesBreakdown.length > 0 && (
            <View>
              <SectionHeader
                title="Spending by category"
                right={
                  <Text className="text-sm font-semibold text-muted-foreground">This month</Text>
                }
              />
              <View className="rounded-2xl border border-border bg-card p-5">
                {/* Donut, centered */}
                <View className="items-center">
                  <PieChart
                    donut
                    data={expensesBreakdown.map((c) => ({ value: c.amount, color: c.color }))}
                    radius={70}
                    innerRadius={50}
                    innerCircleColor={colors.card}
                    centerLabelComponent={() => (
                      <View className="items-center" style={{ width: 80 }}>
                        <Text className="text-[10px] text-muted-foreground">Total</Text>
                        <Text
                          className="text-xs font-bold text-foreground"
                          numberOfLines={1}
                          adjustsFontSizeToFit>
                          {formatPrice(expenseTotal, currency)}
                        </Text>
                      </View>
                    )}
                  />
                </View>

                {/* Legend, one line per category */}
                <View className="mt-5 gap-3">
                  {expensesBreakdown.slice(0, 5).map((c) => (
                    <View key={c.category} className="flex-row items-center">
                      <View
                        className="mr-2 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <Text
                        className="flex-1 text-xs font-medium text-foreground"
                        numberOfLines={1}>
                        {getCategoryConfig(c.category).label}
                      </Text>
                      <Text className="text-xs font-semibold text-foreground">
                        {formatPrice(c.amount, currency)}
                      </Text>
                      <Text className="w-10 text-right text-xs text-muted-foreground">
                        {expenseTotal > 0 ? Math.round((c.amount / expenseTotal) * 100) : 0}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ===== RECENT TRANSACTIONS ===== */}
          <View>
            <SectionHeader
              title="Recent transactions"
              right={
                <Pressable onPress={() => router.push('/(root)/(tabs)/transactions')} hitSlop={10}>
                  <Text className="text-sm font-semibold text-chart-2">See all</Text>
                </Pressable>
              }
            />

            {loading ? (
              <View className="overflow-hidden rounded-2xl border border-border bg-card">
                {[0, 1, 2].map((i) => (
                  <View key={i}>
                    {i > 0 && <View className="mx-4 h-px bg-border" />}
                    <View className="flex-row items-center gap-3 p-4">
                      <View className="h-11 w-11 rounded-2xl bg-muted" />
                      <View className="flex-1 gap-2">
                        <View className="h-3 w-1/2 rounded-full bg-muted" />
                        <View className="h-2.5 w-1/3 rounded-full bg-muted" />
                      </View>
                      <View className="h-3 w-16 rounded-full bg-muted" />
                    </View>
                  </View>
                ))}
              </View>
            ) : recentTransactions.length === 0 ? (
              <View className="items-center rounded-2xl border border-dashed border-border bg-card px-6 py-8">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Receipt size={24} color={colors.mutedForeground} />
                </View>
                <Text className="mt-4 text-base font-bold text-foreground">
                  No transactions yet
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-muted-foreground">
                  Add your first expense by scan, voice or manual entry.
                </Text>
                <Pressable
                  onPress={() => router.push('/(root)/(tabs)/add-transaction')}
                  className="mt-5 h-11 items-center justify-center rounded-full bg-primary px-6 active:opacity-90">
                  <Text className="text-sm font-bold text-primary-foreground">Add transaction</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                {recentTransactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      {/* {user && (
        <BudgetModal
          visible={budgetModalOpen}
          budget={budget}
          onClose={() => setBudgetModalOpen(false)}
          onSaved={() => setBudgetModalOpen(false)}
        />
      )} */}
    </SafeAreaView>
  );
}
