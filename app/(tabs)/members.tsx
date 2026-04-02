import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors } from '../../src/constants/Colors';
import { Users, UserPlus, Pencil, Trash2, X, Check, Wallet, PiggyBank, Camera } from 'lucide-react-native';
import { getTotalSpent, getMemberContribution, getFundBalance } from '../../src/utils/settlement';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import ImagePickerModal from '../../src/components/ImagePickerModal';

export default function MembersScreen() {
  const { getActiveTrip, addMember, updateMember, removeMember, addDeposit } = useTripStore();
  const trip = getActiveTrip();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [modalVisible, setModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyMember, setHistoryMember] = useState<{ id: string; name: string } | null>(null);
  const [editingMember, setEditingMember] = useState<{ id: string; name: string; profilePicture?: string } | null>(null);
  const [inputText, setInputText] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMemberId, setDepositMemberId] = useState('');

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Please select or create a trip first.</Text>
      </View>
    );
  }

  const fundBalance = getFundBalance(trip);

  const historyData = useMemo(() => {
    if (!historyMember || !trip) return [];
    
    const memberDeposits = (trip.deposits || [])
      .filter((d) => d.memberId === historyMember.id)
      .map((d) => ({ ...d, historyType: 'deposit' as const, displayTitle: 'Group Fund Deposit' }));
      
    const memberExpenses = (trip.expenses || [])
      .filter((e) => e.paidById === historyMember.id)
      .map((e) => ({ ...e, historyType: 'expense' as const, displayTitle: `Paid: ${e.title}` }));
      
    return [...memberDeposits, ...memberExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trip, historyMember]);

  const openDepositModal = () => {
    setDepositAmount('');
    setDepositMemberId(trip.members[0]?.id || '');
    setDepositModalVisible(true);
  };

  const handleSaveDeposit = () => {
    if (!depositAmount || !depositMemberId) return;
    const amountNum = parseFloat(depositAmount);
    if (!isNaN(amountNum) && amountNum > 0) {
      addDeposit(trip.id, depositMemberId, amountNum);
    }
    setDepositModalVisible(false);
  };

  const openAddModal = () => {
    setEditingMember(null);
    setInputText('');
    setProfilePicture(undefined);
    setModalVisible(true);
  };

  const openEditModal = (member: { id: string; name: string; profilePicture?: string }) => {
    setEditingMember(member);
    setInputText(member.name);
    setProfilePicture(member.profilePicture);
    setModalVisible(true);
  };

  const launchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Permission to access camera is required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const launchGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!inputText.trim()) return;
    
    if (editingMember) {
      updateMember(trip.id, editingMember.id, inputText.trim(), profilePicture);
    } else {
      addMember(trip.id, inputText.trim(), profilePicture);
    }
    setModalVisible(false);
    setInputText('');
    setProfilePicture(undefined);
  };

  const handleDelete = (memberId: string, name: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${name} from this trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
             const prevCount = trip.members.length;
             removeMember(trip.id, memberId);
             
             // Check if deletion was blocked by the store
             setTimeout(() => {
               const updatedTrip = useTripStore.getState().trips.find(t => t.id === trip.id);
               if (updatedTrip && updatedTrip.members.length === prevCount) {
                 Alert.alert('Cannot Remove', `${name} is involved in expenses or settlements. Please remove them from expenses first.`);
               }
             }, 100);
          }
        }
      ]
    );
  };

  const renderMember = ({ item, index }: { item: any; index: number }) => {
    const contribution = getMemberContribution(trip, item.id);
    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            setHistoryMember({ id: item.id, name: item.name });
            setHistoryModalVisible(true);
          }}
        >
          <View style={styles.memberInfo}>
            {item.profilePicture ? (
              <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={[styles.memberName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.contributionText, { color: colors.primary, fontWeight: 'bold' }]}>
                Total: ৳{contribution.total.toLocaleString()}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={{ fontSize: 13, color: colors.subtext, marginRight: 12 }}>
                  Direct: ৳{contribution.direct.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 13, color: colors.subtext }}>
                  Fund: ৳{contribution.fund.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
              <Pencil size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.name)}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Manage Members</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <Users color="white" size={24} />
          <Text style={styles.statLabel}>Total Members</Text>
          <Text style={styles.statValue}>{trip.members.length}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.success }]}>
          <Wallet color="white" size={24} />
          <Text style={styles.statLabel}>Available Fund</Text>
          <Text style={styles.statValue}>৳{fundBalance.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBadge, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={openDepositModal}>
          <PiggyBank color={colors.primary} size={20} />
          <Text style={[styles.actionBadgeText, { color: colors.text }]}>Add Fund Deposit</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trip.members}
        keyExtractor={item => item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openAddModal}>
        <UserPlus color="white" size={24} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingMember ? 'Edit Member Name' : 'Add New Member'}
              </Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setInputText(''); setProfilePicture(undefined); }}>
                <X color={colors.subtext} size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setPickerModalVisible(true)} style={[styles.pickerAvatar, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.pickerAvatarImg} />
                ) : (
                  <Camera color={colors.subtext} size={32} />
                )}
              </TouchableOpacity>
              <Text style={{ marginTop: 8, color: colors.subtext, fontSize: 12 }}>Tap to set photo</Text>
            </View>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Enter member name..."
              placeholderTextColor={colors.subtext}
              value={inputText}
              onChangeText={setInputText}
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: inputText.trim() ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!inputText.trim()}
            >
              <Check color="white" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Deposit Modal */}
      <Modal visible={depositModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add to Group Fund</Text>
              <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
                <X color={colors.subtext} size={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: colors.text, marginBottom: 8, fontWeight: '600' }}>Deposit Amount (৳)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, fontSize: 20, fontWeight: 'bold' }]}
              placeholder="0.00"
              placeholderTextColor={colors.subtext}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              autoFocus
            />

            <Text style={{ color: colors.text, marginBottom: 8, fontWeight: '600' }}>Who is depositing?</Text>
            <FlatList
              data={trip.members}
              keyExtractor={item => item.id}
              style={{ maxHeight: 150, marginBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: depositMemberId === item.id ? colors.primary : colors.border,
                    backgroundColor: depositMemberId === item.id ? colors.primary + '20' : colors.background
                  }}
                  onPress={() => setDepositMemberId(item.id)}
                >
                  {item.profilePicture ? (
                    <Image source={{ uri: item.profilePicture }} style={styles.miniAvatar} />
                  ) : (
                    <View style={[styles.miniAvatar, { backgroundColor: item.avatarColor }]} />
                  )}
                  <Text style={{ color: colors.text, fontWeight: '500' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.success, opacity: depositAmount ? 1 : 0.5 }]}
              onPress={handleSaveDeposit}
              disabled={!depositAmount}
            >
              <PiggyBank color="white" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Deposit Fund</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* History Modal */}
      <Modal visible={historyModalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end', padding: 0 }]}>
          <TouchableOpacity style={styles.modalBgClose} onPress={() => setHistoryModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '70%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {historyMember?.name}'s Contributions
              </Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <X color={colors.subtext} size={24} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={historyData}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={() => (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Text style={{ color: colors.subtext, fontStyle: 'italic', marginTop: 20 }}>No contributions made by this member yet.</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16 }}>{item.displayTitle}</Text>
                    <Text style={{ color: colors.subtext, fontSize: 13, marginTop: 4 }}>
                      {new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </Text>
                  </View>
                  <Text style={{ color: item.historyType === 'deposit' ? colors.success : colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                    ৳{item.amount.toLocaleString()}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      <ImagePickerModal 
        visible={pickerModalVisible} 
        onClose={() => setPickerModalVisible(false)} 
        onCameraPress={launchCamera} 
        onGalleryPress={launchGallery} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  contributionText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBgClose: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  saveBtn: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  pickerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  pickerAvatarImg: {
    width: '100%',
    height: '100%',
  },
});
