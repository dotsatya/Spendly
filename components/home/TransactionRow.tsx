import { getCategoryConfig } from '@/constants/categories';
import { Transaction } from '@/lib/services/transactions';
import { Feather } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Text, TouchableOpacity, View } from 'react-native';
import { formatPrice } from '@/lib/utils/utils';
import { useThemeColors } from '@/lib/theme';
import { useUserStore } from '@/store/userStore';

const INPUT_METHOD_ICON: Record<Transaction['input_method'], keyof typeof Feather.glyphMap> = {
  MANUAL: 'edit-3',
  RECEIPT_SCAN: 'camera',
  VOICE: 'mic',
};

export function TransactionRow({ tx, onDelete }: { tx: Transaction; onDelete?: () => void }) {
  const colors = useThemeColors();
  const currency = useUserStore((state) => state.currency);

  const config = getCategoryConfig(tx.category);
  const isIncome = tx.type === 'INCOME';

  const row = (
    <View
      className="flex-row items-center rounded-2xl border border-border bg-card py-4 pl-3 pr-3.5"
      style={{ borderLeftWidth: 3, borderLeftColor: config.color }}>
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${config.color}22` }}>
        <Text className="text-lg">{config.icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {tx.description || config.label}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Feather
            name={INPUT_METHOD_ICON[tx.input_method]}
            size={11}
            color={colors.mutedForeground}
          />
          <View
            className="rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: `${config.color}1A` }}>
            <Text className="text-[11px] font-semibold" style={{ color: config.color }}>
              {config.label}
            </Text>
          </View>
          {tx.is_flagged && (
            <View className="ml-1 flex-row items-center gap-1">
              <Feather name="alert-triangle" size={11} color={colors.destructive} />
              <Text className="text-[11px] font-semibold text-destructive">Flagged</Text>
            </View>
          )}
        </View>
      </View>

      <Text
        className={`text-sm font-bold ${
          isIncome ? 'text-green-600 dark:text-green-400' : 'text-destructive'
        }`}>
        {isIncome ? '+' : '-'}
        {formatPrice(tx.amount, currency)}
      </Text>
    </View>
  );

  if (!onDelete) {
    return <View className="mb-2.5">{row}</View>;
  }

  return (
    <View className="mb-2.5">
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <TouchableOpacity
            onPress={onDelete}
            activeOpacity={0.85}
            className="ml-2 w-16 items-center justify-center rounded-2xl bg-destructive">
            <Feather name="trash-2" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}>
        {row}
      </Swipeable>
    </View>
  );
}
