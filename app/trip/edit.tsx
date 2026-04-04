import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors } from '../../src/constants/Colors';
import { MapPin, Tag, Check, X, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

export default function EditTripScreen() {
  const router = useRouter();
  const { getActiveTrip, updateTrip } = useTripStore();
  const trip = getActiveTrip();
  
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setDestination(trip.destination);
      setStartDate(new Date(trip.startDate));
      setEndDate(new Date(trip.endDate));
    } else {
      router.back();
    }
  }, [trip]);

  const handleUpdate = () => {
    if (!name || !destination || !trip) return;
    
    updateTrip(trip.id, {
      name,
      destination,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    
    router.back();
  };

  const onStartChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    if (selectedDate) Haptics.selectionAsync();
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    setEndDate(currentDate);
    if (selectedDate) Haptics.selectionAsync();
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
              <Text style={[styles.input, { color: colors.text }]}>
                {startDate.toISOString().split('T')[0]}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={onStartChange}
              />
            )}
            {Platform.OS === 'ios' && showStartPicker && (
              <TouchableOpacity onPress={() => setShowStartPicker(false)} style={styles.closePickerBtn}>
                <Text style={{ color: colors.primary }}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
            <TouchableOpacity 
              style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Calendar size={18} color={colors.primary} />
              <Text style={[styles.input, { color: colors.text }]}>
                {endDate.toISOString().split('T')[0]}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="spinner"
                onChange={onEndChange}
              />
            )}
             {Platform.OS === 'ios' && showEndPicker && (
              <TouchableOpacity onPress={() => setShowEndPicker(false)} style={styles.closePickerBtn}>
                <Text style={{ color: colors.primary }}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, opacity: (!name || !destination) ? 0.6 : 1 }]}
          onPress={handleUpdate}
          disabled={!name || !destination}
        >
          <Check color="white" size={24} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Save Changes</Text>
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
  closePickerBtn: {
    alignItems: 'flex-end', 
    marginTop: 8, 
    marginRight: 8
  }
});
