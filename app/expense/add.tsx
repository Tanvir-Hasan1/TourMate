import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, ScrollView, FlatList, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors, CategoryColors } from '../../src/constants/Colors';
import { Calendar, Tag, Check, X, DollarSign, UserCheck, Utensils, Car, Hotel, Ticket, ShoppingBag, LayoutGrid, Plus } from 'lucide-react-native';
import { Category } from '../../src/store/types';
import { getFundBalance } from '../../src/utils/settlement';

const categories: Category[] = ['Food', 'Transport', 'Hotel', 'Tickets', 'Shopping', 'Other'];

import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import ImagePickerModal from '../../src/components/ImagePickerModal';
import { Alert } from 'react-native';

export default function AddExpenseScreen() {
  const { getActiveTrip, addExpense, updateExpense, addMember } = useTripStore();
  const trip = getActiveTrip();
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [paidById, setPaidById] = useState(trip?.members[0]?.id || '');
  const [selectedMembers, setSelectedMembers] = useState(trip?.members.map(m => m.id) || []);
  const fundBalance = getFundBalance(trip || {} as any);
  const [newMemberName, setNewMemberName] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [receiptUris, setReceiptUris] = useState<string[]>([]);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  useEffect(() => {
    if (editId && trip) {
      const existing = trip.expenses.find(e => e.id === editId);
      if (existing) {
        setTitle(existing.title);
        setAmount(existing.amount.toString());
        setCategory(existing.category);
        setPaidById(existing.paidById);
        setSelectedMembers(existing.splits.map(s => s.memberId));
        if (existing.receiptUris) {
          setReceiptUris([...existing.receiptUris]);
        } else if (existing.receiptUri) {
          setReceiptUris([existing.receiptUri]);
        }
      }
    }
  }, [editId, trip?.id]);

  const launchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Permission to access camera is required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setReceiptUris(prev => [...prev, result.assets[0].uri]);
    }
  };

  const launchGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setReceiptUris(prev => [...prev, ...selectedUris]);
    }
  };

  if (!trip) return null;

  const handleAddMember = () => {
    if (!newMemberName) return;
    addMember(trip.id, newMemberName);
    setNewMemberName('');
    setShowAddMember(false);
  };

  const handleAddExpense = () => {
    if (!title || !amount || !paidById || selectedMembers.length === 0) return;
    
    const numAmount = parseFloat(amount);

    if (paidById === 'group_fund') {
      let trueAvailableFund = fundBalance;
      if (editId) {
        const existing = trip.expenses.find(e => e.id === editId);
        if (existing && existing.paidById === 'group_fund') {
          trueAvailableFund += existing.amount;
        }
      }
      if (numAmount > trueAvailableFund) {
        Alert.alert('Insufficient Funds', `The Group Fund currently only has ৳${trueAvailableFund.toLocaleString()} available. You cannot spend more than the balance.`);
        return;
      }
    }

    const splitAmount = numAmount / selectedMembers.length;
    
    const splits = selectedMembers.map(mId => ({
      memberId: mId,
      amount: splitAmount
    }));

    const expenseData = {
      tripId: trip.id,
      title,
      amount: numAmount,
      category,
      date: new Date().toISOString(),
      paidById,
      splitType: 'Equal' as const,
      splits,
      receiptUris: receiptUris.length > 0 ? receiptUris : undefined,
    };

    if (editId) {
      const existing = trip.expenses.find(e => e.id === editId);
      if (existing) {
        expenseData.date = existing.date;
      }
      updateExpense(trip.id, editId, expenseData);
    } else {
      addExpense(trip.id, expenseData);
    }
    
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
          {editId ? 'Edit Expense' : 'Add Expense'}
        </Text>
      </View>
      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.text }]}>What was it for?</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Tag size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="e.g. Lunch at Cafe"
            placeholderTextColor={colors.subtext}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>How much?</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>৳</Text>
          <TextInput
            style={[styles.input, { color: colors.text, fontSize: 18, fontWeight: 'bold' }]}
            placeholder="0.00"
            placeholderTextColor={colors.subtext}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton, 
                { 
                  backgroundColor: category === cat ? CategoryColors[cat] : colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, { color: category === cat ? 'white' : colors.text }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Who paid?</Text>
        <View style={styles.memberList}>
          {/* GROUP FUND OPTION */}
          <TouchableOpacity
            style={[
              styles.memberPill, 
              { 
                backgroundColor: paidById === 'group_fund' ? colors.success : colors.card,
                borderColor: paidById === 'group_fund' ? colors.success : colors.success + '50',
                borderWidth: 2
              }
            ]}
            onPress={() => {
              setPaidById('group_fund');
              setSelectedMembers(trip.members.map(m => m.id));
            }}
          >
            <View style={[styles.miniAvatar, { backgroundColor: paidById === 'group_fund' ? 'white' : colors.success }]} />
            <Text style={[styles.memberPillText, { color: paidById === 'group_fund' ? 'white' : colors.text }]}>
              Group Fund (৳{fundBalance})
            </Text>
          </TouchableOpacity>

          {trip.members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.memberPill, 
                { 
                  backgroundColor: paidById === member.id ? colors.primary : colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setPaidById(member.id)}
            >
              {member.profilePicture ? (
                <Image source={{ uri: member.profilePicture }} style={styles.miniAvatar} />
              ) : (
                <View style={[styles.miniAvatar, { backgroundColor: member.avatarColor }]} />
              )}
              <Text style={[styles.memberPillText, { color: paidById === member.id ? 'white' : colors.text }]}>
                {member.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={[styles.memberPill, { backgroundColor: colors.card, borderColor: colors.border, borderStyle: 'dashed' }]}
            onPress={() => setShowAddMember(true)}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={[styles.memberPillText, { color: colors.primary }]}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {showAddMember && (
          <View style={styles.addMemberRow}>
            <TextInput
              style={[styles.smallInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="New member name"
              value={newMemberName}
              onChangeText={setNewMemberName}
              autoFocus
            />
            <TouchableOpacity onPress={handleAddMember} style={styles.actionIcon}>
              <Check color={colors.success} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddMember(false)} style={styles.actionIcon}>
              <X color={colors.danger} size={24} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Split between</Text>
        <View style={styles.memberList}>
          {trip.members.map((member) => {
            const isSelected = selectedMembers.includes(member.id);
            return (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberPill, 
                  { 
                    backgroundColor: isSelected ? colors.secondary : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                  } else {
                    setSelectedMembers([...selectedMembers, member.id]);
                  }
                }}
              >
                <Text style={[styles.memberPillText, { color: isSelected ? 'white' : colors.text }]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.label, { color: colors.text }]}>Receipts (Optional)</Text>
          {receiptUris.length > 0 && (
            <TouchableOpacity onPress={() => setPickerModalVisible(true)} style={{ marginTop: 20 }}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add More</Text>
            </TouchableOpacity>
          )}
        </View>

        {receiptUris.length === 0 ? (
          <TouchableOpacity
            style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, borderStyle: 'dashed' }]}
            onPress={() => setPickerModalVisible(true)}
          >
            <ImageIcon size={20} color={colors.primary} />
            <Text style={[styles.input, { color: colors.subtext }]}>Attach Receipt Images</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 8 }}>
            {receiptUris.map((uri, idx) => (
              <View key={idx} style={{ marginRight: 12, position: 'relative' }}>
                <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: colors.border }} />
                <TouchableOpacity 
                  style={{ position: 'absolute', top: -8, right: -8, backgroundColor: colors.danger, borderRadius: 12, padding: 2 }}
                  onPress={() => setReceiptUris(prev => prev.filter((_, i) => i !== idx))}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10, width: 16, height: 16, textAlign: 'center', lineHeight: 16 }}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: colors.primary, opacity: (!title || !amount) ? 0.6 : 1 }]}
          onPress={handleAddExpense}
          disabled={!title || !amount}
        >
          <Text style={styles.mainButtonText}>{editId ? 'Update Expense' : 'Save Expense'}</Text>
        </TouchableOpacity>
      </View>
      
      <ImagePickerModal 
        visible={pickerModalVisible} 
        onClose={() => setPickerModalVisible(false)} 
        onCameraPress={launchCamera} 
        onGalleryPress={launchGallery} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formSection: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    margin: 4,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
  },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    overflow: 'hidden',
  },
  memberPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  smallInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  actionIcon: {
    padding: 8,
  },
  mainButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
