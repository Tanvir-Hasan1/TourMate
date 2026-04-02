import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors } from '../../src/constants/Colors';
import { Plus, MapPin, ChevronRight, Users, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getSampleTrip } from '../../src/utils/sampleData';

export default function TripsScreen() {
  const { trips, setActiveTrip, addTrip, updateTrip } = useTripStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handlePreload = () => {
    const sample = getSampleTrip();
    const id = addTrip({
      name: sample.name,
      destination: sample.destination,
      startDate: sample.startDate,
      endDate: sample.endDate,
    });
    
    // Add members and expenses manually to bypass activity log flooding
    // or just let the store handle it.
    // For simplicity, we'll just update the trip object.
    updateTrip(id, {
      members: sample.members,
      expenses: sample.expenses,
    });
  };

  const renderTripItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        style={[styles.tripCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          setActiveTrip(item.id);
          router.push(`/(tabs)/dashboard`);
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.tripName, { color: colors.text }]}>{item.name}</Text>
          <ChevronRight color={colors.subtext} size={20} />
        </View>
        <View style={styles.cardDetail}>
          <MapPin size={14} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.subtext }]}>{item.destination}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.memberAvatars}>
            <Users size={14} color={colors.subtext} />
            <Text style={[styles.memberCount, { color: colors.subtext }]}>
              {item.members.length} {item.members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.subtext }]}>
            {new Date(item.startDate).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtext, marginBottom: 20 }]}>
              No trips yet. Create one to start!
            </Text>
            <TouchableOpacity 
              style={[styles.sampleButton, { borderColor: colors.primary }]}
              onPress={handlePreload}
            >
              <Sparkles size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Preload Sample Trip</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/trip/create')}
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
  tripCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingTop: 12,
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    marginLeft: 4,
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
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
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
