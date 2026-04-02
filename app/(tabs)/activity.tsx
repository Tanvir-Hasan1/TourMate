import React from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { useTripStore } from '../../src/store/useTripStore';
import { Colors } from '../../src/constants/Colors';
import { Clock, PlusCircle, UserPlus, Trash2, CheckCircle } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

const ActivityIcon = ({ type, color }: { type: string, color: string }) => {
  switch (type) {
    case 'expense_added': return <PlusCircle color={color} size={20} />;
    case 'member_added': return <UserPlus color={color} size={20} />;
    case 'expense_deleted': return <Trash2 color={color} size={20} />;
    case 'trip_created': return <CheckCircle color={color} size={20} />;
    default: return <Clock color={color} size={20} />;
  }
};

export default function ActivityScreen() {
  const { getActiveTrip } = useTripStore();
  const trip = getActiveTrip();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.subtext }}>No trip selected.</Text>
      </View>
    );
  }

  const renderActivityItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInLeft.delay(index * 50)} style={styles.activityItem}>
      <View style={styles.timeline}>
        <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActivityIcon type={item.type} color={colors.primary} />
        </View>
        {index < trip.activities.length - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
        <Text style={[styles.time, { color: colors.subtext }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={trip.activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No activities yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 24,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 16,
    width: 40,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 32,
    paddingTop: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    marginTop: 4,
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
});
