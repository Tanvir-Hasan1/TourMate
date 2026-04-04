import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, ScrollView, Platform, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors } from '../../src/constants/Colors';
import { Calendar, MapPin, Tag, Check, X } from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import * as Haptics from 'expo-haptics';

export default function CreateTripScreen() {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const router = useRouter();
  const { addTrip } = useTripStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatDateToLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleCreate = () => {
    if (!name || !destination) return;
    
    const id = addTrip({
      name,
      destination,
      startDate: formatDateToLocal(startDate),
      endDate: formatDateToLocal(endDate),
      deposits: [],
    });
    
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Trip Name</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Tag size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="e.g. Bandarban Tour"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Destination</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MapPin size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Where are you going?"
            placeholderTextColor={colors.subtext}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
            <TouchableOpacity 
              style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowStartPicker(true)}
            >
              <Calendar size={18} color={colors.primary} />
              <Text style={[styles.input, { color: colors.text, marginTop: Platform.OS === 'ios' ? 0 : 3 }]}>
                {formatDateToLocal(startDate)}
              </Text>
            </TouchableOpacity>
            <Modal visible={showStartPicker} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                      <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DatePicker
                    date={startDate}
                    mode="date"
                    onDateChange={(selectedDate) => {
                      setStartDate(selectedDate);
                      if (formatDateToLocal(selectedDate) > formatDateToLocal(endDate)) {
                        setEndDate(new Date(selectedDate));
                      }
                      Haptics.selectionAsync();
                    }}
                  />
                </View>
              </View>
            </Modal>
          </View>
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
            <TouchableOpacity 
              style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Calendar size={18} color={colors.primary} />
              <Text style={[styles.input, { color: colors.text, marginTop: Platform.OS === 'ios' ? 0 : 3 }]}>
                {formatDateToLocal(endDate)}
              </Text>
            </TouchableOpacity>
            <Modal visible={showEndPicker} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                      <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DatePicker
                    date={endDate}
                    mode="date"
                    onDateChange={(selectedDate) => {
                      if (formatDateToLocal(selectedDate) < formatDateToLocal(startDate)) {
                        Alert.alert('Invalid Date', 'End date cannot be earlier than the start date.');
                        setEndDate(new Date(startDate));
                      } else {
                        setEndDate(selectedDate);
                      }
                      Haptics.selectionAsync();
                    }}
                  />
                </View>
              </View>
            </Modal>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, opacity: (!name || !destination) ? 0.6 : 1 }]}
          onPress={handleCreate}
          disabled={!name || !destination}
        >
          <Check color="white" size={24} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Initialize Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.subtext }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
  },
  modalHeader: {
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingHorizontal: 20, 
    marginBottom: 10
  }
});
