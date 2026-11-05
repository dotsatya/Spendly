import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Check, Search, ChevronDown, Coins } from 'lucide-react-native';

import cc from 'currency-codes';
import getSymbol from 'currency-symbol-map';

import { useThemeColors } from '@/lib/theme';

// ============================================
// CURRENCY TYPE
// ============================================

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

// ============================================
// CURRENCY FLAGS
// ============================================

const CURRENCY_FLAGS: Record<string, string> = {
  INR: '🇮🇳',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  AED: '🇦🇪',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  SGD: '🇸🇬',
  JPY: '🇯🇵',
};

// ============================================
// GENERATE ALL CURRENCIES
// ============================================

export const ALL_CURRENCIES: CurrencyOption[] = cc
  .codes()
  .map((code) => ({
    code,
    name: cc.code(code)?.currency ?? code,
    symbol: getSymbol(code) ?? code,
    flag: CURRENCY_FLAGS[code] ?? '🌐',
  }))
  .filter((currency) => currency.symbol !== currency.code);

// ============================================
// DEFAULT CURRENCY
// ============================================

export const DEFAULT_CURRENCY: CurrencyOption = ALL_CURRENCIES.find(
  (currency) => currency.code === 'INR'
) ?? {
  code: 'INR',
  name: 'Indian Rupee',
  symbol: '₹',
  flag: '🇮🇳',
};

// ============================================
// POPULAR CURRENCIES
// ============================================

const POPULAR_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

// ============================================
// COMPONENT PROPS
// ============================================

interface CurrencyPickerProps {
  selectedCurrency: string;
  onSelect: (currency: CurrencyOption) => void;
}

// ============================================
// CURRENCY PICKER COMPONENT
// ============================================

export default function CurrencyPicker({ selectedCurrency, onSelect }: CurrencyPickerProps) {
  const colors = useThemeColors();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // ============================================
  // SELECTED CURRENCY
  // ============================================

  const selected = ALL_CURRENCIES.find((currency) => currency.code === selectedCurrency);

  // ============================================
  // TOP 5 POPULAR CURRENCIES
  // ============================================

  const popularCurrencies = useMemo(
    () =>
      POPULAR_CURRENCIES.map((code) =>
        ALL_CURRENCIES.find((currency) => currency.code === code)
      ).filter((currency): currency is CurrencyOption => Boolean(currency)),
    []
  );

  // ============================================
  // SEARCH CURRENCIES
  // ============================================

  const filteredCurrencies = useMemo(() => {
    const query = search.trim().toLowerCase();

    // Show popular currencies by default
    if (!query) return popularCurrencies;

    // Search by currency code, name or symbol
    return ALL_CURRENCIES.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        currency.symbol.toLowerCase().includes(query)
    );
  }, [search, popularCurrencies]);

  // ============================================
  // OPEN PICKER
  // ============================================

  const openPicker = () => {
    setSearch('');
    setIsOpen(true);
  };

  // ============================================
  // SELECT CURRENCY
  // ============================================

  const handleSelect = (currency: CurrencyOption) => {
    onSelect(currency);
    setIsOpen(false);
    setSearch('');
  };

  // ============================================
  // CLOSE PICKER
  // ============================================

  const closePicker = () => {
    setIsOpen(false);
    setSearch('');
  };

  // ============================================
  // UI
  // ============================================

  return (
    <>
      {/* MAIN CURRENCY PICKER */}
      <View className="rounded-2xl border border-border bg-card p-4">
        {/* Label */}
        <View className="mb-1 flex-row items-center gap-2">
          <Coins size={18} color={colors.chart2} />

          <Text className="text-lg font-bold text-card-foreground">Primary Currency</Text>
        </View>

        <Text className="mt-1 text-xs text-muted-foreground">
          Choose the currency you want to use for tracking expenses.
        </Text>

        {/* Search Trigger */}
        <TouchableOpacity
          onPress={openPicker}
          activeOpacity={0.75}
          className="h-14 flex-row items-center rounded-xl border border-input bg-background px-4">
          <Search size={19} color={colors.mutedForeground} />

          <Text className="ml-3 flex-1 text-sm font-medium text-muted-foreground">
            Search or select currency...
          </Text>

          <ChevronDown size={19} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* SELECTED CURRENCY */}
        <View className="mt-4">
          <Text className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Selected Currency
          </Text>

          {selected ? (
            <View className="flex-row items-center justify-between rounded-xl border border-chart-2 bg-chart-2/10 p-3">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-chart-2 bg-chart-2/20">
                  <Text className="text-lg font-bold text-foreground">{selected.symbol}</Text>
                </View>

                <View className="ml-3">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-sm font-bold text-foreground">{selected.code}</Text>

                    <Text>{selected.flag}</Text>
                  </View>

                  <Text className="text-xs text-muted-foreground">{selected.name}</Text>
                </View>
              </View>

              <View className="h-6 w-6 items-center justify-center rounded-full bg-chart-2">
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
          ) : (
            <View className="items-center justify-center rounded-xl border border-dashed border-border bg-background py-5">
              <Text className="text-sm font-semibold text-muted-foreground">Choose Currency</Text>

              <Text className="mt-1 text-[11px] text-muted-foreground">
                Your selected currency will appear here.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* CURRENCY SEARCH MODAL */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePicker}>
        <View className="flex-1 justify-center bg-black/60 px-5">
          {/* Outside Press */}
          <Pressable className="absolute inset-0" onPress={closePicker} />

          {/* Popup */}
          <View className="overflow-hidden rounded-3xl border border-border bg-card">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
              <View>
                <Text className="text-base font-bold text-card-foreground">Select Currency</Text>

                <Text className="mt-1 text-xs text-muted-foreground">
                  Search and choose your preferred currency.
                </Text>
              </View>

              <TouchableOpacity
                onPress={closePicker}
                className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <Ionicons name="close" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="px-4 pt-4">
              <View className="h-12 flex-row items-center rounded-xl border border-input bg-background px-3">
                <Search size={18} color={colors.mutedForeground} />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search currency..."
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="ml-3 flex-1 text-sm font-medium text-foreground"
                />

                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Results Header */}
            <View className="flex-row items-center justify-between px-4 pb-3 pt-5">
              <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {search.trim() ? 'Search Results' : 'Popular Currencies'}
              </Text>

              <Text className="text-[11px] text-muted-foreground">
                {filteredCurrencies.length} found
              </Text>
            </View>

            {/* Currency Results */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 280, flexGrow: 0 }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}>
              {filteredCurrencies.length > 0 ? (
                <View className="gap-2">
                  {filteredCurrencies.map((item) => {
                    const isSelected = selectedCurrency === item.code;

                    return (
                      <TouchableOpacity
                        key={item.code}
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.7}
                        className={`flex-row items-center justify-between rounded-xl border p-3 ${
                          isSelected
                            ? 'border-chart-2 bg-chart-2/10'
                            : 'border-border bg-background'
                        }`}>
                        <View className="flex-row items-center">
                          <View
                            className={`h-10 w-10 items-center justify-center rounded-xl border ${
                              isSelected ? 'border-chart-2 bg-chart-2/20' : 'border-border bg-card'
                            }`}>
                            <Text className="text-base font-bold text-foreground">
                              {item.symbol}
                            </Text>
                          </View>

                          <View className="ml-3">
                            <View className="flex-row items-center gap-1.5">
                              <Text className="text-sm font-bold text-foreground">{item.code}</Text>

                              <Text>{item.flag}</Text>
                            </View>

                            <Text className="text-xs text-muted-foreground">{item.name}</Text>
                          </View>
                        </View>

                        {isSelected && (
                          <View className="h-6 w-6 items-center justify-center rounded-full bg-chart-2">
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View className="items-center py-10">
                  <Search size={28} color={colors.mutedForeground} />

                  <Text className="mt-3 text-sm font-bold text-foreground">No currency found</Text>

                  <Text className="mt-1 text-xs text-muted-foreground">
                    Try another currency name or code.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View className="border-t border-border px-4 py-3">
              <Text className="text-center text-[11px] text-muted-foreground">
                Select a currency to confirm your preference.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
