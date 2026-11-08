import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Budget } from '@/lib/services/budgets';
import { useUpsertBudget } from '@/hooks/mutation/useBudgetMutations';
import { useThemeColors } from '@/lib/theme';
import { useUserStore } from '@/store/userStore';
import { FormSheetModal, FormField, SheetButton } from '../FormSheetModal';

export function BudgetModal({
  visible,
  budget,
  onClose,
  onSaved,
}: {
  visible: boolean;
  budget: Budget | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const colors = useThemeColors();
  const currency = useUserStore((state) => state.currency);

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const { mutateAsync: upsertBudget, isPending: saving } = useUpsertBudget();

  useEffect(() => {
    if (visible) {
      setAmount(budget ? String(budget.amount) : '');
      setError('');
    }
  }, [visible, budget]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));

    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid monthly budget.');
      return;
    }

    setError('');
    try {
      await upsertBudget(parsedAmount);
      onSaved();
    } catch (err) {
      console.error('Error saving budget:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  // Full class strings so NativeWind can see them at build time.
  const borderClass = error ? 'border-destructive' : focused ? 'border-chart-2' : 'border-input';

  return (
    <FormSheetModal
      visible={visible}
      title={budget ? 'Edit monthly budget' : 'Set monthly budget'}
      subtitle="We use this to show how much you can still spend each month."
      onClose={onClose}>
      <FormField label="Monthly budget" error={error}>
        <View
          className={`h-14 flex-row items-center rounded-2xl border bg-muted/40 px-4 ${borderClass}`}>
          <Text className="mr-2 text-sm font-extrabold text-chart-2">{currency}</Text>
          <TextInput
            value={amount}
            onChangeText={(v) => {
              setError('');
              setAmount(v);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. 50000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            autoFocus
            className="flex-1 text-base font-semibold text-foreground"
          />
        </View>
      </FormField>

      <SheetButton
        label={saving ? 'Saving…' : 'Save budget'}
        onPress={handleSave}
        loading={saving}
      />
    </FormSheetModal>
  );
}
