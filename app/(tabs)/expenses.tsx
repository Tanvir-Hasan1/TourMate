import React from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, TouchableOpacity } from 'react-native';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors, CategoryColors } from '../../src/constants/Colors';
import { Utensils, Car, Hotel, Ticket, ShoppingBag, Plus, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CategoryIcon = ({ category, color, size = 20 }: { category: string, color: string, size?: number }) => {
  switch (category) {
    case 'Food': return <Utensils color={color} size={size} />;
    case 'Transport': return <Car color={color} size={size} />;
    case 'Hotel': return <Hotel color={color} size={size} />;
    case 'Tickets': return <Ticket color={color} size={size} />;
    case 'Shopping': return <ShoppingBag color={color} size={size} />;
    default: return <MoreHorizontal color={color} size={size} />;
  }
};

export default function ExpensesScreen() {
  const { getActiveTrip, deleteExpense } = useTripStore();
  const trip = getActiveTrip();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Select a trip to see expenses.</Text>
      </View>
    );
  }

  const renderExpenseItem = ({ item, index }: { item: any, index: number }) => {
    const payerName = item.paidById === 'group_fund' ? 'Group Fund' : (trip.members.find(m => m.id === item.paidById)?.name || 'Unknown');
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <TouchableOpacity 
          style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push(`/expense/${item.id}`)}
        >
          <View style={[styles.iconContainer, { backgroundColor: CategoryColors[item.category] + '20' }]}>
            <CategoryIcon category={item.category} color={CategoryColors[item.category]} />
          </View>
          
          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.expenseSubtitle, { color: colors.subtext }]}>
              Paid by {payerName} • {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.expenseAmountContainer}>
            <Text style={[styles.expenseAmount, { color: colors.text }]}>৳{item.amount.toLocaleString()}</Text>
            <TouchableOpacity onPress={() => deleteExpense(trip.id, item.id)}>
              <Trash2 size={16} color={colors.danger} style={{ marginTop: 4 }} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={trip.expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No expenses yet. Add your first spending!</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/expense/add')}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
