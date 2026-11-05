import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';
import { ArrowUpRight, ArrowDownRight, Camera, Mic, Plus } from 'lucide-react-native';

export default function HomeTab() {
  const colors = useThemeColors(); // for icons, placeholder, switch
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState(true);

  return (
    // 1. Screen background
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}>
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
                <Text className="text-[11px] font-medium text-background/60">Good afternoon</Text>
                <Text className="text-lg font-bold text-chart-2">User</Text>
              </View>

              <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-card">
                <Ionicons name="person" size={21} color={colors.mutedForeground} />
              </View>
            </View>
          </View>

          {/* Balance Overview */}
          <View className="px-5 py-6">
            <Text className="text-xs font-medium text-background/50">Total balance</Text>

            <Text className="text-[32px] font-extrabold tracking-tight text-background">
              ₹2,81,645
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
            <View className="mt-5 flex-row gap-2 py-4">
              {/* AI Receipt Scan */}
              <Pressable className="min-h-[76px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-1 py-3 active:bg-white/10">
                <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-blue-500/15">
                  <Camera size={19} color="#60A5FA" />
                </View>
                <Text className="text-center text-[10px] font-medium text-background/80">
                  AI Receipt Scan
                </Text>
              </Pressable>

              {/* Voice Entry */}
              <Pressable className="min-h-[76px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-1 py-3 active:bg-white/10">
                <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-orange-500/15">
                  <Mic size={19} color="#FB923C" />
                </View>
                <Text className="text-center text-[10px] font-medium text-background/80">
                  Voice Entry
                </Text>
              </Pressable>

              {/* Add Manually */}
              <Pressable className="min-h-[76px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-1 py-3 active:bg-white/10">
                <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-green-500/15">
                  <Plus size={20} color="#4ADE80" />
                </View>
                <Text className="text-center text-[10px] font-medium text-background/80">
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

        {/* ===== FILTER CHIPS ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {['All', 'House', 'Apartment', 'Villa'].map((item) => {
            const selected = filter === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                className={`rounded-full border px-4 py-2 ${
                  selected ? 'border-transparent bg-primary' : 'border-border bg-background'
                }`}>
                <Text className={selected ? 'text-primary-foreground' : 'text-foreground'}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
