import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors, CategoryColors } from '../../src/constants/Colors';
import { Utensils, Car, Hotel, Ticket, ShoppingBag, MoreHorizontal, Info, Users, CreditCard, Camera, X, Pencil, Trash2 } from 'lucide-react-native';

const CategoryIcon = ({ category, color, size = 24 }: { category: string, color: string, size?: number }) => {
  switch (category) {
    case 'Food': return <Utensils color={color} size={size} />;
    case 'Transport': return <Car color={color} size={size} />;
    case 'Hotel': return <Hotel color={color} size={size} />;
    case 'Tickets': return <Ticket color={color} size={size} />;
    case 'Shopping': return <ShoppingBag color={color} size={size} />;
    default: return <MoreHorizontal color={color} size={size} />;
  }
};

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getActiveTrip, deleteExpense } = useTripStore();
  const trip = getActiveTrip();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedReceiptUri, setSelectedReceiptUri] = useState<string | null>(null);

  if (!trip) return null;

  const expense = trip.expenses.find(e => e.id === id);

  if (!expense) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Expense not found.</Text>
      </View>
    );
  }

  const payer = trip.members.find(m => m.id === expense.paidById);
  const payerName = expense.paidById === 'group_fund' ? 'Group Fund' : (payer ? payer.name : 'Unknown');
  const categoryColor = CategoryColors[expense.category] || colors.primary;

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This will recalculate all member balances.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
             deleteExpense(trip.id, expense.id);
             router.back();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
          <CategoryIcon category={expense.category} color={categoryColor} size={40} />
        </View>
        <Text style={[styles.amount, { color: colors.text }]}>৳{expense.amount.toLocaleString()}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{expense.title}</Text>
        <Text style={[styles.date, { color: colors.subtext }]}>
          {new Date(expense.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Details</Text>
        
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <CreditCard size={20} color={colors.subtext} style={styles.detailIcon} />
              <Text style={[styles.labelText, { color: colors.subtext }]}>Paid By</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{payerName}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Info size={20} color={colors.subtext} style={styles.detailIcon} />
              <Text style={[styles.labelText, { color: colors.subtext }]}>Category</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{expense.category}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Users size={20} color={colors.subtext} style={styles.detailIcon} />
              <Text style={[styles.labelText, { color: colors.subtext }]}>Split Type</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{expense.splitType}</Text>
          </View>
        </View>
      </View>

      {/* Multiple Receipts Section */}
      {(() => {
        const uris = expense.receiptUris || (expense.receiptUri ? [expense.receiptUri] : []);
        if (uris.length === 0) return null;

        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Attached Receipts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {uris.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedReceiptUri(uri);
                    setReceiptModalVisible(true);
                  }}
                  style={{ width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginRight: 12 }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
      })()}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Split Breakdown</Text>
        <View style={[styles.splitsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {expense.splits.map((split, index) => {
            const member = trip.members.find(m => m.id === split.memberId);
            return (
              <View key={split.memberId}>
                <View style={styles.splitRow}>
                  <View style={styles.splitMemberInfo}>
                    {member?.profilePicture ? (
                      <Image source={{ uri: member.profilePicture }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: member?.avatarColor || colors.primary }]}>
                        <Text style={styles.avatarText}>{member?.name?.[0]?.toUpperCase() || '?'}</Text>
                      </View>
                    )}
                    <Text style={[styles.splitMemberName, { color: colors.text }]}>{member?.name || 'Unknown'}</Text>
                  </View>
                  <Text style={[styles.splitAmount, { color: colors.text }]}>৳{split.amount.toLocaleString()}</Text>
                </View>
                {index < expense.splits.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 12 }]} />}
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40, marginTop: 8 }}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '15', flex: 1, marginRight: 8 }]} 
          onPress={() => router.push(`/expense/add?editId=${id}` as any)}
        >
          <Pencil color={colors.primary} size={20} style={{ marginRight: 8 }} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.danger + '15', flex: 1, marginLeft: 8 }]} 
          onPress={handleDelete}
        >
          <Trash2 color={colors.danger} size={20} style={{ marginRight: 8 }} />
          <Text style={[styles.actionButtonText, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={receiptModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.closeModalTarget} 
            activeOpacity={1} 
            onPress={() => setReceiptModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Receipt Image</Text>
              <TouchableOpacity onPress={() => setReceiptModalVisible(false)} style={styles.closeBtn}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
              {selectedReceiptUri && (
                <Image 
                  source={{ uri: selectedReceiptUri }} 
                  style={styles.receiptImageFull} 
                  resizeMode="contain" 
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
  },
  section: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  detailCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  receiptRow: {
    paddingVertical: 8,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 12,
  },
  labelText: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewReceiptBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewReceiptText: {
    fontWeight: '600',
    fontSize: 14,
  },
  splitsContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  splitMemberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalTarget: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  imageContainer: {
    flex: 1,
    padding: 16,
  },
  receiptImageFull: {
    width: '100%',
    height: '100%',
  },
});
